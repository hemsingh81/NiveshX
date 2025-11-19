using Microsoft.EntityFrameworkCore;
using NiveshX.Core.Interfaces.Repositories;
using NiveshX.Core.Models;
using NiveshX.Infrastructure.Data;

namespace NiveshX.Infrastructure.Repositories
{
    public class MarketCalendarRepository : IMarketCalendarRepository
    {
        private readonly AppDbContext _appDbContext;

        public MarketCalendarRepository(AppDbContext appDbContext)
        {
            _appDbContext = appDbContext;
        }

        public IQueryable<MarketCalendar> Query() => _appDbContext.Set<MarketCalendar>().AsQueryable();

        // Normal reads (global soft-delete filter applies in AppDbContext)
        public async Task<IEnumerable<MarketCalendar>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _appDbContext.Set<MarketCalendar>()
                .Include(mc => mc.Exchange)
                .AsNoTracking()
                .ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<MarketCalendar>> GetAllByExchangeAsync(Guid exchangeId, CancellationToken cancellationToken = default)
        {
            return await _appDbContext.Set<MarketCalendar>()
                .Where(mc => mc.ExchangeId == exchangeId)
                .Include(mc => mc.Exchange)
                .AsNoTracking()
                .ToListAsync(cancellationToken);
        }

        // Admin/maintenance method — ignores global query filters and returns deleted rows too
        public async Task<IEnumerable<MarketCalendar>> GetAllIncludingDeletedAsync(CancellationToken cancellationToken = default)
        {
            return await _appDbContext.Set<MarketCalendar>()
                .IgnoreQueryFilters()
                .Include(mc => mc.Exchange)
                .AsNoTracking()
                .ToListAsync(cancellationToken);
        }

        public async Task<MarketCalendar?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            // Return tracked entity for update flows (no AsNoTracking)
            return await _appDbContext.Set<MarketCalendar>()
                .Include(mc => mc.Exchange)
                .FirstOrDefaultAsync(mc => mc.Id == id, cancellationToken);
        }

        public async Task AddAsync(MarketCalendar entity, CancellationToken cancellationToken = default)
        {
            await _appDbContext.Set<MarketCalendar>().AddAsync(entity, cancellationToken);
        }

        public Task UpdateAsync(MarketCalendar entity, CancellationToken cancellationToken = default)
        {
            _appDbContext.Set<MarketCalendar>().Update(entity);
            return Task.CompletedTask;
        }

        // Soft delete by setting IsDeleted = true. Use IgnoreQueryFilters when locating the entity.
        public async Task<bool> SoftDeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var entity = await _appDbContext.Set<MarketCalendar>()
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

            if (entity == null) return false;
            entity.IsDeleted = true;
            _appDbContext.Set<MarketCalendar>().Update(entity);
            return true;
        }

        public async Task<bool> ExistsForExchangeAsync(Guid exchangeId, CancellationToken cancellationToken = default)
        {
            return await _appDbContext.Set<MarketCalendar>()
                .AsNoTracking()
                .AnyAsync(mc => mc.ExchangeId == exchangeId, cancellationToken);
        }

        // Set the OriginalValue of the RowVersion property so EF can detect concurrency conflicts.
        public Task SetOriginalRowVersionAsync(MarketCalendar entity, byte[] originalRowVersion)
        {
            var entry = _appDbContext.Entry(entity);
            if (entry.State == EntityState.Detached)
            {
                _appDbContext.Set<MarketCalendar>().Attach(entity);
                entry = _appDbContext.Entry(entity);
            }

            entry.Property(nameof(MarketCalendar.RowVersion)).OriginalValue = originalRowVersion;
            return Task.CompletedTask;
        }
    }
}
