using System.ComponentModel.DataAnnotations;

namespace NiveshX.Core.Models
{
    public class Sector : AuditableEntity
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }
    }

}