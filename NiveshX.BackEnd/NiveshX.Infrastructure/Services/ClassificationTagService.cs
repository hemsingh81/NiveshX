using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using NiveshX.Core.DTOs.ClassificationTag;
using NiveshX.Core.Exceptions;
using NiveshX.Core.Interfaces;
using NiveshX.Core.Interfaces.Services;
using NiveshX.Core.Models;

namespace NiveshX.Infrastructure.Services
{
    public class ClassificationTagService : BaseService, IClassificationTagService
    {
        public ClassificationTagService(
            IUnitOfWork unitOfWork,
            ILogger<ClassificationTagService> logger,
            IUserContext userContext,
            IMapper mapper)
            : base(unitOfWork, logger, userContext, mapper)
        {
        }

        public async Task<IEnumerable<ClassificationTagResponse>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                Logger.LogInformation("Fetching all classification tags");
                var tags = await UnitOfWork.ClassificationTags.GetAllAsync(cancellationToken);
                return tags.Select(t => Mapper.Map<ClassificationTagResponse>(t));
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error fetching classification tags");
                throw;
            }
        }

        public async Task<ClassificationTagResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            try
            {
                Logger.LogInformation("Fetching classification tag with ID: {TagId}", id);
                var tag = await UnitOfWork.ClassificationTags.GetByIdAsync(id, cancellationToken);
                return tag == null ? null : Mapper.Map<ClassificationTagResponse>(tag);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error fetching classification tag with ID: {TagId}", id);
                throw;
            }
        }

        public async Task<ClassificationTagResponse> CreateAsync(CreateClassificationTagRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                Logger.LogInformation("Creating classification tag: {Name}", request.Name);

                // uniqueness check
                var exists = await UnitOfWork.ClassificationTags.ExistsAsync(request.Name, cancellationToken);
                if (exists)
                    throw new DuplicateEntityException($"A classification tag with the name '{request.Name}' already exists.");

                var tag = Mapper.Map<ClassificationTag>(request);

                // populate audit fields using BaseService helper
                SetCreatedAudit(tag);

                await UnitOfWork.ClassificationTags.AddAsync(tag, cancellationToken);
                await UnitOfWork.SaveChangesAsync(cancellationToken);

                Logger.LogInformation("Classification tag created successfully: {TagId}", tag.Id);
                return Mapper.Map<ClassificationTagResponse>(tag);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error creating classification tag: {Name}", request.Name);
                throw;
            }
        }

        public async Task<ClassificationTagResponse?> UpdateAsync(Guid id, UpdateClassificationTagRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                Logger.LogInformation("Updating classification tag with ID: {TagId}", id);
                var tag = await UnitOfWork.ClassificationTags.GetByIdAsync(id, cancellationToken);
                if (tag == null)
                    throw new NotFoundException($"Classification tag not found for update: {id}.");

                // uniqueness check excluding current id
                var duplicate = await UnitOfWork.ClassificationTags.ExistsAsync(request.Name, id, cancellationToken);
                if (duplicate)
                    throw new DuplicateEntityException($"A classification tag with the name '{request.Name}' already exists.");

                Mapper.Map(request, tag);

                // set audit info
                SetModifiedAudit(tag);

                await UnitOfWork.ClassificationTags.UpdateAsync(tag, cancellationToken);
                await UnitOfWork.SaveChangesAsync(cancellationToken);

                Logger.LogInformation("Classification tag updated successfully: {TagId}", id);
                return Mapper.Map<ClassificationTagResponse>(tag);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error updating classification tag with ID: {TagId}", id);
                throw;
            }
        }

        public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            try
            {
                Logger.LogInformation("Deleting classification tag with ID: {TagId}", id);

                var tag = await UnitOfWork.ClassificationTags.GetByIdAsync(id, cancellationToken)
                          ?? throw new NotFoundException($"Classification tag not found for deletion: {id}.");

                // mark soft-deleted and set audit info
                tag.IsDeleted = true;
                SetModifiedAudit(tag);

                await UnitOfWork.ClassificationTags.UpdateAsync(tag, cancellationToken);
                await UnitOfWork.SaveChangesAsync(cancellationToken);

                Logger.LogInformation("Classification tag deleted: {TagId}", id);
                return true;
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error deleting classification tag with ID: {TagId}", id);
                throw;
            }
        }
    }
}
