using NiveshX.Core.Interfaces.Repositories;
using NiveshX.Core.Models;
using System.Threading;
using System.Threading.Tasks;

namespace NiveshX.Core.Interfaces
{
    public interface IUnitOfWork
    {
        IUserRepository Users { get; }
        IMotivationQuoteRepository MotivationQuotes { get; }
        ICountryRepository Countries { get; }
        IIndustryRepository Industries { get; }
        ISectorRepository Sectors { get; }
        IClassificationTagRepository ClassificationTags { get; }
        IStockMarketRepository StockMarkets { get; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

        // Optional transaction support
        Task BeginTransactionAsync();
        Task CommitAsync();
        Task RollbackAsync();
    }
}
