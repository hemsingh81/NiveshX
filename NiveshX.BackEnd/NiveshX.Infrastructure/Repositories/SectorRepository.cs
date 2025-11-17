using Microsoft.EntityFrameworkCore;
using NiveshX.Core.Interfaces.Repositories;
using NiveshX.Core.Models;
using NiveshX.Infrastructure.Data;

namespace NiveshX.Infrastructure.Repositories
{
    public class SectorRepository : ISectorRepository
    {
        private readonly AppDbContext _context;

        public SectorRepository(AppDbContext context) => _context = context;

        public async Task<IEnumerable<Sector>> GetAllAsync(CancellationToken cancellationToken = default)
            => await _context.Sectors.AsNoTracking().Where(s => !s.IsDeleted).ToListAsync(cancellationToken);

        public async Task<Sector?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
            => await _context.Sectors.FindAsync(new object[] { id }, cancellationToken);

        public async Task AddAsync(Sector sector, CancellationToken cancellationToken = default)
            => await _context.Sectors.AddAsync(sector, cancellationToken);

        public Task UpdateAsync(Sector sector, CancellationToken cancellationToken = default)
        {
            _context.Sectors.Update(sector);
            return Task.CompletedTask;
        }

        public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var sector = await _context.Sectors.FindAsync(new object[] { id }, cancellationToken);
            if (sector == null) return false;

            sector.IsDeleted = true;
            sector.ModifiedOn = DateTime.UtcNow;
            sector.ModifiedBy = "system";
            _context.Sectors.Update(sector);
            return true;
        }

        public async Task<bool> ExistsAsync(string name, CancellationToken cancellationToken = default)
        {
            return await ExistsAsync(name, null, cancellationToken);
        }

        public async Task<bool> ExistsAsync(string name, Guid? excludeId = null, CancellationToken cancellationToken = default)
        {
            var normalized = (name ?? string.Empty).Trim().ToLowerInvariant();

            var query = _context.Sectors
                .AsNoTracking()
                .Where(s => !s.IsDeleted && s.Name.ToLower() == normalized);

            if (excludeId.HasValue)
                query = query.Where(s => s.Id != excludeId.Value);

            return await query.AnyAsync(cancellationToken);
        }

    }


}
