using NiveshX.Core.DTOs.User;
using System.Threading;
using System.Threading.Tasks;

namespace NiveshX.Core.Interfaces.Services
{
    public interface IAuthService
    {
        Task<LoginResponse?> AuthenticateAsync(LoginRequest request, CancellationToken cancellationToken = default);
        Task<LoginResponse?> RefreshTokenAsync(string refreshToken);
        Task<UserProfileResponse?> GetUserProfileAsync(Guid userId, CancellationToken cancellationToken = default);
        Task<bool> UpdateUserProfileAsync(Guid userId, UpdateProfileRequest request, CancellationToken cancellationToken = default);
        Task UpdateProfilePictureAsync(Guid userId, string imageUrl, CancellationToken cancellationToken = default);
        Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken cancellationToken = default);
    }
}
