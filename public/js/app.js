'use strict';

/*global angular */

var app = angular.module("clinuip", ['ngRoute', 'ngResource']);

app.config(function ($routeProvider, $locationProvider) {
    $routeProvider.when('/', { controller: 'HomeCtrl', templateUrl: 'partials/home.html' });
	$routeProvider.when('/patients', { controller: 'PatientsCtrl', templateUrl: 'partials/patients.html' });
    $routeProvider.when('/users', { controller: 'UsersCtrl', templateUrl: 'partials/users.html' });
    $routeProvider.otherwise({ redirectTo: '/' });
});