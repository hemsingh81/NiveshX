using Microsoft.Extensions.Logging;
using NiveshX.Core.DTOs.Industry;
using NiveshX.Core.Interfaces;
using NiveshX.Core.Interfaces.Services;
using NiveshX.Core.Models;

namespace NiveshX.Infrastructure.Services
{
    public class IndustryService : IIndustryService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContext _userContext;
        private readonly ILogger<IndustryService> _logger;

        public IndustryService(IUnitOfWork unitOfWork, ILogger<IndustryService> logger, IUserContext userContext)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _userContext = userContext;
        }

        public async Task<IEnumerable<IndustryResponse>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Fetching all industries");
                var industries = await _unitOfWork.Industries.GetAllAsync(cancellationToken);
                return industries.Select(MapToResponse);
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
                return industry == null ? null : MapToResponse(industry);
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
                var industry = new Industry
                {
                    Id = Guid.NewGuid(),
                    Name = request.Name,
                    Description = request.Description,
                    IsActive = true,
                    CreatedOn = DateTime.UtcNow,
                    CreatedBy = _userContext.UserId
                };

                await _unitOfWork.Industries.AddAsync(industry, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
                return MapToResponse(industry);
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

                industry.Name = request.Name;
                industry.Description = request.Description;
                industry.IsActive = request.IsActive;
                industry.ModifiedOn = DateTime.UtcNow;
                industry.ModifiedBy = _userContext.UserId;

                await _unitOfWork.Industries.UpdateAsync(industry, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
                return MapToResponse(industry);
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

        private static IndustryResponse MapToResponse(Industry industry) => new()
        {
            Id = industry.Id,
            Name = industry.Name,
            Description = industry.Description,
            IsActive = industry.IsActive
        };
    }

}
