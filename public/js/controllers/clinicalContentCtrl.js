'use strict';

angular.module('clinuip')
    .controller('ClinicalContentCtrl', function UsersCtrl($scope, $rootScope, Api) {

        $scope.contentLines = "";

        $scope.current = {};

        Api.Contents.query(function(data) {
            $rootScope.contents = data;
        });

        $scope.saveContent = function (content) {
            content.contents = $scope.contentLines.split('\n');
            content.tags = [];

            _($scope.tagLines.split(',')).forEach(function(str) {
                content.tags.push(str.trim());
            });

            Api.Contents.save(content, function(data) {
                if (data) {
                    if (content._id) {
                        var index = _.findIndex($rootScope.contents, { _id : content._id });
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
            $scope.tagLines = content.tags.join(', ');
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
            $scope.detailForm.$setPristine();

            $scope.contentLines = "";
            $scope.tagLines = "";
            $scope.current.name = "";

            $('#myModal').modal();
        };


    });