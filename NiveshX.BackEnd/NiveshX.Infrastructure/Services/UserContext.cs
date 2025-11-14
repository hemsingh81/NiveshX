using Microsoft.AspNetCore.Http;
using NiveshX.Core.Interfaces.Services;
using System.Security.Claims;

namespace NiveshX.Infrastructure.Services
{
    public class UserContext : IUserContext
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UserContext(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public string UserId => _httpContextAccessor.HttpContext?.User.FindFirst("UserId")?.Value ?? "system";
        public string UserEmail => _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.Email)?.Value ?? "system@niveshx.com";
        public string UserRole => _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.Role)?.Value ?? "Guest";
    }

}
