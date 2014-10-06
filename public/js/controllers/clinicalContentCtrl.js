'use strict';

angular.module('clinuip')
    .controller('ClinicalContentCtrl', function UsersCtrl($scope, $location, $routeParams) {

        $scope.contents = [
            { tags: 'jedan, dva, tri', content: 'prvi red\ndrugired' },
            { tags: 'jedan, dva, tri, dsfsdfsd, sdfsdf, sdfsdf', content: 'prvi red\ndrugired' },
            { tags: 'jedan, dva, tri', content: 'prvi red\ndrugired\ndrugired\ndrugired' }
        ];

        $scope.addContent = function () {
            var htmlForm = $(".form-add-content").clone().show();

            showModal(htmlForm, "Add medical content details", function () {

            });
        };

        // Private util method
        function showModal(html, title, callback) {
            bootbox.dialog({
                message: html,
                title: title,
                buttons: {
                    success: {
                        label: "Cancel",
                        className: "btn btn-default"
                    },
                    main: {
                        label: "Save",
                        className: "btn-primary",
                        callback: callback
                    }
                }
            });
        }

    });