using NiveshX.Core.Models;

namespace NiveshX.Core.Interfaces.Repositories
{
    public interface IIndustryRepository
    {
        Task<IEnumerable<Industry>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<Industry?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task AddAsync(Industry industry, CancellationToken cancellationToken = default);
        Task UpdateAsync(Industry industry, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
        Task<bool> ExistsAsync(string name, CancellationToken cancellationToken = default);
        Task<bool> ExistsAsync(string name, Guid? excludeId = null, CancellationToken cancellationToken = default);

    }

}
