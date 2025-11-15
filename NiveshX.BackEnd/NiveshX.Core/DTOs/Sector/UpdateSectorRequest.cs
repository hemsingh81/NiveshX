using System.ComponentModel.DataAnnotations;

namespace NiveshX.Core.DTOs.Sector
{
    public class UpdateSectorRequest
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
    }

}
