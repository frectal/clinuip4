(function () {
    'use strict';

    angular.module('clinuip')
        .factory('Patients', ['$resource', function ($resource) {
            return $resource('/api/v1/patients/:id', { id: "@id" }, {
                details: { method : 'GET', url: '/api/v1/patients/:id/details', isArray : true },
                detailsSave: { method : 'POST', url: '/api/v1/patients/:id/details' },
                detailsDelete: { method : 'DELETE', url: '/api/v1/patients/:id/details/:id_detail' }
            });
        }]);

    angular.module('clinuip')
        .factory('Api', function ($resource) {

            var apiDomain = '/api/v1/';

            return {
                Patients:           $resource(apiDomain + 'patients', {})
            }

        });

}());