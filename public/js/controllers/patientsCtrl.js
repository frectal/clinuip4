'use strict';

angular.module('clinuip')
    .controller('PatientsCtrl', function PatientsCtrl($scope, $rootScope, Patients) {

        $scope.chosenGender = null;
        $scope.selectedPatient = null;
        $scope.patients = [];
        $scope.details = [];
        $scope.countMaleFemale = { male: 0, female : 0 };
        $scope.patientFilter = null;
        $scope.detailFilter = null;

        $scope.patientModal = {};

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
            $scope.patientModalTitle = 'Add new patient';
            $scope.patientModal = {};
            $('#form-add-patient').modal({});

            /*
             Patients.save(newPatient, function (data) {
             $scope.patients.push(data);
             if (newPatient.gender == "male") {
             $scope.countMaleFemale.male += 1;
             } else {
             $scope.countMaleFemale.female += 1
             }
             });
             */
        };

        $scope.editPatient = function (patient) {
            $scope.patientModalTitle = 'Edit patient';
            $scope.patientModal = angular.copy(patient);

            $('#form-add-patient').modal({});
        };

        $scope.showDetails = function (id) {
            Patients.details({ id : id }, function (data) {
                $scope.selectedPatient = _.findWhere($scope.patients, {_id: id});
                $scope.details = data;
            });
        };

        $scope.addDetails = function () {
            $scope.detailsModalTitle = 'Add patient details';
            $scope.contentLines = '';
            $scope.detailsModal = {};
            $('#form-add-details').modal({});

            // Patients.detailsSave({ id : $scope.selectedPatient._id}, newItem);
        };

        //$scope.contentLines = '123';
        $scope.editDetails = function (details) {
            $scope.detailsModalTitle = 'Edit patient details';
            $scope.contentLines = details.details.join('\n');
            $scope.detailsModal = angular.copy(details);
            $('#form-add-details').modal({});

            // Patients.detailsSave({ id : $scope.selectedPatient._id}, item);
        };

        $scope.saveDetails = function (details) {
            var list = _.filter($scope.contentLines.split('\n'), function(str) { return str !== ''; });
            details.details = list;

            //details.details = $scope.contentLines.split('\n');
            $scope.contentLines = '';

            console.log(details);
            console.log($scope.details);

            if (details._id) {
                var index = _.findIndex($scope.details, { _id : details._id });
                if (index !== -1) {
                    $scope.details[index] = details;
                }
            } else {
                details._id = _.random(1000, 9999);
                $scope.details.push(angular.copy(details));
            }
            $('#form-add-details').modal('hide');
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

        function getAllItems() {
            var items = [];
            _.forEach($rootScope.contents, function(item) {
                _.forEach(item.contents, function(content) {
                    items.push({ value : item.tag + ' - ' + content });
                });
            });
            return items;
        }

        var states = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            local: getAllItems()
        });

        states.initialize();

        $('.typeahead').typeahead({
            hint: true,
            highlight: true,
            minLength: 1
        },
        {
            name: 'states',
            displayKey: 'value',
            source: states.ttAdapter()
        });

        $scope.notes = '';

        $('.typeahead').on('typeahead:selected', function(event, object, dataset) {
            $(this).val('');
            $scope.$apply (function() {
                $scope.contentLines += object.value + '\n';
            });
        });
    });