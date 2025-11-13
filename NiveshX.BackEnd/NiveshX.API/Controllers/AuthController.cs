using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NiveshX.Core.DTOs.User;
using NiveshX.Core.Interfaces.Services;
using NiveshX.Infrastructure.Repositories;
using System.Security.Claims;

namespace NiveshX.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        /// <summary>
        /// Health check endpoint
        /// </summary>
        [HttpGet("ping")]
        [AllowAnonymous]
        public IActionResult Ping()
        {
            return Ok("API is alive 🚀");
        }

        /// <summary>
        /// Authenticates a user and returns access and refresh tokens
        /// </summary>
        [HttpPost("login")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                _logger.LogInformation("Login attempt for {Email}", request.Email);

                var result = await _authService.AuthenticateAsync(request);
                if (result == null)
                {
                    _logger.LogWarning("Login failed for {Email}", request.Email);
                    return Unauthorized("Invalid credentials");
                }

                _logger.LogInformation("Login successful for {Email}", request.Email);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception during login for {Email}", request.Email);
                return StatusCode(500, new { error = "An unexpected error occurred during login." });
            }
        }

        [HttpGet("profile")]
        [Authorize]
        [ProducesResponseType(typeof(UserProfileResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetProfile(CancellationToken cancellationToken)
        {
            try
            {
                var userId = GetUserIdFromClaims();
                if (userId == null)
                {
                    _logger.LogWarning("Invalid or missing user ID claim");
                    return Unauthorized("Invalid token");
                }

                var profile = await _authService.GetUserProfileAsync(userId.Value, cancellationToken);
                if (profile == null)
                    return NotFound("User not found");

                return Ok(profile);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception while retrieving profile");
                return StatusCode(500, new { error = "An unexpected error occurred while retrieving profile." });
            }
        }

        [HttpPut("profile")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var userId = GetUserIdFromClaims();
                if (userId == null)
                {
                    _logger.LogWarning("Invalid or missing user ID claim");
                    return Unauthorized("Invalid token");
                }

                var success = await _authService.UpdateUserProfileAsync(userId.Value, request, cancellationToken);
                if (!success)
                    return BadRequest("User not found or update failed");

                _logger.LogInformation("Profile updated for user: {UserId}", userId);
                return Ok("Profile updated successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception while updating profile");
                return StatusCode(500, new { error = "An unexpected error occurred while updating profile." });
            }
        }

        [HttpPost("profile/image")]
        [Authorize]
        [RequestSizeLimit(5_000_000)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UploadProfileImage(IFormFile file, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Profile image upload started");

            if (file == null || file.Length == 0)
            {
                _logger.LogWarning("No file uploaded");
                return BadRequest("No file uploaded");
            }

            var userId = GetUserIdFromClaims();
            if (userId == null)
            {
                _logger.LogWarning("Missing user ID claim");
                return Unauthorized("Invalid token");
            }

            await DeleteProfileImageIfExistsAsync(userId.Value);
            var imagePath = await SaveProfileImageAsync(userId.Value, file, cancellationToken);
            if (imagePath == null)
            {
                _logger.LogWarning("Unsupported file type: {FileName}", file.FileName);
                return BadRequest("Unsupported file type");
            }

            await _authService.UpdateProfilePictureAsync(userId.Value, imagePath, cancellationToken);
            _logger.LogInformation("Profile image updated for user: {UserId}", userId);

            return Ok(new { imageUrl = imagePath });
        }

        [HttpPost("change-password")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var userId = GetUserIdFromClaims();
                if (userId == null)
                {
                    _logger.LogWarning("Invalid or missing user ID claim");
                    return Unauthorized("Invalid token");
                }

                var success = await _authService.ChangePasswordAsync(userId.Value, request, cancellationToken);
                if (!success)
                {
                    _logger.LogWarning("Password change failed for user: {UserId}", userId);
                    return BadRequest("Current password is incorrect or user not found");
                }

                _logger.LogInformation("Password changed successfully for user: {UserId}", userId);
                return Ok("Password changed successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing password");
                return StatusCode(500, new { error = "An unexpected error occurred while changing password." });
            }
        }

        /// <summary>
        /// Refreshes access token using a valid refresh token
        /// </summary>
        [HttpPost("refresh")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> RefreshToken([FromBody] TokenRefreshRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                _logger.LogInformation("Refresh token attempt");

                var result = await _authService.RefreshTokenAsync(request.RefreshToken);
                if (result == null)
                {
                    _logger.LogWarning("Refresh token failed: token invalid or expired");
                    return Unauthorized("Invalid or expired refresh token");
                }

                _logger.LogInformation("Refresh token successful");
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception during token refresh");
                return StatusCode(500, new { error = "An unexpected error occurred during token refresh." });
            }
        }

        #region Private Methods

        private Guid? GetUserIdFromClaims()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return Guid.TryParse(userIdClaim?.Value, out var userId) ? userId : null;
        }

        private async Task DeleteProfileImageIfExistsAsync(Guid userId)
        {
            var uploadDir = Path.Combine("wwwroot", "uploads", "profile");
            var extensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };

            foreach (var ext in extensions)
            {
                var path = Path.Combine(uploadDir, $"{userId}{ext}");
                if (System.IO.File.Exists(path))
                {
                    try
                    {
                        System.IO.File.Delete(path);
                        _logger.LogInformation("Deleted profile image: {Path}", path);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to delete image: {Path}", path);
                    }
                }
            }

            await Task.CompletedTask;
        }

        private async Task<string?> SaveProfileImageAsync(Guid userId, IFormFile file, CancellationToken cancellationToken)
        {
            var ext = Path.GetExtension(file.FileName).ToLower();
            var allowed = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            if (!allowed.Contains(ext)) return null;

            var fileName = $"{userId}{ext}";
            var relativePath = $"/uploads/profile/{fileName}";
            var fullPath = Path.Combine("wwwroot", "uploads", "profile", fileName);

            Directory.CreateDirectory(Path.GetDirectoryName(fullPath)!);
            using var stream = new FileStream(fullPath, FileMode.Create);
            await file.CopyToAsync(stream, cancellationToken);

            _logger.LogInformation("Saved profile image to {Path}", fullPath);
            return relativePath;
        }

        #endregion

    }
}
