using System.ComponentModel.DataAnnotations;

namespace NiveshX.Core.DTOs.StockMarket
{
    public class UpdateStockMarketRequest
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Code { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        [Required]
        public Guid CountryId { get; set; }

        public bool IsActive { get; set; } = true;
    }
}