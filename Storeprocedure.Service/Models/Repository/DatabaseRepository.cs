using System;
using System.Collections.Generic;
using System.Data.OleDb;
using System.Linq;
using System.Web;
using Storeprocedure.Service.Models.Interface;
using Storeprocedure.Service.Models.ViewModel;

namespace Storeprocedure.Service.Models.Repository
{
    public class DatabaseRepository : IDatabase, IDisposable
    {
        private OleDbConnection con;
        private ITables tableRepo = null;
        private Database _database = null;

        public DatabaseRepository(string ConnectionString, Database oDatabase)
        {
            con = new OleDbConnection(ConnectionString);
            tableRepo = new TableRepository(con);
            _database = oDatabase;
        }

        public void GetDatabase()
        {
            _database.Tables = tableRepo.GetTable();
        }

        public void Dispose()
        {
            con.Dispose();
            tableRepo.Dispose();
        }
    }
}