using NiveshX.Core.Models;

namespace NiveshX.Core.Interfaces.Repositories
{
    public interface ISectorRepository
    {
        Task<IEnumerable<Sector>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<Sector?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task AddAsync(Sector sector, CancellationToken cancellationToken = default);
        Task UpdateAsync(Sector sector, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    }

}
