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
        Task<bool> AddAsync(AddMotivationQuoteRequest request, CancellationToken cancellationToken = default);
        Task<bool> EditAsync(EditMotivationQuoteRequest request, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
        Task<List<MotivationQuote>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<List<MotivationQuote>> GetAllActive(CancellationToken cancellationToken = default);
        Task<MotivationQuote?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    }

}
