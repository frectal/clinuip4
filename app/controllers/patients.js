'use strict';

var express = require('express'),
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
            regex = new RegExp(query, 'i');

        // Select 'male' or 'female' patients
        if (gender || query) {
            if (search) {
                Patient.search(gender.toLowerCase(), search, function (err, data) {
                    res.json(data);
                });
            } else {
                if (gender && query && query !== "") {
                    Patient
                        .find({ 'details.details': { $regex: regex } })
                        .where('sex').equals(gender.toLowerCase())
                        .sort('no')
                        .exec(function (err, data) {
                            console.log(data);
                            res.json(data);
                        });
                } else {
                    if (!gender && query && query !== "") {
                        Patient
                            .find({ 'details.details': { $regex: regex } })
                            .sort('no')
                            .exec(function (err, data) {
                                console.log(data);
                                res.json(data);
                            });
                    } else {
                        Patient.getByGender(gender.toLowerCase(), function (err, data) {
                            res.json(data);
                        });
                    }
                }
            }
        }

        // Get count for 'male' and 'female' patients
        if (req.param('percentage')) {
            Patient.percentage(function (data) {
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
                console.log(savedData);
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