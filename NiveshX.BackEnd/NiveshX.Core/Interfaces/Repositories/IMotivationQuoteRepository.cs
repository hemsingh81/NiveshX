using NiveshX.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NiveshX.Core.Interfaces.Repositories
{
    public interface IMotivationQuoteRepository
    {
        Task AddAsync(MotivationQuote quote, CancellationToken cancellationToken = default);
        Task<MotivationQuote?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task UpdateAsync(MotivationQuote quote, CancellationToken cancellationToken = default);
        Task<List<MotivationQuote>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<List<MotivationQuote>> GetAllActiveAsync(CancellationToken cancellationToken = default);
    }

}
