'use strict';

var _ = require('underscore'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var detailsSchema = new Schema({
    no: Number,
    details: [String]
});

var patientSchema = new Schema({
    no: Number,
    gender: String,
    name: String,
    test1: String,
    test2: String,
    test3: String,
    details: [detailsSchema]
});

patientSchema.statics.update = function (data, cb) {
    this.findById(data._id, function (err, doc) {
        doc.name = data.name;
        doc.test1 = data.test1;
        doc.test2 = data.test2;
        doc.test3 = data.test3;
        doc.no = data.no;

        doc.save(cb);
    });
}

patientSchema.statics.getByGender = function (gender, cb) {
    this.find({ gender : gender })
        .select('no name test1 test2 test3 gender')
        .sort('no')
        .exec(cb);
}

patientSchema.statics.percentage = function (cb) {
    var that = this;
    that.count({ gender : 'male'}, function (errMale, countMale) {
        that.count({ gender : 'female'}, function (errFemale, countFemale) {
            cb({ male : countMale, female: countFemale });
        });
    });
}

patientSchema.statics.search = function (gender, search, cb) {
    var regex = new RegExp(search, 'i');
  
    this.find({ gender : gender })
        .or([
            { 'name' : { $regex: regex } },
            { 'test1' : { $regex: regex } },
            { 'test2' : { $regex: regex } },
            { 'test3' : { $regex: regex } },
            { 'no' : !isNaN(search) ? parseInt(search, 10) : 0 }
        ])
        .select('no name test1 test2 test3 gender')
        .sort('no')
        .exec(cb);
}

patientSchema.statics.searchDetails = function (id_patient, search, cb) {
    var regex = new RegExp(search, 'i');

    this.findOne({ _id : id_patient }).exec(function (err, data) {
        var items = [];

        _.each(data.details, function (item) {
            var check = _.filter(item.details, function (obj) { return obj.match(regex); });
            if (check.length > 0) {
                items.push(item);
                return;
            }

        });
        
        cb(items);
    });
}

patientSchema.statics.addDetails = function (id_patient, no, details, cb) {
    this.findById(id_patient, function (err, doc) {
        doc.details.push({
            no : no,
            details: details
        });
        doc.save(cb);
    });
}

patientSchema.statics.updateDetails = function (id, details, cb) {
    this.findOne(
        {'details._id': id},
        {'details.$': 1},
        function (err, data) {
            if (data) {
                data.details[0].details = details;
                data.save(cb);
            }
        }
    );
}

patientSchema.statics.deleteDetails = function (id_patient, id_detail, cb) {
    this.findById(id_patient, function (err, doc) {
        doc.details.remove(id_detail);
        doc.save(cb);
    });
}

module.exports = mongoose.model('Patient', patientSchema);