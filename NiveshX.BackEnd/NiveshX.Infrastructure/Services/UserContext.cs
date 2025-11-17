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

        private ClaimsPrincipal? User => _httpContextAccessor.HttpContext?.User;

        public string? UserId => User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        public string? UserName => User?.Identity?.Name ?? User?.FindFirst("name")?.Value;

        public string? Email => User?.FindFirst(ClaimTypes.Email)?.Value;

        public IEnumerable<string> Roles => User?.FindAll(ClaimTypes.Role).Select(c => c.Value) ?? Enumerable.Empty<string>();

        public bool IsAuthenticated => User?.Identity?.IsAuthenticated ?? false;
    }

}
