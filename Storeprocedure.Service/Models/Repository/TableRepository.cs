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

                        string childTableCommand = "select a.foreign_table,a.foreign_column,a.parent_column as reference from (select cast(f.name as varchar(255)) as foreign_key_name, cast(c.name as varchar(255)) as foreign_table,";
                        childTableCommand = childTableCommand + " cast(fc.name as varchar(255)) as foreign_column, cast(p.name as varchar(255)) as parent_table, cast(rc.name as varchar(255)) as parent_column from  sysobjects f";
                        childTableCommand = childTableCommand + " inner join sysobjects c on f.parent_obj = c.id inner join sysreferences r on f.id = r.constid inner join sysobjects p on r.rkeyid = p.id inner join syscolumns rc on r.rkeyid = rc.id and r.rkey1 = rc.colid";
                        childTableCommand = childTableCommand + " inner join syscolumns fc on r.fkeyid = fc.id and r.fkey1 = fc.colid where f.type = 'F') as a where a.parent_table='" + reader.GetValue(2).ToString() + "'";

                        List<ParentChildTable> _ParentChildTable = new List<ParentChildTable>();

                        using (OleDbCommand cCommand = new OleDbCommand(childTableCommand, con))
                        {
                            using (OleDbDataReader cReader = cCommand.ExecuteReader())
                            {
                                List<ChildTable> _ChildTable = new List<ChildTable>();
                                while (cReader.Read())
                                {
                                    ChildTable _childTable = new ChildTable();
                                    _childTable.ForignKeyTable = cReader.GetValue(0).ToString();
                                    _childTable.ForignKeyColumn = cReader.GetValue(1).ToString();
                                    _childTable.PrimaryKeyColumn = cReader.GetValue(2).ToString();
                                    _ChildTable.Add(_childTable);

                                    ParentChildTable _parentChildTable = new ParentChildTable();
                                    _parentChildTable.TableName = cReader.GetValue(0).ToString();
                                    _parentChildTable.KeyColumn = cReader.GetValue(1).ToString();
                                    _parentChildTable.ReferenceColumn = cReader.GetValue(2).ToString();
                                    _ParentChildTable.Add(_parentChildTable);
                                }
                                oTable.ChildTables = _ChildTable;
                            }
                        }

                        string parentTableCommand = "select a.parent_table,a.parent_column,a.foreign_column as reference from (select cast(f.name as varchar(255)) as foreign_key_name, cast(c.name as varchar(255)) as foreign_table, cast(fc.name as varchar(255)) as foreign_column,";
                        parentTableCommand = parentTableCommand + " cast(p.name as varchar(255)) as parent_table , cast(rc.name as varchar(255)) as parent_column from  sysobjects f inner join sysobjects c on f.parent_obj = c.id inner join sysreferences r on f.id = r.constid";
                        parentTableCommand = parentTableCommand + " inner join sysobjects p on r.rkeyid = p.id inner join syscolumns rc on r.rkeyid = rc.id and r.rkey1 = rc.colid inner join syscolumns fc on r.fkeyid = fc.id and r.fkey1 = fc.colid where f.type = 'F') as a where a.foreign_table='" + reader.GetValue(2).ToString() + "'";

                        using (OleDbCommand pCommand = new OleDbCommand(parentTableCommand, con))
                        {
                            using (OleDbDataReader pReader = pCommand.ExecuteReader())
                            {
                                List<ParentTable> _ParentTable = new List<ParentTable>();
                                while(pReader.Read()){
                                    ParentTable _parentTable = new ParentTable();
                                    _parentTable.PrimaryKeyTable = pReader.GetValue(0).ToString();
                                    _parentTable.PrimaryKeyColumn = pReader.GetValue(1).ToString();
                                    _parentTable.ForignKeyColumn = pReader.GetValue(2).ToString();
                                    _ParentTable.Add(_parentTable);

                                    ParentChildTable _parentChildTable = new ParentChildTable();
                                    _parentChildTable.TableName = pReader.GetValue(0).ToString();
                                    _parentChildTable.KeyColumn = pReader.GetValue(1).ToString();
                                    _parentChildTable.ReferenceColumn = pReader.GetValue(2).ToString();
                                    _ParentChildTable.Add(_parentChildTable);
                                }
                                oTable.ParentTables = _ParentTable;
                            }
                        }

                        oTable.ParentChildTables = _ParentChildTable;

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