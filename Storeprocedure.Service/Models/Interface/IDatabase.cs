using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Storeprocedure.Service.Models.Interface
{
    interface IDatabase : IDisposable
    {
        void GetDatabase();
    }
}
