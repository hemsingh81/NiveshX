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
        public DbSet<Country> Countries => Set<Country>();
        public DbSet<Industry> Industries => Set<Industry>();
        public DbSet<Sector> Sectors => Set<Sector>();
        public DbSet<ClassificationTag> ClassificationTags => Set<ClassificationTag>();
        public DbSet<StockMarket> StockMarkets => Set<StockMarket>();

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);


            ApplyAuditableEntityDefaults(modelBuilder);
            
            // Unique index on Email
            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();

            SeedUser(modelBuilder);
            SeedMotivationQuotes(modelBuilder);
            SeedCountries(modelBuilder);
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

        #region Private Methods

        private void ApplyAuditableEntityDefaults(ModelBuilder modelBuilder)
        {
            var auditableEntityType = typeof(AuditableEntity);

            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                if (auditableEntityType.IsAssignableFrom(entityType.ClrType))
                {
                    var builder = modelBuilder.Entity(entityType.ClrType);

                    builder.Property(nameof(AuditableEntity.Id))
                           .HasDefaultValueSql("NEWID()");

                    builder.Property(nameof(AuditableEntity.IsActive))
                           .HasDefaultValue(true);

                    builder.Property(nameof(AuditableEntity.IsDeleted))
                           .HasDefaultValue(false);

                    builder.Property(nameof(AuditableEntity.CreatedOn))
                           .HasDefaultValueSql("GETUTCDATE()");

                    builder.Property(nameof(AuditableEntity.CreatedBy))
                           .HasDefaultValue("system");
                }
            }
        }

        private static void SeedCountries(ModelBuilder modelBuilder)
        {
            var createdOn = new DateTime(2025, 12, 8, 0, 0, 0, DateTimeKind.Utc);
            modelBuilder.Entity<Country>().HasData(
                 new Country
                 {
                     Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                     Name = "International",
                     Code = "International",
                     CreatedOn = createdOn,
                     CreatedBy = "system",
                     IsActive = true,
                     IsDeleted = false
                 },
                 new Country
                 {
                     Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                     Name = "India",
                     Code = "IN",
                     CreatedOn = createdOn,
                     CreatedBy = "system",
                     IsActive = true,
                     IsDeleted = false
                 }
            );
        }

        private static void SeedMotivationQuotes(ModelBuilder modelBuilder)
        {
            var createdOn = new DateTime(2025, 12, 8, 0, 0, 0, DateTimeKind.Utc);
            modelBuilder.Entity<MotivationQuote>().HasData(
                 new MotivationQuote
                 {
                     Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                     Quote = "Believe you can and you're halfway there.",
                     Author = "Theodore Roosevelt",
                     CreatedOn = createdOn,
                     CreatedBy = "system",
                     IsActive = true,
                     IsDeleted = false
                 },
                 new MotivationQuote
                 {
                     Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                     Quote = "Success is not final, failure is not fatal: It is the courage to continue that counts.",
                     Author = "Winston Churchill",
                     CreatedOn = createdOn,
                     CreatedBy = "system",
                     IsActive = true,
                     IsDeleted = false
                 },
                new MotivationQuote
                {
                    Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                    Quote = "The only way to do great work is to love what you do.",
                    Author = "Steve Jobs",
                    CreatedOn = createdOn,
                    CreatedBy = "system",
                    IsActive = true,
                    IsDeleted = false
                }
            );
        }

        private static void SeedUser(ModelBuilder modelBuilder)
        {
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

        #endregion
    }
}
