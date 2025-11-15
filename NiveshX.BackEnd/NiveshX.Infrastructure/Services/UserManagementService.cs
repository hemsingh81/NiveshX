using AutoMapper;
using Microsoft.Extensions.Logging;
using NiveshX.Core.DTOs.User;
using NiveshX.Core.Interfaces;
using NiveshX.Core.Interfaces.Services;
using NiveshX.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace NiveshX.Infrastructure.Services
{
    public class UserManagementService : IUserManagementService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<UserManagementService> _logger;
        private readonly IMapper _mapper;

        public UserManagementService(
            IUnitOfWork unitOfWork,
            ILogger<UserManagementService> logger,
            IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _mapper = mapper;
        }

        public async Task<IEnumerable<UserResponse>> GetAllUsersAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Retrieving all users");
                var users = await _unitOfWork.Users.GetAllAsync(cancellationToken);
                return users.Select(u => _mapper.Map<UserResponse>(u));
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
                return user == null ? null : _mapper.Map<UserResponse>(user);
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
                _logger.LogInformation("Creating user: {Email}", request.Email);

                var user = _mapper.Map<User>(request);

                // explicit lifecycle & security wiring
                user.Id = Guid.NewGuid();
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
                user.IsEmailConfirmed = true;
                user.IsPhoneConfirmed = true;
                user.IsLockedOut = false;
                user.IsActive = true;
                user.FailedLoginAttempts = 0;
                user.CreatedOn = DateTime.UtcNow;
                user.CreatedBy = "Admin";

                await _unitOfWork.Users.AddAsync(user, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("User created: {Email}", request.Email);
                return _mapper.Map<UserResponse>(user);
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

                _mapper.Map(request, user);

                // explicit audit wiring
                user.ModifiedOn = DateTime.UtcNow;
                user.ModifiedBy = "Admin";

                await _unitOfWork.Users.UpdateAsync(user, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("User updated: {UserId}", id);
                return _mapper.Map<UserResponse>(user);
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
    }
}
