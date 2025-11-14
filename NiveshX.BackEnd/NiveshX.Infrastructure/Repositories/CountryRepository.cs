using Microsoft.EntityFrameworkCore;
using NiveshX.Core.Interfaces.Repositories;
using NiveshX.Core.Models;
using NiveshX.Infrastructure.Data;

namespace NiveshX.Infrastructure.Repositories
{
    public class CountryRepository : ICountryRepository
    {
        private readonly AppDbContext _context;

        public CountryRepository(AppDbContext context) => _context = context;

        public async Task<IEnumerable<Country>> GetAllAsync(CancellationToken cancellationToken = default)
            => await _context.Countries.Where(c => !c.IsDeleted).ToListAsync(cancellationToken);

        public async Task<Country?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
            => await _context.Countries.FindAsync(new object[] { id }, cancellationToken);

        public async Task AddAsync(Country country, CancellationToken cancellationToken = default)
            => await _context.Countries.AddAsync(country, cancellationToken);

        public Task UpdateAsync(Country country, CancellationToken cancellationToken = default)
        {
            _context.Countries.Update(country);
            return Task.CompletedTask;
        }

        public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var country = await _context.Countries.FindAsync(new object[] { id }, cancellationToken);
            if (country == null) return false;

            country.IsDeleted = true;
            country.ModifiedOn = DateTime.UtcNow;
            country.ModifiedBy = "system";
            _context.Countries.Update(country);
            return true;
        }
    }

}
