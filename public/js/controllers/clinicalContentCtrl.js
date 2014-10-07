'use strict';

angular.module('clinuip')
    .controller('ClinicalContentCtrl', function UsersCtrl($scope, $location, $routeParams) {

        $scope.contents = [
            { id: 1, tags: ['jedan', 'dva', 'tri'], content: 'prvi red\ndrugired' },
            { id: 2, tags: ['aaaa', 'bbbb', 'ccc'], content: 'prvi red\ndrugired' },
            { id: 3, tags: ['jedan', 'dva', 'tri'], content: 'prvi red\ndrugired\ndrugired\ndrugired' }
        ];

        $scope.current = {};

        $scope.saveContent = function (content) {
            content.tags = _.map($("#tags").tokenfield('getTokens'), function(item) { return item.value; });

            if (content.id) {
                var index = _.findIndex($scope.contents, { id : content.id });
                if (index !== -1) {
                    $scope.contents[index] = content;
                }
            } else {
                content.id = _.random(10, 99);
                $scope.contents.push( angular.copy(content));
            }
            $('#myModal').modal('hide');
        };

        $scope.editContent = function (content) {
            $scope.current = angular.copy(content);
            $("#tags").val($scope.current.tags.join(', ')).tokenfield({
                autocomplete: {
                    delay: 100
                }
            });
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
            $("#tags").val('').tokenfield({
                autocomplete: {
                    delay: 100
                }
            });
            $('#myModal').modal();
        };


    });