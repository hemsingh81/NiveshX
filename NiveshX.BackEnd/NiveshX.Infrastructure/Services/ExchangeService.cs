using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using NiveshX.Core.DTOs.Exchange;
using NiveshX.Core.Exceptions;
using NiveshX.Core.Interfaces;
using NiveshX.Core.Interfaces.Services;
using NiveshX.Core.Models;

namespace NiveshX.Infrastructure.Services
{
    public class ExchangeService : BaseService, IExchangeService
    {
        public ExchangeService(
            IUnitOfWork unitOfWork,
            ILogger<ExchangeService> logger,
            IUserContext userContext,
            IMapper mapper)
            : base(unitOfWork, logger, userContext, mapper)
        {
        }

        public async Task<IEnumerable<ExchangeResponse>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var models = await UnitOfWork.Exchanges.GetAllAsync(cancellationToken);
            return Mapper.Map<IEnumerable<ExchangeResponse>>(models);
        }

        public async Task<ExchangeResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var model = await UnitOfWork.Exchanges.GetByIdAsync(id, cancellationToken);
            return model == null ? null : Mapper.Map<ExchangeResponse>(model);
        }

        public async Task<ExchangeResponse> CreateAsync(CreateExchangeRequest request, CancellationToken cancellationToken = default)
        {
            // validate country exists
            if (request.CountryId == null || request.CountryId == Guid.Empty)
                throw new InvalidOperationException("CountryId is required.");

            var country = await UnitOfWork.Countries.GetByIdAsync(request.CountryId.Value, cancellationToken)
                          ?? throw new NotFoundException($"Country not found: {request.CountryId}");

            // uniqueness check: same Name or Code in same Country
            var exists = await UnitOfWork.Exchanges.ExistsAsync(request.Name, request.Code, request.CountryId.Value, cancellationToken);
            if (exists)
                throw new DuplicateEntityException("A stock market with the same name or code already exists for the selected country");

            var entity = Mapper.Map<Exchange>(request);
            entity.Country = country;

            // populate audit fields
            SetCreatedAudit(entity);

            await UnitOfWork.Exchanges.AddAsync(entity, cancellationToken);
            await UnitOfWork.SaveChangesAsync(cancellationToken);

            // reload to include navigation if needed
            var created = await UnitOfWork.Exchanges.GetByIdAsync(entity.Id, cancellationToken)
                         ?? throw new InvalidOperationException("Failed to retrieve created stock market.");

            return Mapper.Map<ExchangeResponse>(created);
        }

        public async Task<ExchangeResponse?> UpdateAsync(Guid id, UpdateExchangeRequest request, CancellationToken cancellationToken = default)
        {
            var entity = await UnitOfWork.Exchanges.GetByIdAsync(id, cancellationToken)
                         ?? throw new NotFoundException($"Stock market not found: {id}");

            // validate country exists
            var country = await UnitOfWork.Countries.GetByIdAsync(request.CountryId, cancellationToken)
                          ?? throw new NotFoundException($"Country not found: {request.CountryId}");

            // uniqueness check excluding current id
            var duplicate = await UnitOfWork.Exchanges.ExistsAsync(request.Name, request.Code, request.CountryId, excludeId: id, cancellationToken);
            if (duplicate)
                throw new DuplicateEntityException("A stock market with the same name or code already exists for the selected country");

            Mapper.Map(request, entity);
            entity.Country = country;

            // set audit info
            SetModifiedAudit(entity);

            await UnitOfWork.Exchanges.UpdateAsync(entity, cancellationToken);
            await UnitOfWork.SaveChangesAsync(cancellationToken);

            var updated = await UnitOfWork.Exchanges.GetByIdAsync(id, cancellationToken)
                          ?? throw new InvalidOperationException("Failed to retrieve updated stock market.");

            return Mapper.Map<ExchangeResponse>(updated);
        }

        public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var entity = await UnitOfWork.Exchanges.GetByIdAsync(id, cancellationToken)
                         ?? throw new NotFoundException($"Stock market not found: {id}");

            // soft-delete and set audit fields
            entity.IsDeleted = true;
            SetModifiedAudit(entity);

            await UnitOfWork.Exchanges.UpdateAsync(entity, cancellationToken);
            await UnitOfWork.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
