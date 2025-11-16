namespace NiveshX.Core.DTOs.MotivationQuote
{
    public class MotivationQuoteResponse
    {
        public Guid Id { get; set; }
        public string Quote { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }

}
