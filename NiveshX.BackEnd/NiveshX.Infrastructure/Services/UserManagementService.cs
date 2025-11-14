using Microsoft.Extensions.Logging;
using NiveshX.Core.DTOs.User;
using NiveshX.Core.Interfaces;
using NiveshX.Core.Interfaces.Services;
using NiveshX.Core.Models;

namespace NiveshX.Infrastructure.Services
{
    public class UserManagementService : IUserManagementService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<UserManagementService> _logger;

        public UserManagementService(IUnitOfWork unitOfWork, ILogger<UserManagementService> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<IEnumerable<UserResponse>> GetAllUsersAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Retrieving all users");
                var users = await _unitOfWork.Users.GetAllAsync(cancellationToken);
                return users.Select(MapToResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all users");
                throw;
            }
        }

        public async Task<UserResponse?> GetUserByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Retrieving user by ID: {UserId}", id);
                var user = await _unitOfWork.Users.GetByIdAsync(id, cancellationToken);
                return user == null ? null : MapToResponse(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user with ID: {UserId}", id);
                throw;
            }
        }

        public async Task<UserResponse> CreateUserAsync(CreateUserRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                var user = new User
                {
                    Id = Guid.NewGuid(),
                    Name = request.Name,
                    Email = request.Email,
                    PhoneNumber = request.PhoneNumber,
                    Role = request.Role,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                    IsEmailConfirmed = true,
                    IsPhoneConfirmed = true,
                    IsLockedOut = false,
                    IsActive = true,
                    FailedLoginAttempts = 0,
                    CreatedOn = DateTime.UtcNow,
                    CreatedBy = "Admin"
                };

                await _unitOfWork.Users.AddAsync(user, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("User created: {Email}", request.Email);
                return MapToResponse(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user: {Email}", request.Email);
                throw;
            }
        }

        public async Task<UserResponse?> UpdateUserAsync(Guid id, UpdateUserRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Updating user with ID: {UserId}", id);
                var user = await _unitOfWork.Users.GetByIdAsync(id, cancellationToken);
                if (user == null)
                {
                    _logger.LogWarning("User not found for update: {UserId}", id);
                    return null;
                }

                user.Name = request.Name;
                user.Email = request.Email;
                user.PhoneNumber = request.PhoneNumber;
                user.Role = request.Role;
                user.IsEmailConfirmed = request.IsEmailConfirmed;
                user.IsPhoneConfirmed = request.IsPhoneConfirmed;
                user.IsLockedOut = request.IsLockedOut;
                user.FailedLoginAttempts = request.FailedLoginAttempts;
                user.IsActive = request.IsActive;
                user.ModifiedOn = DateTime.UtcNow;
                user.ModifiedBy = "Admin";

                await _unitOfWork.Users.UpdateAsync(user, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("User updated: {UserId}", id);
                return MapToResponse(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user with ID: {UserId}", id);
                throw;
            }
        }

        public async Task<bool> DeleteUserAsync(Guid id, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Deleting user with ID: {UserId}", id);
                var success = await _unitOfWork.Users.DeleteAsync(id, cancellationToken);
                if (success)
                {
                    await _unitOfWork.SaveChangesAsync(cancellationToken);
                    _logger.LogInformation("User deleted: {UserId}", id);
                }
                else
                {
                    _logger.LogWarning("User not found for deletion: {UserId}", id);
                }

                return success;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user with ID: {UserId}", id);
                throw;
            }
        }

        private static UserResponse MapToResponse(User user) => new()
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            Role = user.Role.ToString(),
            IsEmailConfirmed = user.IsEmailConfirmed,
            IsPhoneConfirmed = user.IsPhoneConfirmed,
            IsLockedOut = user.IsLockedOut,
            IsActive = user.IsActive,
            FailedLoginAttempts = user.FailedLoginAttempts,
            LastLoginOn = user.LastLoginOn
        };
    }

}
