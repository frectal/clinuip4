'use strict';

/*global angular */

var app = angular.module("clinuip", ['ngRoute', 'ngResource']);

app.config(function ($routeProvider, $locationProvider) {
    $routeProvider.when('/', { controller: 'HomeCtrl', templateUrl: 'partials/home.html' });
	$routeProvider.when('/patients', { controller: 'PatientsCtrl', templateUrl: 'partials/patients.html' });
    $routeProvider.when('/clinicalcontent', { controller: 'ClinicalContentCtrl', templateUrl: 'partials/clinicalContent.html' });
    $routeProvider.otherwise({ redirectTo: '/' });
});