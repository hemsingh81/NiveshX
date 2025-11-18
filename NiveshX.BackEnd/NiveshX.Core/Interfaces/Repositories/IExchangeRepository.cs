using NiveshX.Core.Models;

namespace NiveshX.Core.Interfaces.Repositories
{
    public interface IExchangeRepository
    {
        Task<IEnumerable<Exchange>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<Exchange?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task AddAsync(Exchange entity, CancellationToken cancellationToken = default);
        Task UpdateAsync(Exchange entity, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
        IQueryable<Exchange> Query(); // for ProjectTo if needed
        Task<bool> ExistsAsync(string name, string code, Guid countryId, CancellationToken cancellationToken = default);
        Task<bool> ExistsAsync(string name, string code, Guid countryId, Guid? excludeId = null, CancellationToken cancellationToken = default);
    }
}
