using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NiveshX.Core.Config
{
    public static class UserRoleExtensions
    {
        public static bool IsAdmin(this UserRole role) => role == UserRole.Admin;
        public static bool IsTrader(this UserRole role) => role == UserRole.Trader;
    }

}
