using NiveshX.Core.Models;

namespace NiveshX.Core.Interfaces.Repositories
{
    public interface IStockMarketRepository
    {
        Task<IEnumerable<StockMarket>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<StockMarket?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task AddAsync(StockMarket entity, CancellationToken cancellationToken = default);
        Task UpdateAsync(StockMarket entity, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
        IQueryable<StockMarket> Query(); // for ProjectTo if needed
    }
}
