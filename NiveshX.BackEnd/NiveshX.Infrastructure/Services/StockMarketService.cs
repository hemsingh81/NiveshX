using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using NiveshX.Core.DTOs.StockMarket;
using NiveshX.Core.Exceptions;
using NiveshX.Core.Interfaces;
using NiveshX.Core.Interfaces.Services;
using NiveshX.Core.Models;

namespace NiveshX.Infrastructure.Services
{
    public class StockMarketService : BaseService, IStockMarketService
    {
        public StockMarketService(
            IUnitOfWork unitOfWork,
            ILogger<StockMarketService> logger,
            IUserContext userContext,
            IMapper mapper)
            : base(unitOfWork, logger, userContext, mapper)
        {
        }

        public async Task<IEnumerable<StockMarketResponse>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var models = await UnitOfWork.StockMarkets.GetAllAsync(cancellationToken);
            return Mapper.Map<IEnumerable<StockMarketResponse>>(models);
        }

        public async Task<StockMarketResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var model = await UnitOfWork.StockMarkets.GetByIdAsync(id, cancellationToken);
            return model == null ? null : Mapper.Map<StockMarketResponse>(model);
        }

        public async Task<StockMarketResponse> CreateAsync(CreateStockMarketRequest request, CancellationToken cancellationToken = default)
        {
            // validate country exists
            if (request.CountryId == null || request.CountryId == Guid.Empty)
                throw new InvalidOperationException("CountryId is required.");

            var country = await UnitOfWork.Countries.GetByIdAsync(request.CountryId.Value, cancellationToken)
                          ?? throw new NotFoundException($"Country not found: {request.CountryId}");

            // uniqueness check: same Name or Code in same Country
            var exists = await UnitOfWork.StockMarkets.ExistsAsync(request.Name, request.Code, request.CountryId.Value, cancellationToken);
            if (exists)
                throw new DuplicateEntityException("A stock market with the same name or code already exists for the selected country");

            var entity = Mapper.Map<StockMarket>(request);
            entity.Country = country;

            // populate audit fields
            SetCreatedAudit(entity);

            await UnitOfWork.StockMarkets.AddAsync(entity, cancellationToken);
            await UnitOfWork.SaveChangesAsync(cancellationToken);

            // reload to include navigation if needed
            var created = await UnitOfWork.StockMarkets.GetByIdAsync(entity.Id, cancellationToken)
                         ?? throw new InvalidOperationException("Failed to retrieve created stock market.");

            return Mapper.Map<StockMarketResponse>(created);
        }

        public async Task<StockMarketResponse?> UpdateAsync(Guid id, UpdateStockMarketRequest request, CancellationToken cancellationToken = default)
        {
            var entity = await UnitOfWork.StockMarkets.GetByIdAsync(id, cancellationToken)
                         ?? throw new NotFoundException($"Stock market not found: {id}");

            // validate country exists
            var country = await UnitOfWork.Countries.GetByIdAsync(request.CountryId, cancellationToken)
                          ?? throw new NotFoundException($"Country not found: {request.CountryId}");

            // uniqueness check excluding current id
            var duplicate = await UnitOfWork.StockMarkets.ExistsAsync(request.Name, request.Code, request.CountryId, excludeId: id, cancellationToken);
            if (duplicate)
                throw new DuplicateEntityException("A stock market with the same name or code already exists for the selected country");

            Mapper.Map(request, entity);
            entity.Country = country;

            // set audit info
            SetModifiedAudit(entity);

            await UnitOfWork.StockMarkets.UpdateAsync(entity, cancellationToken);
            await UnitOfWork.SaveChangesAsync(cancellationToken);

            var updated = await UnitOfWork.StockMarkets.GetByIdAsync(id, cancellationToken)
                          ?? throw new InvalidOperationException("Failed to retrieve updated stock market.");

            return Mapper.Map<StockMarketResponse>(updated);
        }

        public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var entity = await UnitOfWork.StockMarkets.GetByIdAsync(id, cancellationToken)
                         ?? throw new NotFoundException($"Stock market not found: {id}");

            // soft-delete and set audit fields
            entity.IsDeleted = true;
            SetModifiedAudit(entity);

            await UnitOfWork.StockMarkets.UpdateAsync(entity, cancellationToken);
            await UnitOfWork.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
