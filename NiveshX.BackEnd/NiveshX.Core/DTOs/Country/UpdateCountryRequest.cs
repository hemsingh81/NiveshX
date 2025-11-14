using System.ComponentModel.DataAnnotations;

namespace NiveshX.Core.DTOs.Country
{
    public class UpdateCountryRequest
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Code { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;
    }


}
