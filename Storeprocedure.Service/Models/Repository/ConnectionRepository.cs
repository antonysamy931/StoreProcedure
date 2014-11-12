using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Storeprocedure.Service.Models.Interface;
using System.Data.OleDb;

namespace Storeprocedure.Service.Models.Repository
{
    public class ConnectionRepository : IConnection, IDisposable
    {
        private OleDbConnection connection;
        public string GetConnection(string Provider, string Server, string UserId, string Password, string DatabaseName)
        {
            string OledbProvider = string.Empty;
            switch (Provider.ToUpper())
            {
                case "SQL SERVER":
                    OledbProvider = "SQLOLEDB";
                    break;
                case "MSACCESS":
                    OledbProvider = "Microsoft.Jet.OLEDB.4.0";
                    break;
                case "ORACLE":
                    OledbProvider = "MSDAORA";
                    break;
                case "MYSQL":
                    OledbProvider = "MySQLProv";
                    break;
                default:
                    OledbProvider = "SQLOLEDB";
                    break;
            }
            if (Server.Contains(','))
            {
                Server = Server.Replace(",", "\\");
            }
            return @"Provider=" + OledbProvider + "; Data Source=" + Server + "; User Id=" + UserId + "; Password=" + Password + "; Initial Catalog=" + DatabaseName + ";";
        }

        public string CheckConnection(string ConnectionString)
        {
            try
            {                
                this.connection = new OleDbConnection(ConnectionString);
                connection.Open();
                return ConnectionString;
            }
            catch (Exception ex)
            {
                return "Connection open failed. Reson " + ex.Message;
            }
        }

        public void Dispose()
        {
            this.connection.Dispose();
        }
    }
}