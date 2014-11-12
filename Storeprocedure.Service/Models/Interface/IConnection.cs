using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Storeprocedure.Service.Models.Interface
{
    interface IConnection : IDisposable
    {
        string GetConnection(string Provider, string Server, string UserId, string Password, string DatabaseName);
        string CheckConnection(string ConnectionString);
    }
}
