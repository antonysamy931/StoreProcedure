/// <reference path="../Scripts/angular.min.js" />
/// <reference path="../../Scripts/angular-local-storage.min.js" />
/// <reference path="../App.js" />
/// <reference path="../Service/DatabaseService.js" />
"use strict";
app.controller("CredentialController", ["$scope", "$location", "localStorageService", "DatabaseService", function ($scope, $location, localStorageService, DatabaseService) {
    $scope.Credential = {};

    $scope.Providers = [{ text: "SQL Server", value: "SQL SERVER" }, { text: "Oracle", value: "ORACLE" }, { text: "MySQL", value: "MYSQL" }];
    $scope.Credential.Provider = $scope.Providers[0].value;

    $scope.dataBase = [];
    $scope.loader = false;
    $scope.ServerError = false;

    $scope.GetDatabase = function () {
        $scope.loader = true;
        DatabaseService.credential = $scope.Credential;
        DatabaseService.getDatabase().success(function (data, status, headers, config) {
            if (status === 200) {
                DatabaseService.data = data;
                localStorageService.set("DataBase", data);
                $location.path("/Home");
            }
        }).error(function (data, status, headers, config) {
            $scope.ServerError = true;
            $scope.ErrorMessage = data.Message;
            $scope.loader = false;            
        });
        $scope.Credential.ServerName = $scope.Credential.ServerName.replace(',', '\\');

    };
}]);