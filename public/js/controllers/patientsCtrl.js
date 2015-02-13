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
			$('.queryTypehead').typeahead('val', '');
            $scope.chosenGender = null;
            $scope.queryLabel = "";
            $scope.patientFilter = null;
            $scope.age = null;

            $scope.selectedPatient = null;
            $scope.details = [];

            loadPatients();
            loadPatientsPercentage();
            loadPatientsAge();
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

        function loadPatientsPercentage(cb) {
            Patients.get({ percentage : true, query: $scope.query }, function (data) {
                $scope.countMaleFemale.female = data.female;
                $scope.countMaleFemale.male = data.male;
                chart.render();
				if (cb) cb();
            });
        }

        function loadPatientsAge(cb) {
            Patients.get({ agecount : true, query: $scope.query }, function (data) {
                ageData[0].y = data.age30;
                ageData[1].y = data.age60;
                ageData[2].y = data.age100;
                chartAge.render();
				if (cb) cb();
            });
        }

        loadPatientsPercentage();
        loadPatientsAge();

        function loadPatients(cb) {
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
					if (cb) cb();
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
            $('.patient-datepicker').datepicker('setValue', moment($scope.patientModal.dob));
            $scope.patientModal.dob = moment($scope.patientModal.dob).format('DD/MM/YYYY');
            $('#form-add-patient').modal({});
        };

        $scope.savePatient = function (patient) {
            if (patient.dob) {
                patient.dob = moment(patient.dob, 'DD/MM/YYYY').hour(0).minute(1).second(1).format();
            }
            Api.Patients.save(patient, function (data) {
                loadPatientsAge();
                loadPatientsPercentage();
                loadPatients();

                $('#form-add-patient').modal('hide');
            });
        };

        $scope.deletePatient = function (patient) {
            bootbox.confirm("Are you sure?", function(result) {
                if (result) {
                    Api.Patients.del({id : patient._id }, function (data) {
                        loadPatientsAge();
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
            createTagPatientData(_.clone($rootScope.contents));
            $('#form-add-details').modal({});
        };

        $scope.addDetailsTemplate = function () {
            $('.add-notes').val('');
            $('.tagsTemplate').val('');
            $scope.selectedTemplateTagItem = null;
            $scope.templateItems = [];
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
            createTagPatientData(_.clone($rootScope.contents));
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
                $('#form-add-details-template').modal('hide');
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

        function addNewNoteLine(note) {
            $scope.contentLines = $scope.contentLines ? $scope.contentLines.trim() : "";
            var latestLine = $scope.contentLines.split("\n");
            if (latestLine.length > 0 && latestLine[latestLine.length-1] === note) {
                return;
            }

            if ($scope.contentLines) {
                $scope.contentLines += '\n' + note;
            } else {
                $scope.contentLines = note;
            }
        }

        $scope.$watch("detailsModal.tags", _.debounce(function (newValue, oldValue) {
            var tags = [];
            if (newValue && newValue !== "") {
                _(newValue.split(',')).forEach(function(item) {
                    if (item.trim() !== "") {
                        tags.push(item.trim())
                    }
                });

                if (tags.length > 0) {
                    Api.Contents.contents({tag : tags.join(',')}, function (data) {
                        createTagPatientData(_.clone(data));
                    });
                }
            } else {
                createTagPatientData(_.clone($rootScope.contents));
            }
        }, 1000));

        function createTagPatientData(contents) {
            $('.typeaheadAddNotes').typeahead('destroy');

            function getAllItems() {
                var items = [];
                _.forEach(contents, function(item) {
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

            var notesTypehead = $('.typeaheadAddNotes').typeahead({
                    hint: true,
                    highlight: true,
                    minLength: 1
                },
                {
                    name: 'states',
                    displayKey: 'value',
                    source: states.ttAdapter()
                });

            notesTypehead.on('keyup', function(event) {
                var that = this;
                if (event.keyCode === 13) {
                    $scope.$apply (function() {
                        addNewNoteLine(that.value);
						notesTypehead.typeahead('val', '');
                    });
                }
            });

            notesTypehead.on('typeahead:selected', function(event, object, dataset) {
                $scope.$apply (function() {
                    addNewNoteLine(object.value);
					notesTypehead.typeahead('val', '');
                });
            });
        }
        createTagPatientData(_.clone($rootScope.contents));

        function createTagTypeahead() {
            function getAllTags() {
                var tags = [];
                _.forEach($rootScope.contents, function(item) {
                    _.forEach(item.tags, function(tag) {
                        if (!_.find(tags, { 'value': tag })) {
                            tags.push({ value : tag })
                        }
                    });
                });
                return tags;
            }

            var states = new Bloodhound({
                datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                local: getAllTags()
            });
            states.initialize();

            var tagTypehead = $('.tagsTemplate').typeahead({
                    hint: true,
                    highlight: true,
                    minLength: 1
                },
                {
                    name: 'states',
                    displayKey: 'value',
                    source: states.ttAdapter()
                });

            var selectedValue = "";
            tagTypehead.on('typeahead:selected', function(event, object, dataset) {
                $scope.$apply (function() {
                    selectedValue = object.value;
                    bindTemplateItems(object.value);
                });
            });

            tagTypehead.on('keyup', function(event) {
                if (this.value !== selectedValue) {
                    $scope.$apply (function() {
                        $scope.templateItems = [];
                    });
                }
            });
        }
        createTagTypeahead();

        function createQueryTypehead() {
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

            var notesTypehead = $('.queryTypehead').typeahead({
                    hint: true,
                    highlight: true,
                    minLength: 1
                },
                {
                    name: 'states',
                    displayKey: 'value',
                    source: states.ttAdapter()
                });

            notesTypehead.on('keyup', function(event) {
                var that = this;
                if (event.keyCode === 13) {
                    $scope.$apply (function() {
                        $scope.query = that.value;
                        notesTypehead.trigger('blur');
                        notesTypehead.focus();
                        $scope.search();
                    });
                }
            });

            notesTypehead.on('typeahead:selected', function(event, object, dataset) {
                $scope.$apply (function() {
                    $scope.query = object.value;
                });
            });
        }
        createQueryTypehead();

        $scope.templateItems = [];
        function bindTemplateItems(tag) {
            $scope.templateItems = [];
            _.forEach($rootScope.contents, function(content) {
                if (content.tags.indexOf(tag) !== -1) {
                    _.forEach(content.contents, function(str) {
                        $scope.templateItems.push(content.name + ' - ' + str);
                    });
                }
            });
        }

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
			$scope.chosenGender = null;
			$scope.age = null;	
			loadPatients();
			loadPatientsPercentage();
			loadPatientsAge();
        };

        $('#myTabs a').click(function (e) {
            e.preventDefault();
            $(this).tab('show');
            chartAge.render();
            chart.render();
        });

        $scope.$watch('detailFilter', function (newValue) {
            if ($scope.selectedPatient) {
                Patients.details({ id: $scope.selectedPatient._id, search: newValue }, function (data) {
                    //$scope.selectedPatient.details = data;
                });
            }
        }, true);

        $scope.addNoteFromTag = function(item) {
            if (item.length > 0) {
                addNewNoteLine(item[0]);
                $scope.selectedTemplateTagItem = null;
            }
        }

        $scope.filterPatients = function (item){
            if (!$scope.patientFilter) {
                return true;
            }
            if (item.name.toLowerCase().indexOf($scope.patientFilter) != -1 ||
                item.sex.toLowerCase().indexOf($scope.patientFilter) != -1 ||
                moment(item.dob).format('DD/MM/YYYY').indexOf($scope.patientFilter) != -1) {
                return true;
            }
            return false;
        };
    });