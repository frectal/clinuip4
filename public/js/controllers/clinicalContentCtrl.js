'use strict';

angular.module('clinuip')
    .controller('ClinicalContentCtrl', function UsersCtrl($scope, $rootScope, Api, $routeParams) {

        $scope.contentLines = "";

        $scope.current = {};

        $scope.saveContent = function (content) {
            content.contents = $scope.contentLines.split('\n');

            Api.Contents.save(content, function(data) {
                if (data) {
                    if (content._id) {
                        var index = _.findIndex($rootScope.contents, { id : content.id });
                        if (index !== -1) {
                            $rootScope.contents[index] = data;
                        }
                    } else {
                        $rootScope.contents.push(data);
                    }

                    $scope.contentLines = '';
                    $('#myModal').modal('hide');
                }
            });
        };

        $scope.editContent = function (content) {
            $scope.contentLines = content.contents.join('\n');
            $scope.current = angular.copy(content);
            $('#myModal').modal();
        };

        $scope.deleteContent = function (content) {
            bootbox.confirm("Are you sure?", function(result) {
                if (result) {
                    var index = _.findIndex($rootScope.contents, { _id : content._id });
                    if (index !== -1) {
                        $rootScope.contents.splice(index, 1);
                    }
                    Api.Contents.delete(content);
                }
            });
        };

        $scope.addContent = function () {
            $scope.current = {};
            $scope.contentLines;
            $('#myModal').modal();
        };


    });