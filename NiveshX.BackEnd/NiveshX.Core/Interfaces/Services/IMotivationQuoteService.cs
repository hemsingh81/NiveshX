using NiveshX.Core.DTOs.MotivationQuote;
using NiveshX.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NiveshX.Core.Interfaces.Services
{
    public interface IMotivationQuoteService
    {
        Task<bool> AddQuoteAsync(AddMotivationQuoteRequest request, CancellationToken cancellationToken = default);
        Task<bool> EditQuoteAsync(EditMotivationQuoteRequest request, CancellationToken cancellationToken = default);
        Task<bool> DeleteQuoteAsync(Guid id, CancellationToken cancellationToken = default);
        Task<List<MotivationQuote>> GetAllQuotesAsync(CancellationToken cancellationToken = default);
        Task<MotivationQuote?> GetQuoteByIdAsync(Guid id, CancellationToken cancellationToken = default);
    }

}
