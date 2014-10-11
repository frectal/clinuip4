'use strict';

/*global angular */

var app = angular.module("clinuip", ['ngRoute', 'ngResource']);

app.run(function($rootScope) {
    $rootScope.contents = [
        {
            id: 1,
            tag: 'Medication',
            contents: ['Paracetamol 500mg qds', 'Ibuprofen 400mg tds']
        },
        {
            id: 2,
            tag: 'Investigation',
            contents: ['Xray Chest', 'EKG']
        },
        {
            id: 3,
            tag: 'Test',
            contents: ['One', 'Two']
        }
    ];
});

app.config(function ($routeProvider, $locationProvider) {
    $routeProvider.when('/', { controller: 'HomeCtrl', templateUrl: 'partials/home.html' });
	$routeProvider.when('/patients', { controller: 'PatientsCtrl', templateUrl: 'partials/patients.html' });
    $routeProvider.when('/clinicalcontent', { controller: 'ClinicalContentCtrl', templateUrl: 'partials/clinicalContent.html' });
    $routeProvider.otherwise({ redirectTo: '/' });
});