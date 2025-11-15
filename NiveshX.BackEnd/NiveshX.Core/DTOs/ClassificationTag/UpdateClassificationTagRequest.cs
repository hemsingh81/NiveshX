using System.ComponentModel.DataAnnotations;

namespace NiveshX.Core.DTOs.ClassificationTag
{
    public class UpdateClassificationTagRequest
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        public string? Category { get; set; }

        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;
    }

}
