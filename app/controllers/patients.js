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
            search = req.param('search');

        // Select 'male' or 'female' patients
        if (gender) {
            if (search) {
                Patient.search(gender.toLowerCase(), search, function (err, data) {
                    res.json(data);
                });
            } else {
                Patient.getByGender(gender.toLowerCase(), function (err, data) {
                    res.json(data);
                });
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
     * Create or update patient
     * POST: /patient
     */
    this.router.post('/', function (req, res) {
        if (req.body._id) {
            Patient.update(req.body, function (err, patient) {
                res.json(patient);
            });            
        } else {
            var newPatient = new Patient();
            newPatient.name = req.body.name;
            newPatient.test1 = req.body.test1;
            newPatient.test2 = req.body.test2;
            newPatient.test3 = req.body.test3;
            newPatient.test4 = req.body.test4;
            newPatient.no = req.body.no;
            newPatient.gender = req.body.gender;
            newPatient.save(function (err, patient) {
                res.json(patient);
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
        } else {
            Patient.findById(req.params.id, function (err, doc) {
                res.json(doc.details);
            });
        }
    });

    /**
     * Create or update patient details (tags)
     * POST: /patients/123/details
     */
    this.router.post('/:id/details', function (req, res) {
        if (req.body._id) {
            Patient.updateDetails(req.body._id, req.body.details, function (err, savedData) {
                res.json(savedData.details[0]);
            });
        } else {
            Patient.addDetails(req.params.id, req.body.no, req.body.details, function (err, data) {
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