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
        Task<IEnumerable<MotivationQuoteResponse>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<MotivationQuoteResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<MotivationQuoteResponse> CreateAsync(CreateMotivationQuoteRequest request, CancellationToken cancellationToken = default);
        Task<MotivationQuoteResponse?> UpdateAsync(Guid id, UpdateMotivationQuoteRequest request, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    }

}
