using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NiveshX.Core.Models
{
    public class MarketCalendar : AuditableEntity
    {
        [Required]
        public Guid ExchangeId { get; set; }

        [ForeignKey(nameof(ExchangeId))]
        public Exchange? Exchange { get; set; }

        // Regular session times
        public TimeSpan? RegularOpenTime { get; set; }
        public TimeSpan? RegularCloseTime { get; set; }

        // Pre-market session times
        public TimeSpan? PreMarketOpen { get; set; }
        public TimeSpan? PreMarketClose { get; set; }

        // Post-market session times
        public TimeSpan? PostMarketOpen { get; set; }
        public TimeSpan? PostMarketClose { get; set; }

        // Holidays and session rules stored as JSON
        public string? HolidayDatesJson { get; set; } = "[]";

        // Example schema: { "earlyClose": [{ "date":"2025-12-24", "closeAt":"13:00:00" }], "gapHandling": "shift" }
        public string? SessionRulesJson { get; set; } = "{}";

        // Concurrency token for optimistic concurrency
        [Timestamp]
        public byte[]? RowVersion { get; set; }
    }
}
