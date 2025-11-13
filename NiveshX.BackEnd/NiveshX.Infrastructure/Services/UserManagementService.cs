using Azure.Core;
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
                return users.Select(ToDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving all users");
                throw;
            }
        }

        private static UserResponse ToDto(User user) => new()
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


        public async Task<UserResponse?> GetUserByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Retrieving user by ID: {UserId}", id);
                var user = await _unitOfWork.Users.GetByIdAsync(id, cancellationToken);
                return user == null ? null : ToDto(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving user with ID: {UserId}", id);
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
                    IsEmailConfirmed = true,
                    PhoneNumber = request.PhoneNumber,
                    IsPhoneConfirmed = true,
                    Role = request.Role,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                    IsLockedOut = false,
                    IsActive = true,
                    FailedLoginAttempts = 0,
                    CreatedOn = DateTime.UtcNow,
                    CreatedBy = "Admin"
                };

                await _unitOfWork.Users.AddAsync(user, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("User created successfully: {Email}", request.Email);
                return ToDto(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating user: {Email}", request.Email);
                throw;
            }
        }

        public async Task<UserResponse?> UpdateUserAsync(Guid id, UpdateUserRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Updating user with ID: {UserId}", id);
                var existing = await _unitOfWork.Users.GetByIdAsync(id, cancellationToken);
                if (existing == null)
                {
                    _logger.LogWarning("User not found for update: {UserId}", id);
                    return null;
                }

                existing.Name = request.Name;
                existing.Email = request.Email;
                existing.IsEmailConfirmed = request.IsEmailConfirmed;
                existing.PhoneNumber = request.PhoneNumber;
                existing.IsPhoneConfirmed = request.IsPhoneConfirmed;
                existing.Role = request.Role;
                existing.IsLockedOut = request.IsLockedOut;
                existing.FailedLoginAttempts = request.FailedLoginAttempts;
                existing.IsActive = request.IsActive;
                existing.ModifiedOn = DateTime.UtcNow;
                existing.ModifiedBy = "Admin";

                await _unitOfWork.Users.UpdateAsync(existing, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("User updated successfully: {UserId}", id);
                return ToDto(existing);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating user with ID: {UserId}", id);
                throw;
            }
        }

        public async Task<bool> DeleteUserAsync(Guid id, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Attempting to delete user with ID: {UserId}", id);
                var success = await _unitOfWork.Users.DeleteAsync(id, cancellationToken);
                if (success)
                {
                    await _unitOfWork.SaveChangesAsync(cancellationToken);
                    _logger.LogInformation("User deleted successfully: {UserId}", id);
                }
                else
                {
                    _logger.LogWarning("User not found for deletion: {UserId}", id);
                }

                return success;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting user with ID: {UserId}", id);
                throw;
            }
        }
    }
}
