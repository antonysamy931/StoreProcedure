/// <reference path="../../Scripts/angular.min.js" />
/// <reference path="../App.js" />
"use strict";
app.factory("DatabaseService", ["$http","localStorageService", "ngProcedureConstant", function ($http,localStorageService, ngProcedureConstant) {
    var serviceUrl = ngProcedureConstant.BaseUrl;
    var databaseServiceFactory = {};
    var credential = {};
    var data = [];

    var _getDatabase = function () {
        this.credential.ServerName = this.credential.ServerName.replace('\\', ',');
        return $http.get(serviceUrl + 'Procedure/Connection/Provider=' + this.credential.Provider + '/Server=' + this.credential.ServerName + '/Userid=' + this.credential.UserId + '/Password=' + this.credential.Password + '/Database=' + this.credential.Database);
    };

    var _loadData = function () {
        //return this.data;
        return localStorageService.get("DataBase");
    };

    databaseServiceFactory.getDatabase = _getDatabase;
    databaseServiceFactory.loadData = _loadData;
   
    return databaseServiceFactory;
}]);