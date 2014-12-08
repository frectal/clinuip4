'use strict';

/*global angular */

var app = angular.module("clinuip", ['ngRoute', 'ngResource']);

app.run(function($rootScope, Api) {
    Api.Contents.query(function(data) {
        $rootScope.contents = data;
    });
    Api.Contents.tags(function(tags) {
        $rootScope.tags = tags;
    });
});

app.config(function ($routeProvider) {
    $routeProvider.when('/', { controller: 'HomeCtrl', templateUrl: 'partials/home.html' });
	$routeProvider.when('/patients', { controller: 'PatientsCtrl', templateUrl: 'partials/patients.html' });
    $routeProvider.when('/clinicalcontent', { controller: 'ClinicalContentCtrl', templateUrl: 'partials/clinicalContent.html' });
    $routeProvider.otherwise({ redirectTo: '/' });
});