using NiveshX.Core.DTOs.Country;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NiveshX.Core.Interfaces.Services
{
    public interface ICountryService
    {
        Task<IEnumerable<CountryResponse>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<CountryResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<CountryResponse> CreateAsync(CreateCountryRequest request, CancellationToken cancellationToken = default);
        Task<CountryResponse?> UpdateAsync(Guid id, UpdateCountryRequest request, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    }

}
