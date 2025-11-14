using System.ComponentModel.DataAnnotations;

namespace NiveshX.Core.Models
{
    public class Country : AuditableEntity
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Code { get; set; } = string.Empty; // e.g., IN, US, UK
    }


}
