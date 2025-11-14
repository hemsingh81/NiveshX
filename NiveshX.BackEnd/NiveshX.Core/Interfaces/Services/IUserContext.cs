using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NiveshX.Core.Interfaces.Services
{
    public interface IUserContext
    {
        string UserId { get; }
        string UserEmail { get; }
        string UserRole { get; }
    }

}
