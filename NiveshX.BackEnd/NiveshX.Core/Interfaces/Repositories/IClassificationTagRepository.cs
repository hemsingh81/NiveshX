using NiveshX.Core.Models;

namespace NiveshX.Core.Interfaces.Repositories
{
    public interface IClassificationTagRepository
    {
        Task<IEnumerable<ClassificationTag>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<ClassificationTag?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task AddAsync(ClassificationTag tag, CancellationToken cancellationToken = default);
        Task UpdateAsync(ClassificationTag tag, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
        Task<bool> ExistsAsync(string name, CancellationToken cancellationToken = default);
        Task<bool> ExistsAsync(string name, Guid? excludeId, CancellationToken cancellationToken = default);

    }

}
