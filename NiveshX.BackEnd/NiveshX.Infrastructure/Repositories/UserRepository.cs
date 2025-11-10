using Microsoft.EntityFrameworkCore;
using NiveshX.Core.Interfaces;
using NiveshX.Core.Models;
using NiveshX.Infrastructure.Data;
using System.Threading.Tasks;

namespace NiveshX.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context) => _context = context;

        public async Task<User?> GetByEmailAsync(string email) =>
            await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

        public async Task<User?> GetByRefreshTokenAsync(string refreshToken) =>
            await _context.Users
                .Where(u => u.RefreshToken == refreshToken && !u.IsDeleted && u.IsActive)
                .FirstOrDefaultAsync();

        public async Task AddAsync(User user) =>
            await _context.Users.AddAsync(user);

        public async Task UpdateAsync(User user)
        {
            _context.Users.Update(user);
            await Task.CompletedTask;
        }

        public async Task<User?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Email == username, cancellationToken); // or u.Username if supported
        }

        public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
        }

        public async Task<User?> GetByRefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
        {
            return await _context.Users
                .Where(u => u.RefreshToken == refreshToken && !u.IsDeleted && u.IsActive)
                .FirstOrDefaultAsync(cancellationToken);
        }

        public async Task AddAsync(User user, CancellationToken cancellationToken = default)
        {
            await _context.Users.AddAsync(user, cancellationToken);
        }

        public Task UpdateAsync(User user, CancellationToken cancellationToken = default)
        {
            _context.Users.Update(user);
            return Task.CompletedTask;
        }

        public async Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return await _context.Users.FindAsync(new object[] { id }, cancellationToken);
        }

        public async Task UpdatePasswordAsync(Guid userId, string newPasswordHash, CancellationToken cancellationToken = default)
        {
            var user = await _context.Users.FindAsync(new object[] { userId }, cancellationToken);
            if (user != null)
            {
                user.PasswordHash = newPasswordHash;
                await _context.SaveChangesAsync(cancellationToken);
            }
        }

        public async Task UpdateProfileAsync(Guid userId, string name, string? phoneNumber, CancellationToken cancellationToken = default)
        {
            var user = await _context.Users.FindAsync([userId], cancellationToken);
            if (user != null)
            {
                user.Name = name;
                user.PhoneNumber = phoneNumber;
                await _context.SaveChangesAsync(cancellationToken);
            }
        }



    }
}
