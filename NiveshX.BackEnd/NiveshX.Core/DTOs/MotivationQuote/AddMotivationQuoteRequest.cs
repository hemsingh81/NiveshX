using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NiveshX.Core.DTOs.MotivationQuote
{
    public class AddMotivationQuoteRequest
    {
        public string Quote { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
    }

}
