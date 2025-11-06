namespace NiveshX.Core.Models
{
    public abstract class AuditableEntity
    {
        public bool IsActive { get; set; } = true;
        public bool IsDeleted { get; set; } = false;

        public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
        public string CreatedBy { get; set; } = "system";

        public DateTime? ModifiedOn { get; set; }
        public string? ModifiedBy { get; set; } 
    }
}
