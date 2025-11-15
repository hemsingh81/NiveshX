using AutoMapper;
using Microsoft.Extensions.Logging;
using NiveshX.Core.DTOs.ClassificationTag;
using NiveshX.Core.Interfaces;
using NiveshX.Core.Interfaces.Services;
using NiveshX.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace NiveshX.Infrastructure.Services
{
    public class ClassificationTagService : IClassificationTagService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContext _userContext;
        private readonly ILogger<ClassificationTagService> _logger;
        private readonly IMapper _mapper;

        public ClassificationTagService(
            IUnitOfWork unitOfWork,
            ILogger<ClassificationTagService> logger,
            IUserContext userContext,
            IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _userContext = userContext;
            _mapper = mapper;
        }

        public async Task<IEnumerable<ClassificationTagResponse>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Fetching all classification tags");
                var tags = await _unitOfWork.ClassificationTags.GetAllAsync(cancellationToken);
                return tags.Select(t => _mapper.Map<ClassificationTagResponse>(t));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching classification tags");
                throw;
            }
        }

        public async Task<ClassificationTagResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Fetching classification tag with ID: {TagId}", id);
                var tag = await _unitOfWork.ClassificationTags.GetByIdAsync(id, cancellationToken);
                return tag == null ? null : _mapper.Map<ClassificationTagResponse>(tag);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching classification tag with ID: {TagId}", id);
                throw;
            }
        }

        public async Task<ClassificationTagResponse> CreateAsync(CreateClassificationTagRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Creating classification tag: {Name}", request.Name);

                var tag = _mapper.Map<ClassificationTag>(request);

                tag.Id = Guid.NewGuid();
                tag.IsActive = true;
                tag.CreatedOn = DateTime.UtcNow;
                tag.CreatedBy = string.IsNullOrWhiteSpace(_userContext.UserId) ? "system" : _userContext.UserId;

                await _unitOfWork.ClassificationTags.AddAsync(tag, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("Classification tag created successfully: {TagId}", tag.Id);
                return _mapper.Map<ClassificationTagResponse>(tag);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating classification tag: {Name}", request.Name);
                throw;
            }
        }

        public async Task<ClassificationTagResponse?> UpdateAsync(Guid id, UpdateClassificationTagRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Updating classification tag with ID: {TagId}", id);
                var tag = await _unitOfWork.ClassificationTags.GetByIdAsync(id, cancellationToken);
                if (tag == null)
                {
                    _logger.LogWarning("Classification tag not found for update: {TagId}", id);
                    return null;
                }

                _mapper.Map(request, tag);

                tag.ModifiedOn = DateTime.UtcNow;
                tag.ModifiedBy = string.IsNullOrWhiteSpace(_userContext.UserId) ? "system" : _userContext.UserId;

                await _unitOfWork.ClassificationTags.UpdateAsync(tag, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("Classification tag updated successfully: {TagId}", id);
                return _mapper.Map<ClassificationTagResponse>(tag);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating classification tag with ID: {TagId}", id);
                throw;
            }
        }

        public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Deleting classification tag with ID: {TagId}", id);
                var success = await _unitOfWork.ClassificationTags.DeleteAsync(id, cancellationToken);
                if (success)
                {
                    await _unitOfWork.SaveChangesAsync(cancellationToken);
                    _logger.LogInformation("Classification tag deleted: {TagId}", id);
                }
                else
                {
                    _logger.LogWarning("Classification tag not found for deletion: {TagId}", id);
                }

                return success;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting classification tag with ID: {TagId}", id);
                throw;
            }
        }
    }
}
