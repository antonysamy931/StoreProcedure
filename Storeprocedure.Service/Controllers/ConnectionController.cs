using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Storeprocedure.Service.Models.Interface;
using Storeprocedure.Service.Models.Repository;
using Storeprocedure.Service.Models.ViewModel;

namespace Storeprocedure.Service.Controllers
{
    [RoutePrefix("Procedure")]
    public class ConnectionController : ApiController
    {
        private IConnection repository = null;
        private IDatabase databaseRepository = null;
        public Database _database = null;
        public ConnectionController()
        {
            repository = new ConnectionRepository();
            _database = new Database();
        }

        [Route("Connection/Provider={provider}/Server={server}/Userid={userid}/Password={password}/Database={database}")]
        [HttpGet]
        public IHttpActionResult CheckConnection(string provider, string server, string userid, string password, string database)
        {
            string connectionString = repository.GetConnection(provider, server, userid, password, database);
            if (connectionString != null)
            {
                string checkConnection = repository.CheckConnection(connectionString);
                if (!checkConnection.Contains("fail"))
                {
                    _database.ConnectionString = checkConnection;
                    databaseRepository = new DatabaseRepository(checkConnection, _database);
                    databaseRepository.GetDatabase();
                    return Ok(_database);
                }
                else
                {
                    return BadRequest(checkConnection);
                }
            }
            return BadRequest();
        }
    }
}
