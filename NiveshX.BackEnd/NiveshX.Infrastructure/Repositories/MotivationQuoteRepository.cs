using Microsoft.EntityFrameworkCore;
using NiveshX.Core.Interfaces.Repositories;
using NiveshX.Core.Models;
using NiveshX.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NiveshX.Infrastructure.Repositories
{
    public class MotivationQuoteRepository : IMotivationQuoteRepository
    {
        private readonly AppDbContext _context;

        public MotivationQuoteRepository(AppDbContext context) => _context = context;

        public async Task<IEnumerable<MotivationQuote>> GetAllAsync(CancellationToken cancellationToken = default)
            => await _context.MotivationQuotes.Where(q => !q.IsDeleted).ToListAsync(cancellationToken);

        public async Task<IEnumerable<MotivationQuote>> GetAllActiveAsync(CancellationToken cancellationToken = default)
            => await _context.MotivationQuotes.Where(q => !q.IsDeleted && q.IsActive).ToListAsync(cancellationToken);

        public async Task<MotivationQuote?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
            => await _context.MotivationQuotes.FindAsync(new object[] { id }, cancellationToken);

        public async Task AddAsync(MotivationQuote quote, CancellationToken cancellationToken = default)
            => await _context.MotivationQuotes.AddAsync(quote, cancellationToken);

        public Task UpdateAsync(MotivationQuote quote, CancellationToken cancellationToken = default)
        {
            _context.MotivationQuotes.Update(quote);
            return Task.CompletedTask;
        }

        public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var quote = await _context.MotivationQuotes.FindAsync(new object[] { id }, cancellationToken);
            if (quote == null) return false;

            quote.IsDeleted = true;
            quote.ModifiedOn = DateTime.UtcNow;
            quote.ModifiedBy = "system";
            _context.MotivationQuotes.Update(quote);
            return true;
        }

        public async Task<bool> ExistsAsync(string quote, CancellationToken cancellationToken = default)
        {
            return await ExistsAsync(quote, null, cancellationToken);
        }

        public async Task<bool> ExistsAsync(string quote, Guid? excludeId = null, CancellationToken cancellationToken = default)
        {
            var normalizedText = (quote ?? string.Empty).Trim().ToLowerInvariant();

            var query = _context.MotivationQuotes
                .AsNoTracking()
                .Where(q => !q.IsDeleted && q.Quote.ToLower() == normalizedText);

            if (excludeId.HasValue)
                query = query.Where(q => q.Id != excludeId.Value);

            return await query.AnyAsync(cancellationToken);
        }
    }

}
