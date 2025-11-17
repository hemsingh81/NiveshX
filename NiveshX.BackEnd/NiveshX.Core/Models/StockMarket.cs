using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NiveshX.Core.Models
{
    public class StockMarket : AuditableEntity
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Code { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        // Relationship to Country
        [Required]
        public Guid CountryId { get; set; }

        [ForeignKey(nameof(CountryId))]
        public Country? Country { get; set; }

    }
}