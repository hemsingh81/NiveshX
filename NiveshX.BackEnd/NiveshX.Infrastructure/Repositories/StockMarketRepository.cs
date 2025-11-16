using Microsoft.EntityFrameworkCore;
using NiveshX.Core.Interfaces.Repositories;
using NiveshX.Core.Models;
using NiveshX.Infrastructure.Data;

namespace NiveshX.Infrastructure.Repositories
{
    public class StockMarketRepository : IStockMarketRepository
    {
        private readonly AppDbContext _appDbContext; // replace with your actual DbContext type

        public StockMarketRepository(AppDbContext appDbContext)
        {
            _appDbContext = appDbContext;
        }

        public IQueryable<StockMarket> Query() => _appDbContext.Set<StockMarket>().AsQueryable();

        public async Task<IEnumerable<StockMarket>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _appDbContext.Set<StockMarket>()
                .Include(sm => sm.Country)
                .AsNoTracking()
                .ToListAsync(cancellationToken);
        }

        public async Task<StockMarket?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return await _appDbContext.Set<StockMarket>()
                .Include(sm => sm.Country)
                .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        }

        public async Task AddAsync(StockMarket entity, CancellationToken cancellationToken = default)
        {
            await _appDbContext.Set<StockMarket>().AddAsync(entity, cancellationToken);
        }

        public Task UpdateAsync(StockMarket entity, CancellationToken cancellationToken = default)
        {
            _appDbContext.Set<StockMarket>().Update(entity);
            return Task.CompletedTask;
        }

        public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var entity = await _appDbContext.Set<StockMarket>().FindAsync(new object[] { id }, cancellationToken);
            if (entity == null) return false;
            _appDbContext.Set<StockMarket>().Remove(entity);
            return true;
        }
    }

}
