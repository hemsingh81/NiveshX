using Microsoft.EntityFrameworkCore;
using NiveshX.Core.Interfaces.Repositories;
using NiveshX.Core.Models;
using NiveshX.Infrastructure.Data;

namespace NiveshX.Infrastructure.Repositories
{
    public class ClassificationTagRepository : IClassificationTagRepository
    {
        private readonly AppDbContext _context;

        public ClassificationTagRepository(AppDbContext context) => _context = context;

        public async Task<IEnumerable<ClassificationTag>> GetAllAsync(CancellationToken cancellationToken = default)
            => await _context.ClassificationTags.AsNoTracking().Where(t => !t.IsDeleted).ToListAsync(cancellationToken);

        public async Task<ClassificationTag?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
            => await _context.ClassificationTags.FindAsync(new object[] { id }, cancellationToken);

        public async Task AddAsync(ClassificationTag tag, CancellationToken cancellationToken = default)
            => await _context.ClassificationTags.AddAsync(tag, cancellationToken);

        public Task UpdateAsync(ClassificationTag tag, CancellationToken cancellationToken = default)
        {
            _context.ClassificationTags.Update(tag);
            return Task.CompletedTask;
        }

        public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var tag = await _context.ClassificationTags.FindAsync(new object[] { id }, cancellationToken);
            if (tag == null) return false;

            tag.IsDeleted = true;
            tag.ModifiedOn = DateTime.UtcNow;
            tag.ModifiedBy = "system";
            _context.ClassificationTags.Update(tag);
            return true;
        }

        public async Task<bool> ExistsAsync(string name, CancellationToken cancellationToken = default)
        {
            return await ExistsAsync(name, null, cancellationToken);
        }

        public async Task<bool> ExistsAsync(string name, Guid? excludeId, CancellationToken cancellationToken = default)
        {
            var normalized = (name ?? string.Empty).Trim().ToLowerInvariant();

            var query = _context.ClassificationTags
                .AsNoTracking()
                .Where(t => !t.IsDeleted && t.Name.ToLower() == normalized);

            if (excludeId.HasValue)
                query = query.Where(t => t.Id != excludeId.Value);

            return await query.AnyAsync(cancellationToken);
        }

    }

}
