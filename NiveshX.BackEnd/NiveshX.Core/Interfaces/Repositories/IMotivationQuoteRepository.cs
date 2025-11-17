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
        Task<IEnumerable<MotivationQuote>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<MotivationQuote>> GetAllActiveAsync(CancellationToken cancellationToken = default);
        Task<MotivationQuote?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task AddAsync(MotivationQuote quote, CancellationToken cancellationToken = default);
        Task UpdateAsync(MotivationQuote quote, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
        Task<bool> ExistsAsync(string quote, CancellationToken cancellationToken = default);
        Task<bool> ExistsAsync(string quote, Guid? excludeId = null, CancellationToken cancellationToken = default);

    }

}
