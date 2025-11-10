using NiveshX.Core.Config;

namespace NiveshX.Core.DTOs
{
    public class UserProfileResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string? Role { get; set; }
    }
}
