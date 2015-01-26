'use strict';

angular.module('clinuip')
    .controller('PatientsCtrl', function PatientsCtrl($scope, $rootScope, Patients, Api) {

        $scope.query = '';           // left query textbox
        $scope.patientFilter = null; // midle filter textbox
        $scope.age = null;           // selected age range

        $scope.chosenGender = null;
        $scope.selectedPatient = null;
        $scope.patients = [];
        $scope.details = [];
        $scope.countMaleFemale = { male: 0, female : 0 };

        $scope.detailFilter = null;
        $scope.patientModal = {};
        $scope.notes = '';

        $scope.moment = moment;

        $scope.clear = function () {
            $scope.query = "";
            $scope.chosenGender = null;
            $scope.queryLabel = "";
            $scope.patientFilter = null;
            $scope.age = null;

            loadPatients();
        }

        var chartData = [
            { y: 50, name: "Male" },
            { y: 50, name: "Female" }
        ];

        var ageData = [
            {y: 0, label: "0-30", id:"age30"},
            {y: 0,  label: "31-60", id:"age60" },
            {y: 0,  label: "61-100", id:"age100"}
        ];

        function loadPatientsPercentage() {
            Patients.get({ percentage : true }, function (data) {
                $scope.countMaleFemale.female = data.female;
                $scope.countMaleFemale.male = data.male;
            });
        }
        loadPatientsPercentage();

        function loadPatientsAge() {
            Patients.get({ agecount : true }, function (data) {
                ageData[0].y = data.age30;
                ageData[1].y = data.age60;
                ageData[2].y = data.age100;
            });
        }
        loadPatientsAge();

        function loadPatients() {
            $scope.patients = [];

            var query = $scope.query,
                age = $scope.age ? $scope.age.id : '',
                filter = $scope.patientFilter || '',
                gender = $scope.chosenGender ? $scope.chosenGender.toLowerCase() : null;

            var apiQuery = {};

            if (age && age !== '') {
                apiQuery.age = age;
            }

            if (filter && filter !== '') {
                apiQuery.filter = filter;
            }

            if (gender && ['male', 'female'].indexOf(gender) !== -1) {
                apiQuery.gender =  gender;
            }

            if (query && query !== '') {
                apiQuery.query = query;
            }

            if (apiQuery.age || apiQuery.gender || apiQuery.query || apiQuery.filter) {
                $scope.details = [];
                $scope.selectedPatient = null;
                $scope.patients = [];
                $scope.queryLabel = query;

                Patients.query(apiQuery, function (data) {
                    $scope.patients = data;
                });
            }
        }

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
                loadPatients();

                $('#form-add-patient').modal('hide');
            });
        };

        $scope.deletePatient = function (patient) {
            bootbox.confirm("Are you sure?", function(result) {
                if (result) {
                    Api.Patients.del({id : patient._id }, function (data) {
                        loadPatientsPercentage();
                        loadPatients();
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

        $scope.addDetailsTemplate = function () {
            $('.add-notes').val('');
            $scope.detailForm.$setPristine();
            $scope.detailsModalTitle = 'Add Patient Data by Template';
            $scope.contentLines = '';
            $scope.detailsModal = {
                date: moment().format('DD/MM/YYYY')
            };
            $('#form-add-details-template').modal({});
        };

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

        var chart = new CanvasJS.Chart("chartContainer", {
            data: [
                {
                    type: "pie",

                    click: function(e){
                        $scope.$apply (function() {
                            if ($scope.chosenGender === e.dataPoint.name) {
                                $scope.chosenGender = null;
                            } else {
                                $scope.chosenGender = e.dataPoint.name;
                            }
                            loadPatients();
                        });
                    },
                    indexLabelPlacement: "inside",
                    toolTipContent: "{name}: {y} %",
                    dataPoints: chartData
                }
            ]
        });

        var chartAge = new CanvasJS.Chart("chartContainerAge",
            {
                axisY:{
                    title: ""
                },
                data: [
                    {
                        type: "column",
                        click: function(e){
                            $scope.$apply (function() {
                                if (e.dataPoint === $scope.age) {
                                    $scope.age = null;
                                } else {
                                    $scope.age = e.dataPoint;
                                }
                                loadPatients();
                            });
                        },
                        dataPoints: ageData
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

        $scope.search = function () {
            loadPatients();
        };

        $('#myTabs a').click(function (e) {
            e.preventDefault();
            $(this).tab('show');
            chartAge.render();
        })

        $scope.$watch('patientFilter', function (newValue) {
            loadPatients();
        }, true);

        $scope.$watch('detailFilter', function (newValue) {
            if ($scope.selectedPatient) {
                Patients.details({ id: $scope.selectedPatient._id, search: newValue }, function (data) {
                    //$scope.selectedPatient.details = data;
                });
            }
        }, true);

    });