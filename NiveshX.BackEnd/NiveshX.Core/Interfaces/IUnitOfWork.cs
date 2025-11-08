using System.Threading;
using System.Threading.Tasks;

namespace NiveshX.Core.Interfaces
{
    public interface IUnitOfWork
    {
        IUserRepository Users { get; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

        // Optional transaction support
        Task BeginTransactionAsync();
        Task CommitAsync();
        Task RollbackAsync();
    }
}
