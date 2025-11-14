using NiveshX.Core.Interfaces.Repositories;
using System.Threading;
using System.Threading.Tasks;

namespace NiveshX.Core.Interfaces
{
    public interface IUnitOfWork
    {
        IUserRepository Users { get; }
        IMotivationQuoteRepository MotivationQuotes { get; }
        ICountryRepository Countries { get; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

        // Optional transaction support
        Task BeginTransactionAsync();
        Task CommitAsync();
        Task RollbackAsync();
    }
}
