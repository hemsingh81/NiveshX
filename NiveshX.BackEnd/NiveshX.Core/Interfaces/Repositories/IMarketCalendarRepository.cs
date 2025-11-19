using NiveshX.Core.Models;

namespace NiveshX.Core.Interfaces.Repositories
{
    public interface IMarketCalendarRepository
    {
        IQueryable<MarketCalendar> Query();
        Task<IEnumerable<MarketCalendar>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<MarketCalendar>> GetAllByExchangeAsync(Guid exchangeId, CancellationToken cancellationToken = default);
        Task<IEnumerable<MarketCalendar>> GetAllIncludingDeletedAsync(CancellationToken cancellationToken = default);
        Task<MarketCalendar?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task AddAsync(MarketCalendar entity, CancellationToken cancellationToken = default);
        Task UpdateAsync(MarketCalendar entity, CancellationToken cancellationToken = default);
        Task<bool> SoftDeleteAsync(Guid id, CancellationToken cancellationToken = default);
        Task<bool> ExistsForExchangeAsync(Guid exchangeId, CancellationToken cancellationToken = default);

        // Repository-level helper to set EF OriginalValue for concurrency checks
        Task SetOriginalRowVersionAsync(MarketCalendar entity, byte[] originalRowVersion);
    }
}
