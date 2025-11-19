using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NiveshX.Core.DTOs;
using NiveshX.Core.Exceptions;
using NiveshX.Core.Interfaces;
using NiveshX.Core.Interfaces.Repositories;
using NiveshX.Core.Interfaces.Services;
using NiveshX.Core.Models;

namespace NiveshX.Infrastructure.Services
{
    public class MarketCalendarService : BaseService, IMarketCalendarService
    {
        private readonly IMarketCalendarRepository _marketCalendarRepo;
        private readonly IExchangeRepository _exchangeRepo;

        public MarketCalendarService(
            IUnitOfWork unitOfWork,
            ILogger<MarketCalendarService> logger,
            IUserContext userContext,
            IMapper mapper)
            : base(unitOfWork, logger, userContext, mapper)
        {
            _marketCalendarRepo = UnitOfWork.MarketCalendars;
            _exchangeRepo = UnitOfWork.Exchanges;
        }

        public async Task<IEnumerable<MarketCalendarResponse>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var list = await _marketCalendarRepo.GetAllAsync(cancellationToken);
            return Mapper.Map<IEnumerable<MarketCalendarResponse>>(list);
        }

        public async Task<IEnumerable<MarketCalendarResponse>> GetAllIncludingDeletedAsync(CancellationToken cancellationToken = default)
        {
            var list = await _marketCalendarRepo.GetAllIncludingDeletedAsync(cancellationToken);
            return Mapper.Map<IEnumerable<MarketCalendarResponse>>(list);
        }

        public async Task<IEnumerable<MarketCalendarResponse>> GetAllByExchangeAsync(Guid exchangeId, CancellationToken cancellationToken = default)
        {
            var list = await _marketCalendarRepo.GetAllByExchangeAsync(exchangeId, cancellationToken);
            return Mapper.Map<IEnumerable<MarketCalendarResponse>>(list);
        }

        public async Task<MarketCalendarResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var entity = await _marketCalendarRepo.GetByIdAsync(id, cancellationToken);
            return entity == null ? null : Mapper.Map<MarketCalendarResponse>(entity);
        }

        public async Task<MarketCalendarResponse> CreateAsync(CreateMarketCalendarRequest request, CancellationToken cancellationToken = default)
        {
            var exchange = await _exchangeRepo.GetByIdAsync(request.ExchangeId, cancellationToken)
                          ?? throw new NotFoundException($"Exchange not found: {request.ExchangeId}");

            if (await _marketCalendarRepo.ExistsForExchangeAsync(request.ExchangeId, cancellationToken))
                throw new DuplicateEntityException("A market calendar already exists for this exchange");

            var entity = Mapper.Map<MarketCalendar>(request);
            entity.ExchangeId = request.ExchangeId;

            SetCreatedAudit(entity);

            await _marketCalendarRepo.AddAsync(entity, cancellationToken);
            await UnitOfWork.SaveChangesAsync(cancellationToken);

            var created = await _marketCalendarRepo.GetByIdAsync(entity.Id, cancellationToken)
                          ?? throw new InvalidOperationException("Failed to retrieve created market calendar");

            return Mapper.Map<MarketCalendarResponse>(created);
        }

        public async Task<MarketCalendarResponse?> UpdateAsync(Guid id, UpdateMarketCalendarRequest request, CancellationToken cancellationToken = default)
        {
            var entity = await _marketCalendarRepo.GetByIdAsync(id, cancellationToken)
                         ?? throw new NotFoundException($"Market calendar not found: {id}");

            var exchange = await _exchangeRepo.GetByIdAsync(request.ExchangeId, cancellationToken)
                         ?? throw new NotFoundException($"Exchange not found: {request.ExchangeId}");

            if (request.RowVersion == null || request.RowVersion.Length == 0)
                throw new InvalidOperationException("RowVersion is required for update to enforce concurrency");

            Mapper.Map(request, entity);
            entity.ExchangeId = request.ExchangeId;
            SetModifiedAudit(entity);

            // Use repository helper to set original RowVersion for concurrency check
            await _marketCalendarRepo.SetOriginalRowVersionAsync(entity, request.RowVersion);

            try
            {
                await _marketCalendarRepo.UpdateAsync(entity, cancellationToken);
                await UnitOfWork.SaveChangesAsync(cancellationToken);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                Logger.LogWarning(ex, "Concurrency conflict updating MarketCalendar {MarketCalendarId}", id);
                throw new ConcurrencyException("The market calendar was modified by another process");
            }

            var updated = await _marketCalendarRepo.GetByIdAsync(id, cancellationToken)
                          ?? throw new InvalidOperationException("Failed to retrieve updated market calendar");

            return Mapper.Map<MarketCalendarResponse>(updated);
        }

        public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var entity = await _marketCalendarRepo.GetByIdAsync(id, cancellationToken)
                         ?? throw new NotFoundException($"Market calendar not found: {id}");

            var ok = await _marketCalendarRepo.SoftDeleteAsync(id, cancellationToken);
            if (!ok) return false;

            SetModifiedAudit(entity);
            await UnitOfWork.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
