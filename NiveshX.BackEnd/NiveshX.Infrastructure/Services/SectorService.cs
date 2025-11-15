using Microsoft.Extensions.Logging;
using NiveshX.Core.DTOs.Sector;
using NiveshX.Core.Interfaces;
using NiveshX.Core.Interfaces.Services;
using NiveshX.Core.Models;

namespace NiveshX.Infrastructure.Services
{
    public class SectorService : ISectorService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContext _userContext;
        private readonly ILogger<SectorService> _logger;

        public SectorService(IUnitOfWork unitOfWork, ILogger<SectorService> logger, IUserContext userContext)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _userContext = userContext;
        }

        public async Task<IEnumerable<SectorResponse>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Fetching all sectors");
                var sectors = await _unitOfWork.Sectors.GetAllAsync(cancellationToken);
                return sectors.Select(MapToResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching sectors");
                throw;
            }
        }

        public async Task<SectorResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Fetching sector with ID: {SectorId}", id);
                var sector = await _unitOfWork.Sectors.GetByIdAsync(id, cancellationToken);
                return sector == null ? null : MapToResponse(sector);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching sector with ID: {SectorId}", id);
                throw;
            }
        }

        public async Task<SectorResponse> CreateAsync(CreateSectorRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Creating sector: {Name}", request.Name);
                var sector = new Sector
                {
                    Id = Guid.NewGuid(),
                    Name = request.Name,
                    Description = request.Description,
                    IsActive = true,
                    CreatedOn = DateTime.UtcNow,
                    CreatedBy = _userContext.UserId
                };

                await _unitOfWork.Sectors.AddAsync(sector, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
                return MapToResponse(sector);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating sector: {Name}", request.Name);
                throw;
            }
        }

        public async Task<SectorResponse?> UpdateAsync(Guid id, UpdateSectorRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Updating sector with ID: {SectorId}", id);
                var sector = await _unitOfWork.Sectors.GetByIdAsync(id, cancellationToken);
                if (sector == null)
                {
                    _logger.LogWarning("Sector not found for update: {SectorId}", id);
                    return null;
                }

                sector.Name = request.Name;
                sector.Description = request.Description;
                sector.IsActive = request.IsActive;
                sector.ModifiedOn = DateTime.UtcNow;
                sector.ModifiedBy = _userContext.UserId;

                await _unitOfWork.Sectors.UpdateAsync(sector, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
                return MapToResponse(sector);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating sector with ID: {SectorId}", id);
                throw;
            }
        }

        public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Deleting sector with ID: {SectorId}", id);
                var success = await _unitOfWork.Sectors.DeleteAsync(id, cancellationToken);
                if (success)
                {
                    await _unitOfWork.SaveChangesAsync(cancellationToken);
                    _logger.LogInformation("Sector deleted: {SectorId}", id);
                }
                else
                {
                    _logger.LogWarning("Sector not found for deletion: {SectorId}", id);
                }

                return success;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting sector with ID: {SectorId}", id);
                throw;
            }
        }

        private static SectorResponse MapToResponse(Sector sector) => new()
        {
            Id = sector.Id,
            Name = sector.Name,
            Description = sector.Description,
            IsActive = sector.IsActive
        };
    }

}
