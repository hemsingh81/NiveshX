using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NiveshX.Core.DTOs.User
{
    public class UpdateProfileRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
    }
}
