using System;
using System.Collections.Generic;
using System.Data.OleDb;
using System.Linq;
using System.Web;
using Storeprocedure.Service.Models.Interface;
using Storeprocedure.Service.Models.ViewModel;

namespace Storeprocedure.Service.Models.Repository
{
    public class TableRepository : ITables
    {
        private OleDbConnection con;

        public TableRepository(OleDbConnection _con)
        {
            con = _con;
        }

        public List<Table> GetTable()
        {
            List<Table> table = new List<Table>();
            //string Connection = @"Provider=SQLOLEDB; Data Source=172.17.0.147\sqlexpress; User Id=sa; Password=Changep0nd; Initial Catalog=AgileQuote;";
            //string Command = "select * from information_schema.TABLES";
            //con = new OleDbConnection(Connection);

            string Command = "SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' and TABLE_NAME NOT LIKE '%sysdiagrams%'";

            con.Open();
            using (OleDbCommand cmd = new OleDbCommand(Command, con))
            {
                using (OleDbDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        Table oTable = new Table();
                        oTable.Table_Name = reader.GetValue(2).ToString();
                        oTable.Table_Schema = reader.GetValue(1).ToString();
                        string ColumnCommand = "select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME='" + reader.GetValue(2).ToString() + "' order by ORDINAL_POSITION";
                        using (OleDbCommand columnCmd = new OleDbCommand(ColumnCommand, con))
                        {
                            using (OleDbDataReader columnReader = columnCmd.ExecuteReader())
                            {
                                List<Column> _columns = new List<Column>();
                                while (columnReader.Read())
                                {
                                    Column oColumn = new Column();
                                    oColumn.Column_Name = columnReader.GetValue(3).ToString();
                                    oColumn.Data_Type = columnReader.GetValue(7).ToString();
                                    _columns.Add(oColumn);
                                }
                                oTable.Columns = _columns;
                            }
                        }

                        string primarikeyCommand = "SELECT i.name AS IndexName, OBJECT_NAME(ic.OBJECT_ID) AS TableName,COL_NAME(ic.OBJECT_ID,ic.column_id) AS ColumnName";
                        primarikeyCommand = primarikeyCommand + " FROM sys.indexes AS i INNER JOIN sys.index_columns AS ic ON i.OBJECT_ID = ic.OBJECT_ID AND i.index_id = ic.index_id";
                        primarikeyCommand = primarikeyCommand + " WHERE i.is_primary_key = 1 and OBJECT_NAME(ic.OBJECT_ID)='" + reader.GetValue(2).ToString() + "'";

                        using (OleDbCommand pCommand = new OleDbCommand(primarikeyCommand, con))
                        {
                            using (OleDbDataReader pReader = pCommand.ExecuteReader())
                            {
                                while (pReader.Read())
                                {
                                    oTable.PrimariKey = pReader.GetValue(2).ToString();
                                }
                            }
                        }

                        string forignkeyCommand = "SELECT f.name AS ForeignKey, OBJECT_NAME(f.parent_object_id) AS TableName, COL_NAME(fc.parent_object_id, fc.parent_column_id) AS ColumnName,";
                        forignkeyCommand = forignkeyCommand + " OBJECT_NAME (f.referenced_object_id) AS ReferenceTableName, COL_NAME(fc.referenced_object_id, fc.referenced_column_id) AS ReferenceColumnName";
                        forignkeyCommand = forignkeyCommand + " FROM sys.foreign_keys AS f INNER JOIN sys.foreign_key_columns AS fc ON f.OBJECT_ID = fc.constraint_object_id WHERE ";
                        forignkeyCommand = forignkeyCommand + " OBJECT_NAME(f.parent_object_id)='" + reader.GetValue(2).ToString() + "'";

                        using (OleDbCommand fCommand = new OleDbCommand(forignkeyCommand, con))
                        {
                            using (OleDbDataReader fReader = fCommand.ExecuteReader())
                            {
                                List<RelationShip> _RelationShips = new List<RelationShip>();
                                while (fReader.Read())
                                {
                                    RelationShip _relation = new RelationShip();
                                    _relation.ForignKeyColumn = fReader.GetValue(2).ToString();
                                    _relation.PrimaryKeyTable = fReader.GetValue(3).ToString();
                                    _relation.PrimaryKeyColumn = fReader.GetValue(4).ToString();
                                    _RelationShips.Add(_relation);
                                }
                                oTable.Relations = _RelationShips;
                            }
                        }

                        table.Add(oTable);
                    }
                }
            }
            return table;
        }

        public void Dispose()
        {
            con.Close();
        }
    }
}