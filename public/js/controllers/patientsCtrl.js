'use strict';

angular.module('clinuip')
    .controller('PatientsCtrl', function PatientsCtrl($scope, $rootScope, Patients, Api) {

        $scope.chosenGender = null;
        $scope.selectedPatient = null;
        $scope.patients = [];
        $scope.details = [];
        $scope.countMaleFemale = { male: 0, female : 0 };
        $scope.patientFilter = null;
        $scope.detailFilter = null;
        $scope.patientModal = {};
        $scope.notes = '';

        var chartData = [
            { y: 50, name: "Male" },
            { y: 50, name: "Female" }
        ];


        function loadPatientsPercentage() {
            Patients.get({ percentage : true }, function (data) {
                $scope.countMaleFemale.female = data.female;
                $scope.countMaleFemale.male = data.male;
            });
        }
        loadPatientsPercentage();

        $scope.$watch('patientFilter', function (newValue) {
            Patients.query({ gender : $scope.chosenGender, search : newValue}, function (data) {
                $scope.patients = data;
            });
        }, true);

        $scope.$watch('detailFilter', function (newValue) {
            if ($scope.selectedPatient) {
                Patients.details({ id: $scope.selectedPatient._id, search: newValue }, function (data) {
                    //$scope.selectedPatient.details = data;
                });
            }
        }, true);

        function loadPatients(gender, query) {
            $scope.details = [];
            $scope.selectedPatient = null;
            Patients.query({ gender : gender, query: query }, function (data) {
                $scope.patients = data;
            });
        }

        $scope.$watch('chosenGender', function (newValue) {
            if (newValue && ['male', 'female'].indexOf(newValue.toLowerCase()) !== -1) {
                loadPatients(newValue.toLowerCase(), $scope.query);
            }
        }, true);

        $scope.$watch('query', function (newValue) {
            if ($scope.chosenGender) {
                loadPatients($scope.chosenGender.toLowerCase(), newValue);
            }
        }, true);

        $scope.$watch('countMaleFemale', function () {
            renderChart();
        }, true);

        $scope.addPatient = function () {
            $scope.patientForm.$setPristine();
            $scope.patientModalTitle = 'Add new patient';
            $scope.patientModal = {
                dob: moment().format('DD/MM/YYYY')
            };
            $('#form-add-patient').modal({});
        };

        $scope.editPatient = function (patient) {
            $scope.patientModalTitle = 'Edit patient';
            $scope.patientModal = angular.copy(patient);
            $('#form-add-patient').modal({});
        };

        $scope.savePatient = function (patient) {
            Api.Patients.save(patient, function (data) {
                loadPatientsPercentage();
                loadPatients($scope.chosenGender);

                $('#form-add-patient').modal('hide');
            });
        };

        $scope.deletePatient = function (patient) {
            bootbox.confirm("Are you sure?", function(result) {
                if (result) {
                    Api.Patients.del({id : patient._id }, function (data) {
                        loadPatientsPercentage();
                        loadPatients($scope.chosenGender);
                    });
                }
            });
        };


        $scope.showDetails = function (patient) {
            $scope.selectedPatient = patient;
            $scope.details = patient.details;
        };

        $scope.addDetails = function () {
            $('.add-notes').val('');
            $scope.detailForm.$setPristine();
            $scope.detailsModalTitle = 'Add Patient Data';
            $scope.contentLines = '';
            $scope.detailsModal = {
                date: moment().format('DD/MM/YYYY')
            };
            $('#form-add-details').modal({});
        };

        //$scope.contentLines = '123';
        $scope.editDetails = function (details) {
            $('.add-notes').val('');
            $scope.detailsModalTitle = 'Edit Patient Data';
            $scope.contentLines = details.details.join('\n');
            $scope.detailsModal = angular.copy(details);
            $('#form-add-details').modal({});
        };

        $scope.saveDetails = function (details) {
            var list = _.filter($scope.contentLines.split('\n'), function(str) { return str !== ''; });
            details.details = list;
            $scope.contentLines = '';

            Patients.detailsSave({ id : $scope.selectedPatient._id}, details, function() {
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
            });
        };

        $scope.deleteDetails = function (detail) {
            bootbox.confirm("Are you sure?", function(result) {
                if (result) {
                    var item = _.findWhere($scope.selectedPatient.details, {_id: detail._id});
                    $scope.selectedPatient.details = _.without($scope.selectedPatient.details, item);
                    Patients.detailsDelete({
                        id : $scope.selectedPatient._id,
                        id_detail : detail._id
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

        $scope.initTypeahead = function () {
            function getAllItems() {
                var items = [];
                _.forEach($rootScope.contents, function(item) {
                    _.forEach(item.contents, function(content) {
                        items.push({ value : item.name + ' - ' + content });
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
        };

        $('.typeahead').on('typeahead:selected', function(event, object, dataset) {
            $(this).val('');
            $scope.$apply (function() {
                $scope.contentLines += object.value + '\n';
            });
        });

        $scope.destroyTypeahead = function () {
            $('.typeahead').typeahead('destroy');
        };

        $scope.$watch('detailsModal.tags', function (newValue, oldValue) {
            $scope.destroyTypeahead();

            var tags = [];
            if (newValue && newValue !== "") {
                _(newValue.split(',')).forEach(function(item) {
                    if (item.trim() !== "") {
                        tags.push(item.trim())
                    }
                });

                if (tags.length > 0) {
                    Api.Contents.contents({tag : tags.join(',')}, function (data) {
                        $rootScope.contents = data;
                        $scope.initTypeahead();
                    });
                } else {
                    $scope.initTypeahead();
                }
            } else {
                Api.Contents.query(function(data) {
                    $rootScope.contents = data;
                    $scope.initTypeahead();
                });
            }
        }, true);

        $('.patient-datepicker').datepicker({ format: 'dd/mm/yyyy' }).on('changeDate', function(ev){
            $scope.$apply (function() {
                $scope.patientModal.dob = moment(ev.date).format('DD/MM/YYYY');
            });
            $('.patient-datepicker').datepicker('hide');
        });

        $('.detail-datepicker').datepicker({ format: 'dd/mm/yyyy' }).on('changeDate', function(ev){
            $scope.$apply (function() {
                $scope.detailsModal.date = moment(ev.date).format('DD/MM/YYYY');
            });
            $('.detail-datepicker').datepicker('hide');
        });


    });