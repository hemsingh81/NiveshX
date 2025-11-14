using NiveshX.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NiveshX.Core.Interfaces.Repositories
{
    public interface ICountryRepository
    {
        Task<IEnumerable<Country>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<Country?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task AddAsync(Country country, CancellationToken cancellationToken = default);
        Task UpdateAsync(Country country, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    }

}
