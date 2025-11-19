using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NiveshX.Core.Config
{
    public enum UserRole
    {
        [Display(Name = "None")]
        None,

        [Display(Name = "Administrator")]
        Admin,

        [Display(Name = "Master")]
        Master,

        [Display(Name = "Trader")]
        Trader,

        [Display(Name = "Viewer")]
        Viewer
    }

    public enum AssetType
    {
        [Display(Name = "Equity")]
        Equity,

        [Display(Name = "Futures")] 
        Futures,

        [Display(Name = "Options")]
        Options,

        [Display(Name = "Forex")]
        Forex
    }

}
