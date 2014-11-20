/// <reference path="../../Scripts/angular.min.js" />
/// <reference path="../App.js" />
"use strict";
app.factory('SelectProcedure', function () {
    var selectProcedureFactory = {};
    var tableAlise = [];
    var _CreateProcedure = function (pro, database) {
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
                    if (i != fields.length - 1) {
                        selectField = selectField + "[t" + Number(j + 1) + "]." + fields[i] + ",";
                    }
                    else {
                        selectField = selectField + ",[t" + Number(j + 1) + "]." + fields[i];
                    }
                }
            }
            else {
                if (selectField == '') {
                    selectField = selectField + "[t" + Number(j + 1) + "].*";
                }
                else {
                    selectField = selectField + ",[t" + Number(j + 1) + "].*";
                }
            }

            if (tables == '') {
                tables = "[" + pro.select.tableData[j].tableName + "] <span class='blue'>AS</span> t" + Number(j + 1);
            }
            else {
                tables = tables + " ,[" + pro.select.tableData[j].tableName + "] <span class='blue'>AS</span> t" + Number(j + 1);
            }
            tableAlise.push({ name: pro.select.tableData[j].tableName, alise: 't' + Number(j + 1) });
        }
        var joinstatement = _join(pro, database);
        return "<span class='blue'>SELECT</span> " + selectField + " <span class='blue'>FROM</span> <br/>" + joinstatement;
    };

    var _WhereStatement = function (pro) {
        var where = '';
        for (var i = 0; i < pro.select.conditions.length; i++) {
            /*for (var j = 0; j < tableAlise.length; j++) {
                if (pro.select.conditions[i].table == tableAlise[j].name) {*/
            var value = _Operator(pro.select.conditions[i].optrValue).replace('{}', '@' + pro.select.conditions[i].fieldName);
            /*var condition = '[' + tableAlise[j].alise + '].[' + pro.select.conditions[i].fieldName + ']' + value;*/
            var condition = '[' + GetAliseName(pro.select.conditions[i].table) + '].[' + pro.select.conditions[i].fieldName + ']' + value;
            if (where == '') {
                if (pro.select.conditions.length > 1) {
                    where = condition + _logicalOperator(pro.select.conditions[i].logicalOperator) + ' <br/> ';
                }
                else {
                    where = condition;
                }
            }
            else {
                where = where + condition + _logicalOperator(pro.select.conditions[i].logicalOperator) + ' <br/> ';
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
        }
        return _joinStatement;
    };

    selectProcedureFactory.CreateProcedure = _CreateProcedure;

    return selectProcedureFactory;
});