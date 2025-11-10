using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NiveshX.Core.DTOs;
using NiveshX.Core.Interfaces;
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
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
                {
                    _logger.LogWarning("Invalid or missing user ID claim");
                    return Unauthorized("Invalid token");
                }

                var profile = await _authService.GetUserProfileAsync(userId, cancellationToken);
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
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
                {
                    _logger.LogWarning("Invalid or missing user ID claim");
                    return Unauthorized("Invalid token");
                }

                var success = await _authService.UpdateUserProfileAsync(userId, request, cancellationToken);
                if (!success)
                    return BadRequest("User not found or update failed");

                return Ok("Profile updated successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception while updating profile");
                return StatusCode(500, new { error = "An unexpected error occurred while updating profile." });
            }
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
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
                    return Unauthorized("Invalid token");

                var success = await _authService.ChangePasswordAsync(userId, request, cancellationToken);
                if (!success)
                    return BadRequest("Current password is incorrect or user not found");

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
    }
}
