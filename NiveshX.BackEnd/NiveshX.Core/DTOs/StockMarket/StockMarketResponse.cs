using NiveshX.Core.DTOs.Country;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NiveshX.Core.DTOs.StockMarket
{
    public class StockMarketResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsActive { get; set; }

        // Country info (nested)
        public CountryResponse? Country { get; set; }
    }
}