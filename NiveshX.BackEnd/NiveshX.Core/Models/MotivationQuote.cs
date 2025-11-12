namespace NiveshX.Core.Models
{
    public class MotivationQuote : AuditableEntity
    {
        public string Quote { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
    }


}
