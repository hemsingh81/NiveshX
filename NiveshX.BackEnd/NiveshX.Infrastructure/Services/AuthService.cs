using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using NiveshX.Core.Config;
using NiveshX.Core.DTOs;
using NiveshX.Core.Interfaces;
using NiveshX.Core.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace NiveshX.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly JwtOptions _jwtOptions;
        private readonly ILogger<AuthService> _logger;

        public AuthService(IUnitOfWork unitOfWork, IOptions<JwtOptions> jwtOptions, ILogger<AuthService> logger)
        {
            _unitOfWork = unitOfWork;
            _jwtOptions = jwtOptions.Value;
            _logger = logger;
        }

        public async Task<LoginResponse?> AuthenticateAsync(LoginRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                var user = await _unitOfWork.Users.GetByUsernameAsync(request.Email, cancellationToken);
                if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                {
                    _logger.LogWarning("Invalid credentials for {Email}", request.Email);
                    return null;
                }

                var accessToken = GenerateJwtToken(user);
                var refreshToken = GenerateSecureRefreshToken();

                user.RefreshToken = refreshToken;
                user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(_jwtOptions.RefreshTokenExpiryDays);
                await _unitOfWork.Users.UpdateAsync(user, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("User {Email} logged in successfully", user.Email);

                return new LoginResponse
                {
                    Token = accessToken,
                    RefreshToken = refreshToken,
                    Role = user.Role,
                    Name = user.Name
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during authentication for {Email}", request.Email);
                throw;
            }
        }


        public async Task<LoginResponse?> RefreshTokenAsync(string refreshToken)
        {
            try
            {
                _logger.LogInformation("Attempting to refresh token for provided refreshToken: {RefreshToken}", refreshToken);

                var user = await _unitOfWork.Users.GetByRefreshTokenAsync(refreshToken);
                if (user == null)
                {
                    _logger.LogWarning("No user found for refresh token: {RefreshToken}", refreshToken);
                    return null;
                }

                if (user.RefreshTokenExpiry < DateTime.UtcNow)
                {
                    _logger.LogWarning("Refresh token expired for user: {Email}", user.Email);
                    return null;
                }

                var newAccessToken = GenerateJwtToken(user);
                var newRefreshToken = GenerateSecureRefreshToken();

                user.RefreshToken = newRefreshToken;
                user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(_jwtOptions.RefreshTokenExpiryDays);

                await _unitOfWork.Users.UpdateAsync(user);
                await _unitOfWork.SaveChangesAsync();

                _logger.LogInformation("Refresh token successfully rotated for user: {Email}", user.Email);

                return new LoginResponse
                {
                    Token = newAccessToken,
                    RefreshToken = newRefreshToken
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while refreshing token for refreshToken: {RefreshToken}", refreshToken);
                throw;
            }
        }

        private string GenerateJwtToken(User user)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.UTF8.GetBytes(_jwtOptions.Key);

                if (key.Length < 32)
                {
                    _logger.LogWarning("JWT key length is insufficient: {Length} bytes", key.Length);
                }

                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(new[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                        new Claim(ClaimTypes.Email, user.Email),
                        new Claim(ClaimTypes.Role, user.Role.ToString())
                    }),
                    Expires = DateTime.UtcNow.AddMinutes(_jwtOptions.AccessTokenExpiryMinutes),
                    Issuer = _jwtOptions.Issuer,
                    Audience = _jwtOptions.Audience,
                    SigningCredentials = new SigningCredentials(
                        new SymmetricSecurityKey(key),
                        SecurityAlgorithms.HmacSha256Signature)
                    };

                var token = tokenHandler.CreateToken(tokenDescriptor);
                return tokenHandler.WriteToken(token);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate JWT token for user: {Email}", user.Email);
                throw;
            }
        }


        private static string GenerateSecureRefreshToken()
        {
            try
            {
                var randomBytes = new byte[64];
                using var rng = RandomNumberGenerator.Create();
                rng.GetBytes(randomBytes);
                return Convert.ToBase64String(randomBytes);
            }
            catch (Exception ex)
            {
                // Optional: log or rethrow if needed
                throw new InvalidOperationException("Failed to generate secure refresh token", ex);
            }
        }

    }
}
