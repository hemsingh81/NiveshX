using Microsoft.Extensions.Logging;
using NiveshX.Core.DTOs.Country;
using NiveshX.Core.Interfaces;
using NiveshX.Core.Interfaces.Services;
using NiveshX.Core.Models;

namespace NiveshX.Infrastructure.Services
{
    public class CountryManagementService : ICountryManagementService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContext _userContext;
        private readonly ILogger<CountryManagementService> _logger;

        public CountryManagementService(IUnitOfWork unitOfWork, ILogger<CountryManagementService> logger, IUserContext userContext)
        {
            _unitOfWork = unitOfWork;
            _userContext = userContext;
            _logger = logger;
        }

        public async Task<IEnumerable<CountryResponse>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Fetching all countries");
                var countries = await _unitOfWork.Countries.GetAllAsync(cancellationToken);
                return countries.Select(MapToResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching countries");
                throw;
            }
        }

        public async Task<CountryResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Fetching country with ID: {CountryId}", id);
                var country = await _unitOfWork.Countries.GetByIdAsync(id, cancellationToken);
                return country == null ? null : MapToResponse(country);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching country with ID: {CountryId}", id);
                throw;
            }
        }

        public async Task<CountryResponse> CreateAsync(CreateCountryRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Creating new country: {Code}", request.Code);

                var country = new Country
                {
                    Id = Guid.NewGuid(),
                    Name = request.Name,
                    Code = request.Code,
                    IsActive = true,
                    CreatedOn = DateTime.UtcNow,
                    CreatedBy = _userContext.UserId
                };

                await _unitOfWork.Countries.AddAsync(country, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("Country created successfully: {CountryId}", country.Id);
                return MapToResponse(country);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating country: {Code}", request.Code);
                throw;
            }
        }

        public async Task<CountryResponse?> UpdateAsync(Guid id, UpdateCountryRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Updating country with ID: {CountryId}", id);
                var country = await _unitOfWork.Countries.GetByIdAsync(id, cancellationToken);
                if (country == null)
                {
                    _logger.LogWarning("Country not found for update: {CountryId}", id);
                    return null;
                }

                country.Name = request.Name;
                country.Code = request.Code;
                country.IsActive = request.IsActive;
                country.ModifiedOn = DateTime.UtcNow;
                country.ModifiedBy = _userContext.UserId;

                await _unitOfWork.Countries.UpdateAsync(country, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("Country updated successfully: {CountryId}", id);
                return MapToResponse(country);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating country with ID: {CountryId}", id);
                throw;
            }
        }

        public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Attempting to delete country with ID: {CountryId}", id);
                var success = await _unitOfWork.Countries.DeleteAsync(id, cancellationToken);
                if (success)
                {
                    await _unitOfWork.SaveChangesAsync(cancellationToken);
                    _logger.LogInformation("Country deleted successfully: {CountryId}", id);
                }
                else
                {
                    _logger.LogWarning("Country not found for deletion: {CountryId}", id);
                }

                return success;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting country with ID: {CountryId}", id);
                throw;
            }
        }

        private static CountryResponse MapToResponse(Country country) => new()
        {
            Id = country.Id,
            Name = country.Name,
            Code = country.Code,
            IsActive = country.IsActive
        };
    }
}
