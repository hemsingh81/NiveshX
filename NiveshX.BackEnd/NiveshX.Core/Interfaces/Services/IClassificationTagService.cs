using NiveshX.Core.DTOs.ClassificationTag;

namespace NiveshX.Core.Interfaces.Services
{
    public interface IClassificationTagService
    {
        Task<IEnumerable<ClassificationTagResponse>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<ClassificationTagResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<ClassificationTagResponse> CreateAsync(CreateClassificationTagRequest request, CancellationToken cancellationToken = default);
        Task<ClassificationTagResponse?> UpdateAsync(Guid id, UpdateClassificationTagRequest request, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    }

}
