using NiveshX.Core.Models;
using System.Threading;
using System.Threading.Tasks;

namespace NiveshX.Core.Interfaces.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default);
        Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
        Task<User?> GetByRefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default);
        Task AddAsync(User user, CancellationToken cancellationToken = default);
        Task UpdateAsync(User user, CancellationToken cancellationToken = default);
        Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task UpdatePasswordAsync(Guid userId, string newPasswordHash, CancellationToken cancellationToken = default);
        Task UpdateProfileAsync(Guid userId, string name, string? phoneNumber, CancellationToken cancellationToken = default);

    }
}
