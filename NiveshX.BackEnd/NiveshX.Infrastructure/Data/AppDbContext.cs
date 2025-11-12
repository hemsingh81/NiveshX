using Microsoft.EntityFrameworkCore;
using NiveshX.Core.Config;
using NiveshX.Core.Models;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace NiveshX.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<User> Users => Set<User>();
        public DbSet<MotivationQuote> MotivationQuotes => Set<MotivationQuote>();

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Soft delete filter
            modelBuilder.Entity<User>().HasQueryFilter(u => !u.IsDeleted);

            // Default values for audit fields
            modelBuilder.Entity<User>().Property(u => u.IsActive).HasDefaultValue(true);
            modelBuilder.Entity<User>().Property(u => u.IsDeleted).HasDefaultValue(false);
            modelBuilder.Entity<User>().Property(u => u.CreatedOn).HasDefaultValueSql("GETUTCDATE()");
            modelBuilder.Entity<User>().Property(u => u.CreatedBy).HasDefaultValue("system");
            modelBuilder.Entity<User>().Property(u => u.Role).HasConversion<string>();


            // Unique index on Email
            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();

            // Seed admin user
            var passwordHash = "$2a$11$7SacvvnY60SyyWyDD/lmsuNvANz/cR5.763EBaidcDmL.y53UjOXS"; // bcrypt hash of "as"
            modelBuilder.Entity<User>().HasData(new User
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                Name = "Hem Singh",
                Email = "admin@niveshx.com",
                IsEmailConfirmed = true,
                PasswordHash = passwordHash,
                Role = UserRole.Admin,
                RefreshToken = string.Empty,
                RefreshTokenExpiry = new DateTime(2025, 12, 8, 0, 0, 0, DateTimeKind.Utc),
                PhoneNumber = null,
                IsPhoneConfirmed = false,
                LastLoginOn = null,
                ProfilePictureUrl = null,
                IsLockedOut = false,
                FailedLoginAttempts = 0,
                IsActive = true,
                IsDeleted = false,
                CreatedOn = new DateTime(2025, 11, 8, 0, 0, 0, DateTimeKind.Utc),
                CreatedBy = "system",
                ModifiedOn = null,
                ModifiedBy = null
            });
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            foreach (var entry in ChangeTracker.Entries<AuditableEntity>())
            {
                if (entry.State == EntityState.Added)
                {
                    entry.Entity.CreatedOn = DateTime.UtcNow;
                    entry.Entity.CreatedBy = "system"; // Replace with actual user context
                }
                else if (entry.State == EntityState.Modified)
                {
                    entry.Entity.ModifiedOn = DateTime.UtcNow;
                    entry.Entity.ModifiedBy = "system"; // Replace with actual user context
                }
            }

            return await base.SaveChangesAsync(cancellationToken);
        }
    }
}
