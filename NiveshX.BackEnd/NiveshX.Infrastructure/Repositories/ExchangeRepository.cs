using Microsoft.EntityFrameworkCore;
using NiveshX.Core.Interfaces.Repositories;
using NiveshX.Core.Models;
using NiveshX.Infrastructure.Data;

namespace NiveshX.Infrastructure.Repositories
{
    public class ExchangeRepository : IExchangeRepository
    {
        private readonly AppDbContext _appDbContext; // replace with your actual DbContext type

        public ExchangeRepository(AppDbContext appDbContext)
        {
            _appDbContext = appDbContext;
        }

        public IQueryable<Exchange> Query() => _appDbContext.Set<Exchange>().AsQueryable();

        public async Task<IEnumerable<Exchange>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _appDbContext.Set<Exchange>()
                .Include(sm => sm.Country)
                .AsNoTracking()
                .ToListAsync(cancellationToken);
        }

        public async Task<Exchange?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return await _appDbContext.Set<Exchange>()
                .Include(sm => sm.Country)
                .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        }

        public async Task AddAsync(Exchange entity, CancellationToken cancellationToken = default)
        {
            await _appDbContext.Set<Exchange>().AddAsync(entity, cancellationToken);
        }

        public Task UpdateAsync(Exchange entity, CancellationToken cancellationToken = default)
        {
            _appDbContext.Set<Exchange>().Update(entity);
            return Task.CompletedTask;
        }

        public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var entity = await _appDbContext.Set<Exchange>().FindAsync(new object[] { id }, cancellationToken);
            if (entity == null) return false;
            _appDbContext.Set<Exchange>().Remove(entity);
            return true;
        }

        public async Task<bool> ExistsAsync(string name, string code, Guid countryId, CancellationToken cancellationToken = default)
        {
            return await ExistsAsync(name, code, countryId, null, cancellationToken);
        }
        public async Task<bool> ExistsAsync(string name, string code, Guid countryId, Guid? excludeId = null, CancellationToken cancellationToken = default)
        {
            var normalizedName = name?.Trim().ToLowerInvariant() ?? string.Empty;
            var normalizedCode = code?.Trim().ToLowerInvariant() ?? string.Empty;

            var q = _appDbContext.Exchanges
                .AsNoTracking()
                .Where(s => !s.IsDeleted && s.CountryId == countryId);

            if (excludeId.HasValue)
                q = q.Where(s => s.Id != excludeId.Value);

            return await q.AnyAsync(s =>
                s.Name.ToLower() == normalizedName ||
                s.Code.ToLower() == normalizedCode,
                cancellationToken);
        }
    }

}
