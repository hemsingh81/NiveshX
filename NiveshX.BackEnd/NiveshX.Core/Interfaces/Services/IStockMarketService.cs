using NiveshX.Core.DTOs.StockMarket;

namespace NiveshX.Core.Interfaces.Services
{
    public interface IStockMarketService
    {
        Task<IEnumerable<StockMarketResponse>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<StockMarketResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<StockMarketResponse> CreateAsync(CreateStockMarketRequest request, CancellationToken cancellationToken = default);
        Task<StockMarketResponse?> UpdateAsync(Guid id, UpdateStockMarketRequest request, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    }
}
