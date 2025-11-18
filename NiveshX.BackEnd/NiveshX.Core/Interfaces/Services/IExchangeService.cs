using NiveshX.Core.DTOs.Exchange;

namespace NiveshX.Core.Interfaces.Services
{
    public interface IExchangeService
    {
        Task<IEnumerable<ExchangeResponse>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<ExchangeResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<ExchangeResponse> CreateAsync(CreateExchangeRequest request, CancellationToken cancellationToken = default);
        Task<ExchangeResponse?> UpdateAsync(Guid id, UpdateExchangeRequest request, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    }
}
