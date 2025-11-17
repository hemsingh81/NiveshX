using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using NiveshX.Core.DTOs.Sector;
using NiveshX.Core.Exceptions;
using NiveshX.Core.Interfaces;
using NiveshX.Core.Interfaces.Services;
using NiveshX.Core.Models;

namespace NiveshX.Infrastructure.Services
{
    public class SectorService : BaseService, ISectorService
    {
        public SectorService(
            IUnitOfWork unitOfWork,
            ILogger<SectorService> logger,
            IUserContext userContext,
            IMapper mapper)
            : base(unitOfWork, logger, userContext, mapper)
        {
        }

        public async Task<IEnumerable<SectorResponse>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                Logger.LogInformation("Fetching all sectors");
                var sectors = await UnitOfWork.Sectors.GetAllAsync(cancellationToken);
                return sectors.Select(s => Mapper.Map<SectorResponse>(s));
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error fetching sectors");
                throw;
            }
        }

        public async Task<SectorResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            try
            {
                Logger.LogInformation("Fetching sector with ID: {SectorId}", id);
                var sector = await UnitOfWork.Sectors.GetByIdAsync(id, cancellationToken);
                return sector == null ? null : Mapper.Map<SectorResponse>(sector);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error fetching sector with ID: {SectorId}", id);
                throw;
            }
        }

        public async Task<SectorResponse> CreateAsync(CreateSectorRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                Logger.LogInformation("Creating sector: {Name}", request.Name);

                var exists = await UnitOfWork.Sectors.ExistsAsync(request.Name, cancellationToken);
                if (exists)
                    throw new DuplicateEntityException($"A sector with the name '{request.Name}' already exists.");

                var sector = Mapper.Map<Sector>(request);

                // populate audit fields using BaseService helper
                SetCreatedAudit(sector);

                await UnitOfWork.Sectors.AddAsync(sector, cancellationToken);
                await UnitOfWork.SaveChangesAsync(cancellationToken);

                Logger.LogInformation("Sector created successfully: {SectorId}", sector.Id);
                return Mapper.Map<SectorResponse>(sector);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error creating sector: {Name}", request.Name);
                throw;
            }
        }

        public async Task<SectorResponse?> UpdateAsync(Guid id, UpdateSectorRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                Logger.LogInformation("Updating sector with ID: {SectorId}", id);
                var sector = await UnitOfWork.Sectors.GetByIdAsync(id, cancellationToken);
                if (sector == null)
                    throw new NotFoundException($"Sector not found for update: {id}.");

                var duplicate = await UnitOfWork.Sectors.ExistsAsync(request.Name, excludeId: id, cancellationToken);
                if (duplicate)
                    throw new DuplicateEntityException($"A sector with the name '{request.Name}' already exists.");

                Mapper.Map(request, sector);

                // set audit info
                SetModifiedAudit(sector);

                await UnitOfWork.Sectors.UpdateAsync(sector, cancellationToken);
                await UnitOfWork.SaveChangesAsync(cancellationToken);

                Logger.LogInformation("Sector updated successfully: {SectorId}", id);
                return Mapper.Map<SectorResponse>(sector);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error updating sector with ID: {SectorId}", id);
                throw;
            }
        }

        public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            try
            {
                Logger.LogInformation("Deleting sector with ID: {SectorId}", id);

                var sector = await UnitOfWork.Sectors.GetByIdAsync(id, cancellationToken)
                             ?? throw new NotFoundException($"Sector not found for deletion: {id}.");

                // mark soft-deleted and set audit info
                sector.IsDeleted = true;
                SetModifiedAudit(sector);

                await UnitOfWork.Sectors.UpdateAsync(sector, cancellationToken);
                await UnitOfWork.SaveChangesAsync(cancellationToken);

                Logger.LogInformation("Sector deleted: {SectorId}", id);
                return true;
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error deleting sector with ID: {SectorId}", id);
                throw;
            }
        }
    }
}
