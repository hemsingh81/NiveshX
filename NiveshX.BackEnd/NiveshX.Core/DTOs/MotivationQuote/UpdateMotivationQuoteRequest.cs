using System.ComponentModel.DataAnnotations;

namespace NiveshX.Core.DTOs.MotivationQuote
{
    public class UpdateMotivationQuoteRequest
    {
        [Required]
        public string Quote { get; set; } = string.Empty;

        [Required]
        public string Author { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;
    }

}
