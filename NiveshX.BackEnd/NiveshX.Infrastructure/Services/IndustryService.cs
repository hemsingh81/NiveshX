using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using NiveshX.Core.DTOs.Industry;
using NiveshX.Core.Exceptions;
using NiveshX.Core.Interfaces;
using NiveshX.Core.Interfaces.Services;
using NiveshX.Core.Models;

namespace NiveshX.Infrastructure.Services
{
    public class IndustryService : BaseService, IIndustryService
    {
        public IndustryService(
            IUnitOfWork unitOfWork,
            ILogger<IndustryService> logger,
            IUserContext userContext,
            IMapper mapper)
            : base(unitOfWork, logger, userContext, mapper)
        {
        }

        public async Task<IEnumerable<IndustryResponse>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                Logger.LogInformation("Fetching all industries");
                var industries = await UnitOfWork.Industries.GetAllAsync(cancellationToken);
                return industries.Select(i => Mapper.Map<IndustryResponse>(i));
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error fetching industries");
                throw;
            }
        }

        public async Task<IndustryResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            try
            {
                Logger.LogInformation("Fetching industry with ID: {IndustryId}", id);
                var industry = await UnitOfWork.Industries.GetByIdAsync(id, cancellationToken);
                return industry == null ? null : Mapper.Map<IndustryResponse>(industry);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error fetching industry with ID: {IndustryId}", id);
                throw;
            }
        }

        public async Task<IndustryResponse> CreateAsync(CreateIndustryRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                Logger.LogInformation("Creating industry: {Name}", request.Name);

                var exists = await UnitOfWork.Industries.ExistsAsync(request.Name, cancellationToken);
                if (exists)
                    throw new DuplicateEntityException($"An industry with the name '{request.Name}' already exists.");

                var industry = Mapper.Map<Industry>(request);

                // populate audit fields using BaseService helper
                SetCreatedAudit(industry);

                await UnitOfWork.Industries.AddAsync(industry, cancellationToken);
                await UnitOfWork.SaveChangesAsync(cancellationToken);

                Logger.LogInformation("Industry created successfully: {IndustryId}", industry.Id);
                return Mapper.Map<IndustryResponse>(industry);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error creating industry: {Name}", request.Name);
                throw;
            }
        }

        public async Task<IndustryResponse?> UpdateAsync(Guid id, UpdateIndustryRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                Logger.LogInformation("Updating industry with ID: {IndustryId}", id);
                var industry = await UnitOfWork.Industries.GetByIdAsync(id, cancellationToken);
                if (industry == null)
                    throw new NotFoundException($"Industry not found for update: {id}.");

                var duplicate = await UnitOfWork.Industries.ExistsAsync(request.Name, excludeId: id, cancellationToken);
                if (duplicate)
                    throw new DuplicateEntityException($"An industry with the name '{request.Name}' already exists.");

                Mapper.Map(request, industry);

                // set audit info
                SetModifiedAudit(industry);

                await UnitOfWork.Industries.UpdateAsync(industry, cancellationToken);
                await UnitOfWork.SaveChangesAsync(cancellationToken);

                Logger.LogInformation("Industry updated successfully: {IndustryId}", id);
                return Mapper.Map<IndustryResponse>(industry);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error updating industry with ID: {IndustryId}", id);
                throw;
            }
        }

        public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            try
            {
                Logger.LogInformation("Deleting industry with ID: {IndustryId}", id);

                var industry = await UnitOfWork.Industries.GetByIdAsync(id, cancellationToken)
                              ?? throw new NotFoundException($"Industry not found for deletion: {id}.");

                // mark soft-deleted and set audit info
                industry.IsDeleted = true;
                SetModifiedAudit(industry);

                await UnitOfWork.Industries.UpdateAsync(industry, cancellationToken);
                await UnitOfWork.SaveChangesAsync(cancellationToken);

                Logger.LogInformation("Industry deleted: {IndustryId}", id);
                return true;
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error deleting industry with ID: {IndustryId}", id);
                throw;
            }
        }
    }
}
