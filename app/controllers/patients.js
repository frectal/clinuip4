'use strict';

var express = require('express'),
    moment = require('moment'),
    Patient = require('../models').Patient;

var Patients = function Patients(passport) {

    if (!(this instanceof Patients)) {
        return new Patients(passport);
    }

    this.router = express.Router();
    this.passport = passport === undefined ? function (req, res, next) { next(); } : passport;

    this.router.use(function (req, res, next) {
        next();
    });

    this.router.use(this.passport);

    this.router.get('/', function (req, res) {
        var gender = req.param('gender'),
            search = req.param('search'),
            query  = req.param('query'),
            age    = req.param('age'),
            regexQuery = new RegExp(query, 'i');

        if (req.param('percentage')) {
            Patient.percentage(query, function (data) {
                res.json(data);
            });
            return;
        }

        if (req.param('agecount')) {
            Patient.age(query, function (data) {
                res.json(data);
            });
            return;
        }

        // 0 - 30
        var start1 = moment().add(-30, 'y').hour(0).minute(0).second(0);
        var end1 = moment().hour(23).minute(59).second(59);

        // 31 - 60
        var start2 = moment().add(-60, 'y').hour(0).minute(0).second(0);
        var end2 = moment().add(-30, 'y').add(-1, 'm').hour(23).minute(59).second(59);

        // 61 - 100+
        var start3 = moment().add(-150, 'y').hour(0).minute(0).second(0);
        var end3 = moment().add(-60, 'y').add(-1, 'm').hour(23).minute(59).second(59);

        if (gender || query || age ) {
            var q = Patient.find();
            if (gender) {
                q.where({ sex : gender.toLowerCase() });
            }
            if (search) {
                var regex = new RegExp(search, 'i');
                q.or([
                    { 'name' : { $regex: regex } },
                    { 'sex' : { $regex: regex } },
                    { 'dob' : { $regex: regex } }
                ]);
            }
            if (age) {
                if (age === "age30") {
                    q.where({"dob":{ "$gte": start1, "$lt":end1 }});
                }
                if (age === "age60") {
                    q.where({"dob":{ "$gte": start2, "$lt":end2 }});
                }
                if (age === "age100") {
                    q.where({"dob":{ "$gte": start3, "$lt":end3 }});
                }
            }
            if (query) {
                q.where({ 'details.details': { $regex: regexQuery } });
            }

            q.sort('name').exec(function (err, data) {
                res.json(data);
            });
        }
    });

    /**
     * Get details information for single patient
     * GET: /patients/123/details
     */
    this.router.get('/:id/details', function (req, res) {
        if (req.param('search')) {
            Patient.searchDetails(req.params.id, req.param('search'), function(items){
                res.json(items);
            });
        }
    });

    /**
     * Create or update patient
     * POST: /patient
     */
    this.router.post('/', function (req, res) {

        if (req.body._id) {
            Patient
                .findOne({'_id': req.body._id})
                .exec(function (err, data) {
                    if (data) {
                        data.identifier = req.body.identifier;
                        data.name = req.body.name;
                        data.gender = req.body.gender;
                        data.dob = req.body.dob;
                        data.sex = req.body.sex;
                        data.author = req.body.author;
                        data.save(function () {
                            res.json(data);
                        });
                    }
                });
        } else {
            var newPatient = new Patient(req.body);

            newPatient.save(function (err, patient) {
                res.json(patient);
            });
        }
    });

    /**
     * Delete patient
     * DELETE: /patients
     */
    this.router.delete('/:id', function (req, res) {
        if (req.params.id) {
            Patient.findByIdAndRemove(req.params.id, function (err, data) {
                res.json(data);
            });
        }
    });

    /**
     * Create or update patient details (tags)
     * POST: /patients/123/details
     */
    this.router.post('/:id/details', function (req, res) {
        if (req.body._id) {
            Patient.updateDetails(req.body, function (err, savedData) {
                res.json(null);
            });
        } else {
            Patient.addDetails(req.param('id'), req.body, function (err, data) {
                res.json(data);
            });
        }
    });

    /**
     * Delete patient specific detail (tags)
     * POST: /patients/123/details/123
     */    
    this.router.delete('/:id/details/:id_detail', function (req, res) {
        Patient.deleteDetails(req.params.id, req.params.id_detail, function (err, data) {
            res.json(data);
        });        
    });
};

module.exports = Patients;