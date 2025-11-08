using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NiveshX.Core.DTOs
{
    /// <summary>
    /// Represents login credentials for authentication.
    /// </summary>
    public class LoginRequest
    {
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required")]
        [MinLength(2, ErrorMessage = "Password must be at least 2 characters")]
        public string Password { get; set; } = string.Empty;
    }
}
