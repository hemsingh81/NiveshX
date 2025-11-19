using System.ComponentModel.DataAnnotations;

namespace NiveshX.Core.DTOs
{
    public record MarketCalendarResponse(
        Guid Id,
        Guid ExchangeId,
        TimeSpan? RegularOpenTime,
        TimeSpan? RegularCloseTime,
        TimeSpan? PreMarketOpen,
        TimeSpan? PreMarketClose,
        TimeSpan? PostMarketOpen,
        TimeSpan? PostMarketClose,
        string? HolidayDatesJson,
        string? SessionRulesJson,
        bool IsActive,
        byte[]? RowVersion
    );

    public class CreateMarketCalendarRequest
    {
        [Required]
        public Guid ExchangeId { get; set; }

        public TimeSpan? RegularOpenTime { get; set; }
        public TimeSpan? RegularCloseTime { get; set; }

        public TimeSpan? PreMarketOpen { get; set; }
        public TimeSpan? PreMarketClose { get; set; }

        public TimeSpan? PostMarketOpen { get; set; }
        public TimeSpan? PostMarketClose { get; set; }

        public string? HolidayDatesJson { get; set; } = "[]";
        public string? SessionRulesJson { get; set; } = "{}";
    }

    public class UpdateMarketCalendarRequest
    {
        [Required]
        public Guid ExchangeId { get; set; }

        public TimeSpan? RegularOpenTime { get; set; }
        public TimeSpan? RegularCloseTime { get; set; }

        public TimeSpan? PreMarketOpen { get; set; }
        public TimeSpan? PreMarketClose { get; set; }

        public TimeSpan? PostMarketOpen { get; set; }
        public TimeSpan? PostMarketClose { get; set; }

        public string? HolidayDatesJson { get; set; } = "[]";
        public string? SessionRulesJson { get; set; } = "{}";

        [Required]
        public byte[] RowVersion { get; set; } = Array.Empty<byte>();

        public bool IsActive { get; set; } = true;
    }
}
