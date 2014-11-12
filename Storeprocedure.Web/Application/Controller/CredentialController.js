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

    $scope.GetDatabase = function () {
        DatabaseService.credential = $scope.Credential;
        DatabaseService.getDatabase().then(function (response) {
            if (response.status === 200) {
                DatabaseService.data = response.data;
                localStorageService.set("DataBase", response.data);
                $location.path("/Home");
            }
        });
        $scope.Credential.ServerName = $scope.Credential.ServerName.replace(',', '\\');
    };
}]);