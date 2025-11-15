using System.ComponentModel.DataAnnotations;

namespace NiveshX.Core.Models
{
    public class ClassificationTag : AuditableEntity
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        public string? Category { get; set; }

        public string? Description { get; set; }
    }

}
