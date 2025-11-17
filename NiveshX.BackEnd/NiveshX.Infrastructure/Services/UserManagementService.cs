using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using NiveshX.Core.DTOs.User;
using NiveshX.Core.Exceptions;
using NiveshX.Core.Interfaces;
using NiveshX.Core.Interfaces.Services;
using NiveshX.Core.Models;

namespace NiveshX.Infrastructure.Services
{
    public class UserManagementService : BaseService, IUserManagementService
    {
        public UserManagementService(
            IUnitOfWork unitOfWork,
            ILogger<UserManagementService> logger,
            IUserContext userContext,
            IMapper mapper)
            : base(unitOfWork, logger, userContext, mapper)
        {
        }

        public async Task<IEnumerable<UserResponse>> GetAllUsersAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                Logger.LogInformation("Retrieving all users");
                var users = await UnitOfWork.Users.GetAllAsync(cancellationToken);
                return users.Select(u => Mapper.Map<UserResponse>(u));
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error retrieving all users");
                throw;
            }
        }

        public async Task<UserResponse?> GetUserByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            try
            {
                Logger.LogInformation("Retrieving user by ID: {UserId}", id);
                var user = await UnitOfWork.Users.GetByIdAsync(id, cancellationToken);
                return user == null ? null : Mapper.Map<UserResponse>(user);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error retrieving user with ID: {UserId}", id);
                throw;
            }
        }

        public async Task<UserResponse> CreateUserAsync(CreateUserRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                Logger.LogInformation("Creating user: {Email}", request.Email);

                var normalizedEmail = request.Email.Trim().ToLowerInvariant();

                // uniqueness check
                var exists = await UnitOfWork.Users.ExistsByEmailAsync(normalizedEmail, cancellationToken);
                if (exists)
                    throw new DuplicateEntityException($"A user with the email '{request.Email}' already exists.");

                var user = Mapper.Map<User>(request);

                // explicit lifecycle & security wiring
                user.Id = Guid.NewGuid();
                user.Email = normalizedEmail;
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
                user.IsEmailConfirmed = true;
                user.IsPhoneConfirmed = true;
                user.IsLockedOut = false;
                user.IsActive = true;
                user.FailedLoginAttempts = 0;

                SetCreatedAudit(user);

                await UnitOfWork.Users.AddAsync(user, cancellationToken);
                await UnitOfWork.SaveChangesAsync(cancellationToken);

                Logger.LogInformation("User created: {Email}", request.Email);
                return Mapper.Map<UserResponse>(user);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error creating user: {Email}", request.Email);
                throw;
            }
        }

        public async Task<UserResponse?> UpdateUserAsync(Guid id, UpdateUserRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                Logger.LogInformation("Updating user with ID: {UserId}", id);
                var user = await UnitOfWork.Users.GetByIdAsync(id, cancellationToken)
                           ?? throw new NotFoundException($"User not found for update: {id}.");

                // If email is being changed (or provided), validate and check uniqueness
                if (!string.IsNullOrWhiteSpace(request.Email))
                {
                    var normalizedEmail = request.Email.Trim().ToLowerInvariant();

                    var duplicate = await UnitOfWork.Users.ExistsByEmailAsync(normalizedEmail, excludeId: id, cancellationToken);
                    if (duplicate)
                        throw new DuplicateEntityException($"A user with the email '{request.Email}' already exists.");

                    user.Email = normalizedEmail;
                }

                Mapper.Map(request, user);

                // explicit audit wiring
                SetModifiedAudit(user);

                await UnitOfWork.Users.UpdateAsync(user, cancellationToken);
                await UnitOfWork.SaveChangesAsync(cancellationToken);

                Logger.LogInformation("User updated: {UserId}", id);
                return Mapper.Map<UserResponse>(user);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error updating user with ID: {UserId}", id);
                throw;
            }
        }

        public async Task<bool> DeleteUserAsync(Guid id, CancellationToken cancellationToken = default)
        {
            try
            {
                Logger.LogInformation("Deleting user with ID: {UserId}", id);

                var user = await UnitOfWork.Users.GetByIdAsync(id, cancellationToken)
                           ?? throw new NotFoundException($"User not found for deletion: {id}.");

                // soft-delete and set audit info
                user.IsDeleted = true;
                SetModifiedAudit(user);

                await UnitOfWork.Users.UpdateAsync(user, cancellationToken);
                await UnitOfWork.SaveChangesAsync(cancellationToken);

                Logger.LogInformation("User deleted: {UserId}", id);
                return true;
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error deleting user with ID: {UserId}", id);
                throw;
            }
        }
    }
}
