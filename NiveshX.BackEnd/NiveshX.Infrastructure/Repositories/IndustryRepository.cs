using Microsoft.EntityFrameworkCore;
using NiveshX.Core.Interfaces.Repositories;
using NiveshX.Core.Models;
using NiveshX.Infrastructure.Data;

namespace NiveshX.Infrastructure.Repositories
{
    public class IndustryRepository : IIndustryRepository
    {
        private readonly AppDbContext _context;

        public IndustryRepository(AppDbContext context) => _context = context;

        public async Task<IEnumerable<Industry>> GetAllAsync(CancellationToken cancellationToken = default)
            => await _context.Industries.Where(i => !i.IsDeleted).ToListAsync(cancellationToken);

        public async Task<Industry?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
            => await _context.Industries.FindAsync(new object[] { id }, cancellationToken);

        public async Task AddAsync(Industry industry, CancellationToken cancellationToken = default)
            => await _context.Industries.AddAsync(industry, cancellationToken);

        public Task UpdateAsync(Industry industry, CancellationToken cancellationToken = default)
        {
            _context.Industries.Update(industry);
            return Task.CompletedTask;
        }

        public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var industry = await _context.Industries.FindAsync(new object[] { id }, cancellationToken);
            if (industry == null) return false;

            industry.IsDeleted = true;
            industry.ModifiedOn = DateTime.UtcNow;
            industry.ModifiedBy = "system";
            _context.Industries.Update(industry);
            return true;
        }
    }


}
