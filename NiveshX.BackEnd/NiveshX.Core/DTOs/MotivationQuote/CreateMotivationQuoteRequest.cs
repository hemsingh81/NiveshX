using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NiveshX.Core.DTOs.MotivationQuote
{

    public class CreateMotivationQuoteRequest
    {
        [Required]
        public string Quote { get; set; } = string.Empty;

        [Required]
        public string Author { get; set; } = string.Empty;
    }

}
