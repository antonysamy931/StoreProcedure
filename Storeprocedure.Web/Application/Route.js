/// <reference path="../Scripts/angular.min.js" />
/// <reference path="../Scripts/angular-route.min.js" />
/// <reference path="App.js" />

"use strict";
app.config(["$routeProvider", function ($routeProvider) {
    $routeProvider.when("/", {
        templateUrl: "Application/View/Credential.html",
        controller: "CredentialController"
    }).
    when("/Home", {
        templateUrl: "Application/View/Home.html",
        controller: "HomeController"
    }).
    otherwise({redirectTo:"/"});
}]);