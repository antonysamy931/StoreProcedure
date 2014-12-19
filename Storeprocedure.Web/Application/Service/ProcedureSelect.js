/// <reference path="../../Scripts/angular.min.js" />
/// <reference path="../App.js" />
"use strict";
app.factory('SelectProcedure', function () {
    var selectProcedureFactory = {};
    var tableAlise = [];
    var tableNames = [];
    var _CreateProcedure = function (pro, database) {
        tableAlise = [];
        tableNames = [];
        var procedure = "<span class='blue'>CREATE PROCEDURE</span> [" + pro.Name.toUpperCase() + "]<br/>";
        procedure = procedure + "(<br/>";

        /*Add params*/
        if (pro.select.conditions.length != 0) {
            if (pro.select.conditions[0].fieldName != '') {
                procedure = procedure + _AddParameter(pro);
            }
        }
        /*End params*/

        procedure = procedure + ")<br/>";
        procedure = procedure + "<span class='blue'>AS</span><br/>";
        procedure = procedure + "<span class='blue'>BEGIN</span><br/><br/>";

        /*Statement Starts*/
        procedure = procedure + _SelectStatement(pro, database);
        /*Statement End*/

        /*Add condition*/
        if (pro.select.conditions.length != 0) {
            if (pro.select.conditions[0].fieldName != '') {
                procedure = procedure + "<br/><span class='blue'>WHERE</span> <br/>" + _WhereStatement(pro);
            }
        }
        /*End condition*/

        procedure = procedure + "<br/><br/><span class='blue'>END</span>";
        tableAlise = [];
        tableNames = [];
        return procedure;
    };

    var _AddParameter = function (pro) {
        var params = '';
        for (var i = 0; i < pro.select.conditions.length; i++) {
            var dataType = pro.select.conditions[i].dataType == "varchar" ? "varchar(50)" : pro.select.conditions[i].dataType;
            if (i != pro.select.conditions.length - 1) {
                params = params + '&nbsp;&nbsp;&nbsp;&nbsp;@' + pro.select.conditions[i].fieldName.toUpperCase() + ' <span class="blue">' + dataType + '</span>,<br/>';
            } else {
                params = params + '&nbsp;&nbsp;&nbsp;&nbsp;@' + pro.select.conditions[i].fieldName.toUpperCase() + ' <span class="blue">' + dataType + '</span><br/>';
            }
        }
        return params;
    };

    var _SelectStatement = function (pro, database) {
        var selectField = "";
        var tables = "";
        for (var j = 0; j < pro.select.tableData.length; j++) {
            var select = pro.select.tableData[j].selectedColumns;
            if (select.length !== 0) {
                var fields = pro.select.tableData[j].selectedColumns;
                for (var i = 0; i < fields.length; i++) {
                    if (i == 0 && selectField == '') {
                        selectField = selectField + "&emsp;[t" + Number(j + 1) + "]." + fields[i] + ",<br/>";
                    }
                    else if (i != fields.length - 1) {
                        selectField = selectField + "&emsp;[t" + Number(j + 1) + "]." + fields[i] + ",<br/>";
                    }
                    else {
                        if (pro.select.tableData.length - 1 == j) {
                            selectField = selectField + "&emsp;[t" + Number(j + 1) + "]." + fields[i];
                        }
                        else {
                            selectField = selectField + "&emsp;[t" + Number(j + 1) + "]." + fields[i] + ",<br/>";
                        }
                    }
                }
            }
            else {
                if (selectField == '') {
                    if (pro.select.tableData.length - 1 == j) {
                        selectField = selectField + "&emsp;[t" + Number(j + 1) + "].*";
                    } else {
                        selectField = selectField + "&emsp;[t" + Number(j + 1) + "].*,<br/>";
                    }
                }
                else {
                    if (pro.select.tableData.length - 1 == j) {
                        selectField = selectField + "&emsp;[t" + Number(j + 1) + "].*";
                    } else {
                        selectField = selectField + "&emsp;[t" + Number(j + 1) + "].*,<br/>";
                    }
                    //selectField = selectField + ",<br/>&emsp;[t" + Number(j + 1) + "].*";
                }
            }

            if (tables == '') {
                tables = "[" + pro.select.tableData[j].tableName + "] <span class='blue'>AS</span> t" + Number(j + 1);
            }
            else {
                tables = tables + " ,[" + pro.select.tableData[j].tableName + "] <span class='blue'>AS</span> t" + Number(j + 1);
            }
            tableAlise.push({ name: pro.select.tableData[j].tableName, alise: 't' + Number(j + 1) });
            tableNames.push(pro.select.tableData[j].tableName);
        }
        var joinstatement = _join(pro, database);
        return "<span class='blue'>SELECT</span> <br/> " + selectField + " <br/><span class='blue'>FROM</span> <br/>" + joinstatement;
    };

    var _WhereStatement = function (pro) {
        var where = '';
        for (var i = 0; i < pro.select.conditions.length; i++) {
            /*for (var j = 0; j < tableAlise.length; j++) {
                if (pro.select.conditions[i].table == tableAlise[j].name) {*/
            var value = _Operator(pro.select.conditions[i].optrValue).replace('{}', '@' + pro.select.conditions[i].fieldName);
            /*var condition = '[' + tableAlise[j].alise + '].[' + pro.select.conditions[i].fieldName + ']' + value;*/
            var condition = '[' + GetAliseName(pro.select.conditions[i].table) + '].[' + pro.select.conditions[i].fieldName + ']' + value;
            if (i == 0) {
                if (pro.select.conditions.length > 1) {
                    where = condition + _logicalOperator(pro.select.conditions[i].logicalOperator) + ' <br/> ';
                }
                else {
                    where = condition;
                }
            }
            else if (i != pro.select.conditions.length - 1) {
                where = where + condition + _logicalOperator(pro.select.conditions[i].logicalOperator) + ' <br/> ';
            }
            else {
                where = where + condition + _logicalOperator(pro.select.conditions[i].logicalOperator);
            }
            /*}
        }*/
        }
        return where;
    };

    var GetAliseName = function (tableName) {
        for (var k = 0; k < tableAlise.length; k++) {
            if (tableAlise[k].name == tableName) {
                return tableAlise[k].alise;
            }
        }
    };

    var _Operator = function (operator) {
        var symbol = '';
        switch (operator) {
            case 'Less Than':
                symbol = '&nbsp;<&nbsp;{}';
                break;
            case 'Less than or Equal':
                symbol = '&nbsp;<=&nbsp;{}';
                break;
            case 'Greater than':
                symbol = '&nbsp;>&nbsp;{}';
                break;
            case 'Greater than or Equal':
                symbol = '&nbsp;>=&nbsp;{}';
                break;
            case 'Equal':
                symbol = '&nbsp;=&nbsp;{}';
                break;
            case 'Not Equal':
                symbol = '&nbsp;<>&nbsp;{}';
                break;
            case 'Starts With':
                symbol = "<span class='blue'>&nbsp;LIKE&nbsp;</span> <span class='red'>'%'</span>+{}";
                break;
            case 'Ends With':
                symbol = "<span class='blue'>&nbsp;LIKE&nbsp;</span> {}+<span class='red'>'%'</span>";
                break;
            case 'Contains':
                symbol = "<span class='blue'>&nbsp;LIKE&nbsp;</span> <span class='red'>'%'</span>+{}+<span class='red'>'%'</span>";
                break;
            default:
                symbol = '&nbsp;=&nbsp;{}';
                break;
        }
        return symbol;
    };

    var _logicalOperator = function (operator) {
        var symbol = '';
        switch (operator) {
            case 'AND':
                symbol = '&nbsp;&&&nbsp;';
                break;
            case 'OR':
                symbol = '&nbsp;||&nbsp;';
                break;
            default:
                break;
        }
        return symbol;
    };

    var _join = function (pro, database) {
        var _joinStatement = '';

        var tableTwo = '';

        var JoinTable = [];

        if (pro.select.JoinTables.length > 0) {
            for (var i = 0; i < pro.select.JoinTables.length; i++) {
                if (_joinStatement == '') {
                    var tableOne = pro.select.JoinTables[i].tableOneSelect;
                    if (tableOne != '') {
                        var tableOneIdx = database.tablesNames.indexOf(tableOne);
                        if (tableOneIdx != -1) {
                            var parentchildRelation = database.Tables[tableOneIdx].ParentChildTables;
                            var joinTableName;
                            var joinReferenceColumn;
                            var currenReferenceColumn;
                            for (var j = 0; j < parentchildRelation.length; j++) {
                                if (parentchildRelation[j].TableName == pro.select.JoinTables[i].tableTwoSelect) {
                                    joinTableName = parentchildRelation[j].TableName;
                                    joinReferenceColumn = parentchildRelation[j].KeyColumn;
                                    currenReferenceColumn = parentchildRelation[j].ReferenceColumn;
                                }
                            }
                            _joinStatement = "[" + tableOne + "] <span class='blue'>AS</span> " + GetAliseName(tableOne) + " <span class='blue'>" + pro.select.JoinTables[i].join + "</span>";
                            _joinStatement = _joinStatement + " [" + joinTableName + "] <span class='blue'>AS</span> " + GetAliseName(joinTableName) + " <span class='blue'> ON</span>";
                            _joinStatement = _joinStatement + " [" + GetAliseName(tableOne) + "].[" + currenReferenceColumn + "] = [" + GetAliseName(joinTableName) + "].[" + joinReferenceColumn + "]";
                            tableTwo = joinTableName;
                        }
                    }
                }
                else {
                    if (tableTwo != '') {
                        var tableOne = tableTwo;
                        var tableOneIdx = database.tablesNames.indexOf(tableOne);
                        if (tableOneIdx != -1) {
                            var parentchildRelation = database.Tables[tableOneIdx].ParentChildTables;
                            var joinTableName;
                            var joinReferenceColumn;
                            var currenReferenceColumn;
                            for (var j = 0; j < parentchildRelation.length; j++) {
                                if (parentchildRelation[j].TableName == pro.select.JoinTables[i].tableTwoSelect) {
                                    joinTableName = parentchildRelation[j].TableName;
                                    joinReferenceColumn = parentchildRelation[j].KeyColumn;
                                    currenReferenceColumn = parentchildRelation[j].ReferenceColumn;
                                }
                            }
                            _joinStatement = _joinStatement + " <span class='blue'>" + pro.select.JoinTables[i].join + "</span>";
                            _joinStatement = _joinStatement + " [" + joinTableName + "] <span class='blue'>AS</span> " + GetAliseName(joinTableName) + " <span class='blue'> ON</span>";
                            _joinStatement = _joinStatement + " [" + GetAliseName(tableOne) + "].[" + currenReferenceColumn + "] = [" + GetAliseName(joinTableName) + "].[" + joinReferenceColumn + "]";
                            tableTwo = joinTableName;
                        }
                    }
                }

                if (i == 0) {
                    JoinTable.push(pro.select.JoinTables[i].tableOneSelect);
                }
                JoinTable.push(pro.select.JoinTables[i].tableTwoSelect)
            }

            if (JoinTable.length != tableNames.length) {
                var filterRecord = jQuery.grep(tableNames, function (n, i) {
                    var idx = JoinTable.indexOf(n);
                    if (idx == -1) {
                        return n;
                    }
                });
                var z = 0;
                var lastJoinTable = "";
                lastJoinTable = JoinTable[JoinTable.length - 1];
                while (z < filterRecord.length) {
                    var tableOne = ""
                    var tableOneReference = "";
                    var tableTwo = "";
                    var tableTwoReference = "";

                    var tableOneIdx = database.tablesNames.indexOf(lastJoinTable);
                    var tableOneParentChild = database.Tables[tableOneIdx].ParentChildTables;
                    for (var k = 0; k < tableOneParentChild.length; k++) {
                        if (tableOneParentChild[k].TableName == filterRecord[z]) {
                            tableOne = lastJoinTable;
                            tableOneReference = tableOneParentChild[k].ReferenceColumn;
                        }
                    }

                    var tableTwoIdx = database.tablesNames.indexOf(filterRecord[z]);
                    var tableTwoParentChild = database.Tables[tableTwoIdx].ParentChildTables;
                    for (var k = 0; k < tableTwoParentChild.length; k++) {
                        if (tableTwoParentChild[k].TableName == lastJoinTable) {
                            tableTwo = filterRecord[z];
                            tableTwoReference = tableTwoParentChild[k].ReferenceColumn;
                        }
                    }

                    if (_joinStatement != '') {
                        _joinStatement = _joinStatement + " <span class='blue'> INNER JOIN </span> ";
                        _joinStatement = _joinStatement + "[" + tableTwo + "] <span class='blue'>AS</span> " + GetAliseName(tableTwo) + " <span class='blue'> ON </span>";
                        _joinStatement = _joinStatement + "[" + GetAliseName(tableOne) + "].[" + tableOneReference + "] = [" + GetAliseName(tableTwo) + "].[" + tableTwoReference + "]";
                    }
                    lastJoinTable = tableTwo;
                    z++;
                }
            }
        }
        else {
            var i = 0;
            var j = 1;
            var parentTable = "";
            while (j != tableAlise.length) {
                var tableOne = "";
                var tableOneReference = "";
                var tableTwo = "";
                var tableTwoReference = "";

                if (i == 0) {
                    var tableOneIdx = database.tablesNames.indexOf(tableAlise[i].name);
                    var tableOneParentChild = database.Tables[tableOneIdx].ParentChildTables;
                    for (var k = 0; k < tableOneParentChild.length; k++) {
                        if (tableOneParentChild[k].TableName == tableAlise[j].name) {
                            tableOne = tableAlise[i].name;
                            tableOneReference = tableOneParentChild[k].ReferenceColumn;
                        }
                    }
                }

                var tableTwoIdx = database.tablesNames.indexOf(tableAlise[j].name);
                var tableTwoParentChild = database.Tables[tableTwoIdx].ParentChildTables;
                for (var k = 0; k < tableTwoParentChild.length; k++) {
                    if (tableTwoParentChild[k].TableName == tableAlise[j - 1].name) {
                        tableTwo = tableAlise[j].name;
                        tableTwoReference = tableTwoParentChild[k].ReferenceColumn;
                    }
                }

                if (parentTable != '') {
                    tableOne = parentTable;
                    var tableOneIdx = database.tablesNames.indexOf(tableOne);
                    var tableOneParentChild = database.Tables[tableOneIdx].ParentChildTables;
                    for (var k = 0; k < tableOneParentChild.length; k++) {
                        if (tableOneParentChild[k].TableName == tableTwo) {
                            tableOneReference = tableOneParentChild[k].ReferenceColumn;
                        }
                    }
                }

                if (_joinStatement == '') {
                    _joinStatement = "[" + tableOne + "] <span class='blue'>AS</span> " + GetAliseName(tableOne) + "<br/> <span class='blue'> INNER JOIN </span> <br/>";
                    _joinStatement = _joinStatement + "[" + tableTwo + "] <span class='blue'>AS</span> " + GetAliseName(tableTwo) + "<span class='blue'> ON </span><br/>";
                    _joinStatement = _joinStatement + "[" + GetAliseName(tableOne) + "].[" + tableOneReference + "] = [" + GetAliseName(tableTwo) + "].[" + tableTwoReference + "]<br/>";
                }
                else {
                    _joinStatement = _joinStatement + " <span class='blue'> INNER JOIN </span> <br/> ";
                    _joinStatement = _joinStatement + "[" + tableTwo + "] <span class='blue'>AS</span> " + GetAliseName(tableTwo) + " <span class='blue'> ON </span> <br/>";
                    _joinStatement = _joinStatement + "[" + tableAlise[j - 1].alise + "].[" + tableOneReference + "] = [" + GetAliseName(tableTwo) + "].[" + tableTwoReference + "]";                    
                }

                parentTable = tableTwo;
                i++;
                j++;
            }
        }
        if (tableAlise.length == 1) {
            _joinStatement = "[" + tableAlise[0].name + "] <span class='blue'>AS</span> " + GetAliseName(tableAlise[0].name);
        }
        return _joinStatement;
    };

    selectProcedureFactory.CreateProcedure = _CreateProcedure;

    return selectProcedureFactory;
});