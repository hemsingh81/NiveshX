using Microsoft.EntityFrameworkCore;
using NiveshX.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NiveshX.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<User> Users => Set<User>();
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>().HasQueryFilter(u => !u.IsDeleted);

            modelBuilder.Entity<User>().Property(u => u.IsActive).HasDefaultValue(true);
            modelBuilder.Entity<User>().Property(u => u.IsDeleted).HasDefaultValue(false);
            modelBuilder.Entity<User>().Property(u => u.CreatedOn).HasDefaultValueSql("GETUTCDATE()");
            modelBuilder.Entity<User>().Property(u => u.CreatedBy).HasDefaultValue("system");

            var passwordHash = "$2a$11$7SacvvnY60SyyWyDD/lmsuNvANz/cR5.763EBaidcDmL.y53UjOXS";

            modelBuilder.Entity<User>().HasData(new User
            {
                Id = 1,
                Username = "as",
                PasswordHash = passwordHash,
                Role = "Admin",
                IsActive = true,
                IsDeleted = false,
                CreatedOn = new DateTime(2023, 01, 01, 00, 00, 00, DateTimeKind.Utc),
                CreatedBy = "system",
                ModifiedOn = null,
                ModifiedBy = null
            });
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var entries = ChangeTracker.Entries<AuditableEntity>();

            foreach (var entry in entries)
            {
                if (entry.State == EntityState.Added)
                {
                    entry.Entity.CreatedOn = DateTime.UtcNow;
                    entry.Entity.CreatedBy = "system"; // Replace with actual user
                }
                else if (entry.State == EntityState.Modified)
                {
                    entry.Entity.ModifiedOn = DateTime.UtcNow;
                    entry.Entity.ModifiedBy = "system"; // Replace with actual user
                }
            }

            return await base.SaveChangesAsync(cancellationToken);
        }


    }
}
