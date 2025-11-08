using NiveshX.Core.DTOs;
using System.Threading;
using System.Threading.Tasks;

namespace NiveshX.Core.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponse?> AuthenticateAsync(LoginRequest request, CancellationToken cancellationToken = default);
        Task<LoginResponse?> RefreshTokenAsync(string refreshToken);
    }
}
