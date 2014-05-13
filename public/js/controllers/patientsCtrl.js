'use strict';

angular.module('clinuip')
    .controller('PatientsCtrl', function PatientsCtrl($scope, Patients) {

        $scope.chosenGender = null;
        $scope.selectedPatient = null;
        $scope.patients = [];
        $scope.details = [];
        $scope.countMaleFemale = { male: 0, female : 0 };
        $scope.patientFilter = null;
        $scope.detailFilter = null;

        var chartData = [
            { y: 50, name: "Male" },
            { y: 50, name: "Female" }
        ];

        // Load data for chart
        Patients.get({ percentage : true }, function (data) {
            $scope.countMaleFemale.female = data.female;
            $scope.countMaleFemale.male = data.male;
        });

        $scope.$watch('patientFilter', function (newValue) {
            Patients.query({ gender : $scope.chosenGender, search : newValue}, function (data) {
                $scope.patients = data;
            });
        }, true);

        $scope.$watch('detailFilter', function (newValue) {
            if ($scope.selectedPatient) {
                Patients.details({ id: $scope.selectedPatient._id, search: newValue }, function (data) {
                    $scope.details = data;
                });
            }
        }, true);

        $scope.$watch('chosenGender', function (newValue, oldValue) {
            if (newValue && ['male', 'female'].indexOf(newValue.toLowerCase()) !== -1) {
                $scope.details = [];
                $scope.selectedPatient = null;
                Patients.query({ gender : newValue.toLowerCase()}, function (data) {
                    $scope.patients = data;
                });
            }
        }, true);

        $scope.$watch('countMaleFemale', function () {
            renderChart();
        }, true);

        $scope.addPatient = function () {
            var htmlForm = $(".form-add-patient").clone().show(),
                name = htmlForm.find("#name"),
                test1 = htmlForm.find("#test1"),
                test2 = htmlForm.find("#test2"),
                test3 = htmlForm.find("#test3");

            name.focus();

            showModal(htmlForm, "Add new patient", function () {
                var newPatient = {
                    no : _.random(100, 999),
                    name : name.val(),
                    test1 : test1.val(),
                    test2 : test2.val(),
                    test3 : test3.val(),
                    gender : $scope.chosenGender.toLowerCase()
                };

                Patients.save(newPatient, function (data) {
                    $scope.patients.push(data);
                    if (newPatient.gender == "male") {
                        $scope.countMaleFemale.male += 1;
                    } else {
                        $scope.countMaleFemale.female += 1
                    }
                });
            });
        };

        $scope.editPatient = function (id) {
            var htmlForm = $(".form-add-patient").clone().show(),
                patient = _.findWhere($scope.patients, {_id: id}),
                name = htmlForm.find("#name").val(patient.name),
                test1 = htmlForm.find("#test1").val(patient.test1),
                test2 = htmlForm.find("#test2").val(patient.test2),
                test3 = htmlForm.find("#test3").val(patient.test3);

            showModal(htmlForm, "Edit new patient", function () {
                var item = _.findWhere($scope.patients, {_id: id});
                item.name = name.val();
                item.test1 = test1.val();
                item.test2 = test2.val();
                item.test3 = test3.val();
                item.$save();
            });
        };

        $scope.showDetails = function (id) {
            Patients.details({ id : id }, function (data) {
                $scope.selectedPatient = _.findWhere($scope.patients, {_id: id});
                $scope.details = data;
            });
        };

        $scope.addDetails = function () {
            var htmlForm = $(".form-add-details").clone().show(),
                tags = htmlForm.find("#tokenfield").tokenfield();

            showModal(htmlForm, "Add patient details", function () {
                var items = [];
                _.each(tags.tokenfield('getTokens'), function (item) {
                    items.push(item.value);
                });

                var newItem = {
                    no : _.random(100, 999),
                    details: items
                };

                $scope.details.push(newItem);

                Patients.detailsSave({ id : $scope.selectedPatient._id}, newItem);
            });
        };

        $scope.editDetails = function (id) {
            var htmlForm = $(".form-add-details").clone().show(),
                item = _.findWhere($scope.details, {_id: id}),
                tags = htmlForm.find("#tokenfield").val(item.details.join(', ')).tokenfield();

            showModal(htmlForm, "Edit patient details", function () {
                var items = [];
                _.each(tags.tokenfield('getTokens'), function (tag) {
                    items.push(tag.value);
                });
                item.details = items;
                Patients.detailsSave({ id : $scope.selectedPatient._id}, item);
            });
        };

        $scope.deleteDetails = function (id) {
            bootbox.confirm("Are you sure?", function(result) {
                if (result) {
                    var item = _.findWhere($scope.details, {_id: id});
                    $scope.details = _.without($scope.details, item);
                    Patients.detailsDelete({
                        id : $scope.selectedPatient._id,
                        id_detail : id
                    });
                }
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

        // Create chart component
        var chart = new CanvasJS.Chart("chartContainer", {
            data: [
                {
                    type: "pie",
                    click: function(e){
                        $scope.$apply (function() {
                            $scope.chosenGender = e.dataPoint.name;
                        });
                    },
                    indexLabelPlacement: "inside",
                    toolTipContent: "{name}: {y} %",
                    dataPoints: chartData
                }
            ]
        });

        function renderChart() {
            var total = $scope.countMaleFemale.male + $scope.countMaleFemale.female;
            chartData[0].y = Math.round(($scope.countMaleFemale.male / total) * 100);
            chartData[1].y = Math.round(($scope.countMaleFemale.female / total) * 100);
            chart.render();
        }
    });