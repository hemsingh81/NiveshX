using NiveshX.Core.DTOs.Industry;

namespace NiveshX.Core.Interfaces.Services
{
    public interface IIndustryService
    {
        Task<IEnumerable<IndustryResponse>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<IndustryResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<IndustryResponse> CreateAsync(CreateIndustryRequest request, CancellationToken cancellationToken = default);
        Task<IndustryResponse?> UpdateAsync(Guid id, UpdateIndustryRequest request, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    }

}
