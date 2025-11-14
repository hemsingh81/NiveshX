using System.ComponentModel.DataAnnotations;

namespace NiveshX.Core.DTOs.Country
{
    public class CreateCountryRequest
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Code { get; set; } = string.Empty;
    }

}
