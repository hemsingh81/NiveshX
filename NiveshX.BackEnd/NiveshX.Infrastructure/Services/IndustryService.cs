using AutoMapper;
using Microsoft.Extensions.Logging;
using NiveshX.Core.DTOs.Industry;
using NiveshX.Core.Exceptions;
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
    public class IndustryService : IIndustryService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContext _userContext;
        private readonly ILogger<IndustryService> _logger;
        private readonly IMapper _mapper;

        public IndustryService(
            IUnitOfWork unitOfWork,
            ILogger<IndustryService> logger,
            IUserContext userContext,
            IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _userContext = userContext;
            _mapper = mapper;
        }

        public async Task<IEnumerable<IndustryResponse>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Fetching all industries");
                var industries = await _unitOfWork.Industries.GetAllAsync(cancellationToken);
                return industries.Select(i => _mapper.Map<IndustryResponse>(i));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching industries");
                throw;
            }
        }

        public async Task<IndustryResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Fetching industry with ID: {IndustryId}", id);
                var industry = await _unitOfWork.Industries.GetByIdAsync(id, cancellationToken);
                return industry == null ? null : _mapper.Map<IndustryResponse>(industry);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching industry with ID: {IndustryId}", id);
                throw;
            }
        }

        public async Task<IndustryResponse> CreateAsync(CreateIndustryRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Creating industry: {Name}", request.Name);

                var exists = await _unitOfWork.Industries.ExistsAsync(request.Name, cancellationToken);
                if (exists)
                    throw new DuplicateEntityException($"An industry with the name '{request.Name}' already exists.");

                var industry = _mapper.Map<Industry>(request);

                industry.Id = Guid.NewGuid();
                industry.IsActive = true;
                industry.CreatedOn = DateTime.UtcNow;
                industry.CreatedBy = string.IsNullOrWhiteSpace(_userContext.UserId) ? "system" : _userContext.UserId;

                await _unitOfWork.Industries.AddAsync(industry, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("Industry created successfully: {IndustryId}", industry.Id);
                return _mapper.Map<IndustryResponse>(industry);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating industry: {Name}", request.Name);
                throw;
            }
        }

        public async Task<IndustryResponse?> UpdateAsync(Guid id, UpdateIndustryRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Updating industry with ID: {IndustryId}", id);
                var industry = await _unitOfWork.Industries.GetByIdAsync(id, cancellationToken);
                if (industry == null)
                {
                    _logger.LogWarning("Industry not found for update: {IndustryId}", id);
                    return null;
                }

                var duplicate = await _unitOfWork.Industries.ExistsAsync(request.Name, excludeId: id, cancellationToken);
                if (duplicate)
                    throw new DuplicateEntityException($"An industry with the name '{request.Name}' already exists.");

                _mapper.Map(request, industry);

                industry.ModifiedOn = DateTime.UtcNow;
                industry.ModifiedBy = string.IsNullOrWhiteSpace(_userContext.UserId) ? "system" : _userContext.UserId;

                await _unitOfWork.Industries.UpdateAsync(industry, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("Industry updated successfully: {IndustryId}", id);
                return _mapper.Map<IndustryResponse>(industry);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating industry with ID: {IndustryId}", id);
                throw;
            }
        }

        public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Deleting industry with ID: {IndustryId}", id);
                var success = await _unitOfWork.Industries.DeleteAsync(id, cancellationToken);
                if (success)
                {
                    await _unitOfWork.SaveChangesAsync(cancellationToken);
                    _logger.LogInformation("Industry deleted: {IndustryId}", id);
                }
                else
                {
                    _logger.LogWarning("Industry not found for deletion: {IndustryId}", id);
                }

                return success;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting industry with ID: {IndustryId}", id);
                throw;
            }
        }
    }
}
