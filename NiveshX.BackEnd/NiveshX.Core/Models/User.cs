using NiveshX.Core.Config;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NiveshX.Core.Models
{

    /// <summary>
    /// Represents a registered user in the system.
    /// </summary>
    public class User : AuditableEntity
    {

        /// <summary>Trader Name address used for communication.</summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>Email address used for login and communication.</summary>
        public string Email { get; set; } = string.Empty;

        /// <summary>Indicates whether the email has been confirmed.</summary>
        public bool IsEmailConfirmed { get; set; } = false;

        /// <summary>Hashed password for secure authentication.</summary>
        public string PasswordHash { get; set; } = string.Empty;

        /// <summary>Role assigned to the user (e.g., Admin, User).</summary>
        public UserRole Role { get; set; } = UserRole.None;

        /// <summary>Refresh token used to renew access tokens.</summary>
        public string RefreshToken { get; set; } = string.Empty;

        /// <summary>Expiry date of the refresh token.</summary>
        public DateTime RefreshTokenExpiry { get; set; }

        /// <summary>Optional phone number for MFA or alerts.</summary>
        public string? PhoneNumber { get; set; }

        /// <summary>Indicates whether the phone number has been confirmed.</summary>
        public bool IsPhoneConfirmed { get; set; } = false;

        /// <summary>Timestamp of the user's last successful login.</summary>
        public DateTime? LastLoginOn { get; set; }

        /// <summary>URL of the user's profile picture.</summary>
        public string? ProfilePictureUrl { get; set; }

        /// <summary>Indicates whether the account is locked due to failed login attempts.</summary>
        public bool IsLockedOut { get; set; } = false;

        /// <summary>Number of consecutive failed login attempts.</summary>
        public int FailedLoginAttempts { get; set; } = 0;

    }

}
