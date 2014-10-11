'use strict';

angular.module('clinuip')
    .controller('ClinicalContentCtrl', function UsersCtrl($scope, $rootScope, $location, $routeParams) {


        $scope.contentLines = "";

        $scope.current = {};

        $scope.saveContent = function (content) {
            content.contents = $scope.contentLines.split('\n');
            $scope.contentLines = '';

            if (content.id) {
                var index = _.findIndex($rootScope.contents, { id : content.id });
                if (index !== -1) {
                    $rootScope.contents[index] = content;
                }
            } else {
                content.id = _.random(10, 99);
                $rootScope.contents.push(angular.copy(content));
            }
            $('#myModal').modal('hide');
        };

        $scope.editContent = function (content) {
            $scope.contentLines = content.contents.join('\n');
            $scope.current = angular.copy(content);
            $('#myModal').modal();
        };

        $scope.deleteContent = function (content) {
            if (content.id) {
                var index = _.findIndex($scope.contents, { id : content.id });
                if (index !== -1) {
                    $scope.contents.splice(index, 1);
                }
            }
        };

        $scope.addContent = function () {
            $scope.current = {};
            /*
            $("#tags").val('').tokenfield({
                autocomplete: {
                    delay: 100
                }
            });
            */
            $('#myModal').modal();
        };


    });