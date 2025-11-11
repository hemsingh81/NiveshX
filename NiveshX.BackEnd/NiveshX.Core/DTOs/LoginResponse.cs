using NiveshX.Core.Config;

namespace NiveshX.Core.DTOs
{
    /// <summary>
    /// Represents the response returned after successful authentication.
    /// </summary>
    public class LoginResponse
    {
        /// <summary>
        /// JWT access token used for authenticated requests.
        /// </summary>
        public string Token { get; set; } = string.Empty;

        /// <summary>
        /// Refresh token used to obtain a new access token.
        /// </summary>
        public string RefreshToken { get; set; } = string.Empty;

        /// <summary>
        /// Name
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Name
        /// </summary>
        public string Role { get; set; } = UserRole.None.ToString();

        public string? ProfilePictureUrl { get; set; }
    }
}
