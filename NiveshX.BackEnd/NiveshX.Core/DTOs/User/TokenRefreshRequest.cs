using System.ComponentModel.DataAnnotations;

namespace NiveshX.Core.DTOs.User
{
    /// <summary>
    /// Represents a request to refresh an access token using a refresh token.
    /// </summary>
    public class TokenRefreshRequest
    {
        /// <summary>
        /// The refresh token issued during login.
        /// </summary>
        [Required(ErrorMessage = "Refresh token is required")]
        public string RefreshToken { get; set; } = string.Empty;
    }
}
