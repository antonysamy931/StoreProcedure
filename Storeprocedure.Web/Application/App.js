/// <reference path="../Scripts/angular-local-storage.min.js" />
/// <reference path="../Scripts/angular.min.js" />
var app = angular.module("Procedure", ["ngRoute", "ngSanitize", "LocalStorageModule"]);

var ServiceBaseUrl = "http://localhost:52804/";

app.constant("ngProcedureConstant", {
    BaseUrl: ServiceBaseUrl
});
