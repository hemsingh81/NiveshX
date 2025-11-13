using NiveshX.Core.Config;
using System.ComponentModel.DataAnnotations;

namespace NiveshX.Core.DTOs.User
{
    public class UpdateUserRequest
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;
        public bool IsEmailConfirmed { get; set; }

        public string? PhoneNumber { get; set; }
        public bool IsPhoneConfirmed { get; set; }
        public UserRole Role { get; set; } = UserRole.Trader;
        public bool IsLockedOut { get; set; }
        public int FailedLoginAttempts { get; set; } = 0;
        public bool IsActive { get; set; }
    }

}
