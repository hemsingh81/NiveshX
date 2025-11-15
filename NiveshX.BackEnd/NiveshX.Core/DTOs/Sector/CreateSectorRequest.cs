using System.ComponentModel.DataAnnotations;

namespace NiveshX.Core.DTOs.Sector
{
    public class CreateSectorRequest
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }
    }

}
