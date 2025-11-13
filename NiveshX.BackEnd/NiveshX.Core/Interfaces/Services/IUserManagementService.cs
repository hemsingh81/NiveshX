using NiveshX.Core.DTOs.User;
using NiveshX.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NiveshX.Core.Interfaces.Services
{
    public interface IUserManagementService
    {
        Task<IEnumerable<UserResponse>> GetAllUsersAsync(CancellationToken cancellationToken = default);
        Task<UserResponse?> GetUserByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<UserResponse> CreateUserAsync(CreateUserRequest request, CancellationToken cancellationToken = default);
        Task<UserResponse?> UpdateUserAsync(Guid id, UpdateUserRequest request, CancellationToken cancellationToken = default);
        Task<bool> DeleteUserAsync(Guid id, CancellationToken cancellationToken = default);
    }

}
