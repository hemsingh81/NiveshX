using NiveshX.Core.DTOs.Sector;

namespace NiveshX.Core.Interfaces.Services
{
    public interface ISectorService
    {
        Task<IEnumerable<SectorResponse>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<SectorResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<SectorResponse> CreateAsync(CreateSectorRequest request, CancellationToken cancellationToken = default);
        Task<SectorResponse?> UpdateAsync(Guid id, UpdateSectorRequest request, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    }

}
