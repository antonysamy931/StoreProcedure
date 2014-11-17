/// <reference path="../Scripts/angular.min.js" />
/// <reference path="../../Scripts/jquery-1.9.1.min.js" />
/// <reference path="../App.js" />
"use strict";
app.controller("HomeController", ["$scope", "$location", "DatabaseService", "SelectProcedure", function ($scope, $location, DatabaseService, SelectProcedure) {
    $scope.pro = {};
    $scope.dataBase = [];
    $scope.dataBase = DatabaseService.loadData();
    if (typeof ($scope.dataBase) == 'undefined' || $scope.dataBase == null) {
        $location.path('/');
        //$scope.dataBase = DatabaseService.getCookies("DataBaseStructure");
    }

    $scope.dataBase.tablesNames = [];
    $scope.dataBase.tablesRelation = []
    $scope.dataBase.tablesColumns = [];

    for (var i = 0; i < $scope.dataBase.Tables.length; i++) {
        $scope.dataBase.tablesNames.push($scope.dataBase.Tables[i].Table_Name);

        var table = $scope.dataBase.Tables[i];
        var RelationTable = [];

        for (var j = 0; j < $scope.dataBase.Tables[i].Relations.length; j++) {
            RelationTable.push($scope.dataBase.Tables[i].Relations[j].PrimaryKeyTable);
        }
        $scope.dataBase.tablesRelation.push({ Name: $scope.dataBase.Tables[i].Table_Name, Relation: RelationTable });

        var ColumnNames = [];
        ColumnNames.push({ Name: 'All', Checked: false });
        for (var k = 0; k < $scope.dataBase.Tables[i].Columns.length; k++) {
            ColumnNames.push({ Name: $scope.dataBase.Tables[i].Columns[k].Column_Name, Checked: false });
        }
        $scope.dataBase.tablesColumns.push({ Name: $scope.dataBase.Tables[i].Table_Name, Columns: ColumnNames });
    }

    $scope.dataBase.defaultTable = $scope.dataBase.tablesNames[0];
    $scope.dataBase.defaultColumns = $scope.dataBase.tablesColumns[0].Columns;
    $scope.dataBase.defaultRelation = $scope.dataBase.tablesRelation[0].Relation;

    //$scope.dataBase.tables.indexOf('tbRentalProducts');
    $scope.types = [{ name: "Select" }, { name: "Insert" }, { name: "Update" }, { name: "Delete" }];
    $scope.pro.Type = $scope.types[0].name;



    /*Select*/
    $scope.pro.select = {};
    $scope.pro.select.tableModel = {};
    $scope.pro.select.columnModel = {};
    $scope.pro.select.tableData = [{ model: 'table' + 1, tableCollection: $scope.dataBase.tablesNames, tableName: $scope.dataBase.defaultTable, tableColumns: $scope.dataBase.defaultColumns, selectedColumns: [], relationTables: $scope.dataBase.defaultRelation, Validate: false }];
    $scope.pro.select.tableModel[$scope.pro.select.tableData[0].model] = $scope.dataBase.defaultTable;
    $scope.pro.select.addTables = $scope.dataBase.defaultRelation;

    $scope.pro.select.Joins = ["Inner Join", "Left Outer Join", "Right Outer Join", "Full Outer Join"];

    $scope.logical = ['AND', 'OR'];

    $scope.pro.select.condition = false;
    $scope.pro.select.conditions = [{ model: 'condition' + 1, tables: [], table: '', operator: '', field: [], fieldName: '', optr: [], optrValue: '', logicalOperator: '', Validate: false }];
    $scope.pro.select.conditions.tableModel = {};
    $scope.pro.select.conditions.fieldModel = {};
    $scope.pro.select.conditions.operatorModel = {};
    $scope.pro.select.conditions.logicalModel = {};

    $scope.pro.select.JoinTables = [];
    $scope.pro.select.JoinTables.tableOneModel = {};
    $scope.pro.select.JoinTables.tableTwoModel = {};
    $scope.pro.select.JoinTables.JoinModel = {};

    $scope.Trigger = function () {
        alert('trigger');
    };

    $scope.$watch(function ($scope) {
        return $scope;
    },
    function (oldValue, newValue) {
        console.log(newValue);
    });

    var removeDuplicatesInPlace = function (arr) {
        var i, j, cur, found;
        for (i = arr.length - 1; i >= 0; i--) {
            cur = arr[i];
            found = false;
            for (j = i - 1; !found && j >= 0; j--) {
                if (cur === arr[j]) {
                    if (i !== j) {
                        arr.splice(i, 1);
                    }
                    found = true;
                }
            }
        }
        return arr;
    };


    $scope.tableChange = function (TableName, index) {
        var removeItem = $scope.pro.select.tableData.length - (index + 1)
        $scope.pro.select.tableData.splice(index + 1, removeItem);

        $scope.pro.select.tableData[index].tableName = TableName;
        var tableIndex = $scope.dataBase.tablesNames.indexOf(TableName);
        if (tableIndex > -1) {
            $scope.pro.select.tableData[index].tableColumns = $scope.dataBase.tablesColumns[tableIndex].Columns;
            if (index == 0) {
                $scope.pro.select.tableData[index].relationTables = removeDuplicatesInPlace($scope.dataBase.tablesRelation[tableIndex].Relation);
            }
            $scope.pro.select.tableData[index].selectedColumns = [];
        }

        $scope.pro.select.conditions = [];
        $scope.pro.select.condition = false;

        $scope.pro.select.JoinTables = [];
        $scope.pro.select.join = false;

        //$scope.pro.select.addTables = removeDuplicatesInPlace($scope.dataBase.tablesRelation[tableIndex].Relation);
    };

    $scope.ColumnCheck = function (checkboxObject, checked, checkbox, index) {
        if (checkbox == 'All') {
            for (var i = 0; i < $scope.pro.select.tableData[index].tableColumns.length; i++) {
                $scope.pro.select.tableData[index].tableColumns[i].Checked = checked;
                if (i != 0) {
                    if (checked) {
                        $scope.pro.select.tableData[index].selectedColumns.push($scope.pro.select.tableData[index].tableColumns[i].Name);
                    } else {
                        $scope.pro.select.tableData[index].selectedColumns = [];
                    }
                }
            }
        }
        else {
            if ($scope.pro.select.tableData[index].tableColumns[0].Checked) {
                $scope.pro.select.tableData[index].tableColumns[0].Checked = false;
            }

            var columnIndex = $scope.pro.select.tableData[index].tableColumns.indexOf(checkboxObject);
            $scope.pro.select.tableData[index].tableColumns[columnIndex].Checked = checked;

            var idx = $scope.pro.select.tableData[index].selectedColumns.indexOf(checkbox);
            if (checked) {
                if (idx == -1) {
                    $scope.pro.select.tableData[index].selectedColumns.push(checkbox);
                }
            }
            else {
                if (idx > -1) {
                    $scope.pro.select.tableData[index].selectedColumns.splice(idx, 1);
                }
            }
        }
    };

    $scope.AddSelectTable = function (index) {
        var tablesRelations = $scope.pro.select.tableData[0].relationTables;
        var relationTable = $scope.pro.select.tableData[0].relationTables;
        var existingTable = [];

        for (var i = 0; i < $scope.pro.select.tableData.length; i++) {
            if (existingTable.length == 0) {
                if (i != 0) {
                    existingTable.push($scope.pro.select.tableData[i].tableName);
                }
            }
            else {
                var idx = existingTable.indexOf($scope.pro.select.tableData[i].tableName);
                if (idx == -1) {
                    if (i != 0) {
                        existingTable.push($scope.pro.select.tableData[i].tableName);
                    }
                }
            }
        }

        var tables = jQuery.grep(relationTable, function (n, i) {
            if (existingTable.length != 0) {
                var idx = existingTable.indexOf(n);
                if (idx == -1) {
                    return n;
                }
            }
            else {
                return n;
            }
        });

        var defaultTableName = tables[0];
        var tableIndex = $scope.dataBase.tablesNames.indexOf(defaultTableName);
        var columns = $scope.dataBase.tablesColumns[tableIndex].Columns;

        for (var i = 0; i < columns.length; i++) {
            columns[i].Checked = false;
        }

        var model = "table" + Number($scope.pro.select.tableData.length + 1);

        //var relations = $scope.dataBase.tablesRelation[tableIndex].Relation;

        $scope.pro.select.tableData.push({ model: model, tableCollection: tables, tableName: defaultTableName, tableColumns: columns, selectedColumns: [], relationTables: [] });
        $scope.pro.select.tableModel[$scope.pro.select.tableData[index + 1].model] = defaultTableName;
        $scope.pro.select.condition = false;
    };

    $scope.RemoveTable = function (index) {
        var removeItem = $scope.pro.select.tableData.length - (index == 0 ? index + 1 : index);
        $scope.pro.select.tableData.splice(index, removeItem);
        $scope.pro.select.condition = false;
        $scope.pro.select.conditions = [];
        $scope.pro.select.join = false;
        $scope.pro.select.JoinTables = [];
    };

    $scope.ConditionCheck = function (check) {
        if (check) {
            if ($scope.pro.select.conditions.length == 0) {
                $scope.pro.select.conditions.push({ model: 'condition' + 1, tables: [], table: '', operator: '', field: [], fieldName: '', optr: [], optrValue: '', logicalOperator: '', Validate: false });
            }
            $scope.pro.select.conditions[0].tables = [];
            for (var i = 0; i < $scope.pro.select.tableData.length; i++) {
                $scope.pro.select.conditions[0].tables.push($scope.pro.select.tableData[i].tableName);
            }
        }
        else {
            $scope.pro.select.conditions = [];
        }
    };

    $scope.conditionstableChange = function (TableName, index) {
        var tableIndex = $scope.dataBase.tablesNames.indexOf(TableName);
        if (tableIndex > -1) {

            var Columns = angular.copy($scope.dataBase.tablesColumns[tableIndex].Columns);
            Columns.splice(0, 1);

            var existingFields = [];
            for (var i = 0; i < $scope.pro.select.conditions.length; i++) {
                if ($scope.pro.select.conditions[i].fieldName != '') {

                    if (TableName === $scope.pro.select.conditions[i].table)
                        existingFields.push($scope.pro.select.conditions[i].fieldName);
                }
            }

            var filterColumn = jQuery.grep(Columns, function (n, i) {
                if (existingFields.length != 0) {
                    var idx = existingFields.indexOf(n.Name);
                    if (idx == -1) {
                        return n;
                    }
                }
                else {
                    return n;
                }
            });

            $scope.pro.select.conditions[index].field = filterColumn;
            $scope.pro.select.conditions[index].table = TableName;
        }
        else {
            $scope.pro.select.conditions[index].table = '';
            $scope.pro.select.conditions[index].field = [];
            $scope.pro.select.conditions[index].fieldName = '';
            $scope.pro.select.conditions[index].optr = [];
            $scope.pro.select.conditions[index].optrValue = '';
        }
    }

    $scope.conditionsfieldChange = function (FieldName, index) {
        var tableIndex = $scope.dataBase.tablesNames.indexOf($scope.pro.select.conditions[index].table);
        if (tableIndex > -1) {
            var columns = [];
            var Columns = angular.copy($scope.dataBase.tablesColumns[tableIndex].Columns);
            Columns.splice(0, 1);
            for (var i = 0; i < Columns.length; i++) {
                columns.push(Columns[i].Name);
            }
            var fieldIndex = columns.indexOf(FieldName);
            if (fieldIndex > -1) {
                var columnDataType = $scope.dataBase.Tables[tableIndex].Columns[fieldIndex].Data_Type;
                var operator = [];
                switch (columnDataType) {
                    case 'int':
                        operator = [{ name: 'Less Than' }, { name: 'Less than or Equal' }, { name: 'Greater than' },
                                    { name: 'Greater than or Equal' }, { name: 'Equal' }, { name: 'Not Equal' }];
                        break;
                    case 'varchar':
                        operator = [{ name: 'Equal' }, { name: 'Not Equal' }, { name: 'Starts With' }, { name: 'Ends With' }, { name: 'Contains' }];
                        break;
                    case 'bit':
                        operator = [{ name: 'Equal' }, { name: 'Not Equal' }];
                        break;
                    default:
                        break;
                }
                $scope.pro.select.conditions[index].optr = operator;
                $scope.pro.select.conditions[index].dataType = columnDataType;
            }
            else {
                $scope.pro.select.conditions[index].optr = [];
                $scope.pro.select.conditions[index].optrValue = '';
            }
            $scope.pro.select.conditions[index].fieldName = FieldName;

        }
    };

    $scope.conditionsoperatorChange = function (operator, index) {
        if (operator != '') {
            $scope.pro.select.conditions[index].optrValue = operator;
        }
        else {
            $scope.pro.select.conditions[index].optrValue = '';
        }
    };

    $scope.conditionslogicalChange = function (logicalOperator, index) {
        $scope.pro.select.conditions[index].logicalOperator = logicalOperator;
        $scope.pro.select.conditions[index].Validate = true;
    };

    $scope.RemoveCondition = function (index) {
        $scope.pro.select.conditions.splice(index, 1);
        if ($scope.pro.select.conditions.length == 0) {
            $scope.pro.select.conditions = [];
            $scope.pro.select.condition = false;
        }

        for (var i = 1; i <= $scope.pro.select.conditions.length; i++) {
            $scope.pro.select.conditions[i - 1].model = "condition" + i;
        }
    };

    $scope.AddCondition = function (index) {
        var conditionModel = 'condition' + Number($scope.pro.select.conditions.length + 1);
        var tables = [];
        for (var i = 0; i < $scope.pro.select.tableData.length; i++) {
            tables.push($scope.pro.select.tableData[i].tableName);
        }
        $scope.pro.select.conditions.push({ model: conditionModel, tables: tables, table: '', operator: '', field: [], fieldName: '', optr: [], optrValue: '', logicalOperator: '', Validate: false });
    };

    $scope.JoinCheck = function (check) {
        if (check) {
            if ($scope.pro.select.JoinTables.length == 0) {
                $scope.pro.select.JoinTables.push({ model: 'joins' + 1, tableOne: [], tableTwo: [], tableOneSelect: '', tableTwoSelect: '', joinTypes: [], join: '', validate: false });
            }
            $scope.pro.select.JoinTables[0].tableOne = [];
            for (var i = 0; i < $scope.pro.select.tableData.length; i++) {
                $scope.pro.select.JoinTables[0].tableOne.push($scope.pro.select.tableData[i].tableName);
            }
        }
        else {
            $scope.pro.select.JoinTables = [];
        }
    };

    /*Start work here*/
    $scope.jointableoneChange = function (data, index) {
        if (data != '' && data != null) {
            $scope.pro.select.JoinTables[index].tableOneSelect = data;
            $scope.pro.select.JoinTables[index].tableTwo = [];
            $scope.pro.select.JoinTables[index].tableTwoSelect = '';
            $scope.pro.select.JoinTables[index].join = '';
            $scope.pro.select.JoinTables[index].joinTypes = $scope.pro.select.Joins;
            $scope.pro.select.JoinTables[index].validate = false;
        }
        else {
            $scope.pro.select.JoinTables[index].tableOneSelect = '';
            $scope.pro.select.JoinTables[index].tableTwo = [];
            $scope.pro.select.JoinTables[index].tableTwoSelect = '';
            $scope.pro.select.JoinTables[index].join = '';
            $scope.pro.select.JoinTables[index].joinTypes = [];
            $scope.pro.select.JoinTables[index].validate = false;
        }
    };

    $scope.joinoperatorChange = function (data, index) {
        if (data != '' && data != null) {
            $scope.pro.select.JoinTables[index].join = data;
            var existing = [];

            for (var i = 0; i < $scope.pro.select.JoinTables.length; i++) {
                if ($scope.pro.select.JoinTables[i].tableOneSelect != '') {
                    existing.push($scope.pro.select.JoinTables[i].tableOneSelect);
                }

                /*if ($scope.pro.select.JoinTables[i].tableTwoSelect != '') {
                    existing.push($scope.pro.select.JoinTables[i].tableTwoSelect);
                }*/
            }

            var joinTables = $scope.pro.select.JoinTables[0].tableOne;
            var filterTable = jQuery.grep(joinTables, function (n, i) {
                if (existing.length != 0) {
                    var idx = existing.indexOf(n);
                    if (idx == -1) {
                        return n;
                    }
                }
                else {
                    return n;
                }
            });

            $scope.pro.select.JoinTables[index].tableTwo = filterTable;
            $scope.pro.select.JoinTables[i].tableTwoSelect = '';
        }
        else {
            $scope.pro.select.JoinTables[i].tableTwoSelect = '';
            $scope.pro.select.JoinTables[i].tableTwo = [];
        }
    };

    $scope.jointabletwoChange = function (data, index) {
        if (data != '' && data != null) {
            $scope.pro.select.JoinTables[index].tableTwoSelect = data;
            var existing = [];

            for (var i = 0; i < $scope.pro.select.JoinTables.length; i++) {
                if ($scope.pro.select.JoinTables[i].tableOneSelect != '') {
                    existing.push($scope.pro.select.JoinTables[i].tableOneSelect);
                }
            }
            var joinTables = $scope.pro.select.JoinTables[0].tableOne;
            var filterTable = jQuery.grep(joinTables, function (n, i) {
                if (existing.length != 0) {
                    var idx = existing.indexOf(n);
                    if (idx == -1) {
                        return n;
                    }
                }
                else {
                    return n;
                }
            });
            if (filterTable.length > 1) {
                $scope.pro.select.JoinTables[index].validate = true;
            }
        }
        else {
            $scope.pro.select.JoinTables[index].tableTwoSelect = '';
            $scope.pro.select.JoinTables[index].validate = false;
        }
    };

    $scope.RemoveJoin = function (index) {
        $scope.pro.select.JoinTables.splice(index, 1);
        if ($scope.pro.select.JoinTables.length == 0) {
            $scope.pro.select.JoinTables = [];
            $scope.pro.select.join = false;
        }

        for (var i = 1; i <= $scope.pro.select.JoinTables.length; i++) {
            $scope.pro.select.JoinTables[i - 1].model = "joins" + i;
        }
    };

    $scope.AddJoins = function (index) {
        var existing = [];

        for (var i = 0; i < $scope.pro.select.JoinTables.length; i++) {
            if ($scope.pro.select.JoinTables[i].tableOneSelect != '') {
                existing.push($scope.pro.select.JoinTables[i].tableOneSelect);
            }
        }
        var joinTables = $scope.pro.select.JoinTables[0].tableOne;
        var filterTable = jQuery.grep(joinTables, function (n, i) {
            if (existing.length != 0) {
                var idx = existing.indexOf(n);
                if (idx == -1) {
                    return n;
                }
            }
            else {
                return n;
            }
        });
        var joinModel = 'joins' + Number($scope.pro.select.JoinTables.length + 1)
        $scope.pro.select.JoinTables.push({ model: joinModel, tableOne: filterTable, tableTwo: [], tableOneSelect: '', tableTwoSelect: '', joinTypes: [], join: '', validate: false });
    };

    $scope.CreateProcedure = function () {
        $scope.Result = SelectProcedure.CreateProcedure($scope.pro);
    };
}]);

/*
study link
http://weblogs.asp.net/dwahlin/creating-custom-angularjs-directives-part-3-isolate-scope-and-function-parameters
https://gist.github.com/CMCDragonkai/6282750
http://fdietz.github.io/recipes-with-angular-js/directives/passing-configuration-params-using-html-attributes.html
https://egghead.io/lessons/angularjs-angular-element
http://jsfiddle.net/zargyle/t7kr8/
*/