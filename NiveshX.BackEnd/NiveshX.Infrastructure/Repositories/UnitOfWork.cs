using NiveshX.Core.Interfaces;
using NiveshX.Core.Interfaces.Repositories;
using NiveshX.Infrastructure.Data;
using System.Threading;
using System.Threading.Tasks;

namespace NiveshX.Infrastructure.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AppDbContext _context;

        public IUserRepository Users { get; }
        public IMotivationQuoteRepository MotivationQuotes { get; }
        public ICountryRepository Countries { get; }
        public IIndustryRepository Industries { get; }
        public ISectorRepository Sectors { get; }
        public IClassificationTagRepository ClassificationTags { get; }
        public IExchangeRepository Exchanges { get; }

        public UnitOfWork(AppDbContext context)
        {
            _context = context;
            Users = new UserRepository(context);
            MotivationQuotes = new MotivationQuoteRepository(context);
            Countries = new CountryRepository(context);
            Industries = new IndustryRepository(context);
            Sectors = new SectorRepository(context);
            ClassificationTags = new ClassificationTagRepository(context);
            Exchanges = new ExchangeRepository(context);
        }

        public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
            => await _context.SaveChangesAsync(cancellationToken);

        // Optional transaction support
        public async Task BeginTransactionAsync() => await _context.Database.BeginTransactionAsync();
        public async Task CommitAsync() => await _context.Database.CommitTransactionAsync();
        public async Task RollbackAsync() => await _context.Database.RollbackTransactionAsync();
    }
}
