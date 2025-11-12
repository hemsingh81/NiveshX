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

        public MotivationQuoteRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(MotivationQuote quote, CancellationToken cancellationToken = default)
        {
            await _context.MotivationQuotes.AddAsync(quote, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task<MotivationQuote?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return await _context.MotivationQuotes.FirstOrDefaultAsync(q => q.Id == id && !q.IsDeleted, cancellationToken);
        }

        public async Task UpdateAsync(MotivationQuote quote, CancellationToken cancellationToken = default)
        {
            _context.MotivationQuotes.Update(quote);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task<List<MotivationQuote>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _context.MotivationQuotes
                .Where(q => !q.IsDeleted)
                .OrderByDescending(q => q.CreatedOn)
                .ToListAsync(cancellationToken);
        }

    }

}
