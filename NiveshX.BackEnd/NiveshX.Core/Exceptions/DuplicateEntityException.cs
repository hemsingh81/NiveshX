using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NiveshX.Core.Exceptions
{
    public class DuplicateEntityException : Exception
    {
        public DuplicateEntityException() { }

        public DuplicateEntityException(string message) : base(message) { }

        public DuplicateEntityException(string message, Exception innerException) : base(message, innerException) { }
    }
}