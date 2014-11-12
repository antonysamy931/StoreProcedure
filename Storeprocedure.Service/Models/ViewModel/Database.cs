using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Storeprocedure.Service.Models.ViewModel
{
    public class Table
    {
        public string Table_Schema { get; set; }
        public string Table_Name { get; set; }
        public List<Column> Columns { get; set; }
        public string PrimariKey { get; set; }
        public List<RelationShip> Relations { get; set; }
    }

    public class Column
    {
        public string Column_Name { get; set; }
        public string Data_Type { get; set; }
    }

    public class RelationShip
    {
        public string ForignKeyColumn { get; set; }
        public string PrimaryKeyTable { get; set; }
        public string PrimaryKeyColumn { get; set; }
    }

    public class Database
    {
        public string ConnectionString { get; set; }
        public List<Table> Tables { get; set; }
    }
}