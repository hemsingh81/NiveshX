using System.ComponentModel.DataAnnotations;

namespace NiveshX.Core.DTOs.Industry
{
    public class CreateIndustryRequest
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }
    }

}
