using NiveshX.Core.Config;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NiveshX.Core.DTOs.User
{
    public class UserResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool IsEmailConfirmed { get; set; }
        public string? PhoneNumber { get; set; }
        public bool IsPhoneConfirmed { get; set; }
        public string Role { get; set; } = UserRole.None.ToString();
        public bool IsLockedOut { get; set; }
        public bool IsActive { get; set; }
        public int FailedLoginAttempts { get; set; } = 0;
        public DateTime? LastLoginOn { get; set; }
    }

}
