using NiveshX.Core.DTOs;

namespace NiveshX.Core.Interfaces.Services
{
    public interface IMarketCalendarService
    {
        Task<IEnumerable<MarketCalendarResponse>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<MarketCalendarResponse>> GetAllIncludingDeletedAsync(CancellationToken cancellationToken = default); // admin
        Task<IEnumerable<MarketCalendarResponse>> GetAllByExchangeAsync(Guid exchangeId, CancellationToken cancellationToken = default);
        Task<MarketCalendarResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<MarketCalendarResponse> CreateAsync(CreateMarketCalendarRequest request, CancellationToken cancellationToken = default);
        Task<MarketCalendarResponse?> UpdateAsync(Guid id, UpdateMarketCalendarRequest request, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    }
}
