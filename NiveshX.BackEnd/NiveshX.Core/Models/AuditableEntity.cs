using System.ComponentModel.DataAnnotations;

namespace NiveshX.Core.Models
{

    public interface IAuditable
    {
        DateTime CreatedOn { get; set; }
        string CreatedBy { get; set; }
        DateTime? ModifiedOn { get; set; }
        string? ModifiedBy { get; set; }
        bool IsActive { get; set; }
    }

    public interface ISoftDelete
    {
        bool IsDeleted { get; set; }
    }

    /// <summary>
    /// Base class for entities that require audit tracking.
    /// </summary>
    public abstract class AuditableEntity : IAuditable, ISoftDelete
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        /// <summary>
        /// Indicates whether the entity is active in business logic.
        /// </summary>
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// Indicates whether the entity has been soft-deleted.
        /// </summary>
        public bool IsDeleted { get; set; } = false;

        /// <summary>
        /// Timestamp when the entity was created.
        /// </summary>
        public DateTime CreatedOn { get; set; }

        /// <summary>
        /// Identifier of the user who created the entity.
        /// </summary>
        public string CreatedBy { get; set; } = "system";

        /// <summary>
        /// Timestamp when the entity was last modified.
        /// </summary>
        public DateTime? ModifiedOn { get; set; }

        /// <summary>
        /// Identifier of the user who last modified the entity.
        /// </summary>
        public string? ModifiedBy { get; set; }
    }
}
