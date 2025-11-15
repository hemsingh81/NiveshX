using AutoMapper;
using Microsoft.Extensions.Logging;
using NiveshX.Core.DTOs.Country;
using NiveshX.Core.Interfaces;
using NiveshX.Core.Interfaces.Services;
using NiveshX.Core.Models;

namespace NiveshX.Infrastructure.Services
{
    public class CountryService : ICountryService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContext _userContext;
        private readonly ILogger<CountryService> _logger;
        private readonly IMapper _mapper;

        public CountryService(IUnitOfWork unitOfWork, ILogger<CountryService> logger, IUserContext userContext, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _userContext = userContext;
            _logger = logger;
            _mapper = mapper;
        }

        public async Task<IEnumerable<CountryResponse>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Fetching all countries");
                var countries = await _unitOfWork.Countries.GetAllAsync(cancellationToken);
                return _mapper.Map<IEnumerable<CountryResponse>>(countries);
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
                return country == null ? null : _mapper.Map<CountryResponse>(country);
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

                var country = _mapper.Map<Country>(request);
                country.Id = Guid.NewGuid();
                country.IsActive = true;
                country.CreatedOn = DateTime.UtcNow;
                country.CreatedBy = _userContext.UserId;

                await _unitOfWork.Countries.AddAsync(country, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("Country created successfully: {CountryId}", country.Id);
                return _mapper.Map<CountryResponse>(country);
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

                // Map incoming request onto existing entity (won't overwrite ignored members per profile)
                _mapper.Map(request, country);

                country.ModifiedOn = DateTime.UtcNow;
                country.ModifiedBy = _userContext.UserId;

                await _unitOfWork.Countries.UpdateAsync(country, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("Country updated successfully: {CountryId}", id);
                return _mapper.Map<CountryResponse>(country);
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
    }
}
