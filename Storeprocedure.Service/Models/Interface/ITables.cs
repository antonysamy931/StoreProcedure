using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Storeprocedure.Service.Models.ViewModel;

namespace Storeprocedure.Service.Models.Interface
{
    interface ITables : IDisposable
    {
        List<Table> GetTable();
    }
}
