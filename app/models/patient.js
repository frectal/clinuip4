'use strict';

var _ = require('underscore'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var detailsSchema = new Schema({
    no: String,
    details: [String],
    author: String,
    date: String
});

var patientSchema = new Schema({
    identifier: String,
    name: String,
    gender: String,
    dob: String,
    sex: String,
    author: String,
    details: [detailsSchema]
});

patientSchema.statics.getByGender = function (sex, cb) {
    this.find({ sex : sex })
        .sort('no')
        .exec(cb);
}

patientSchema.statics.percentage = function (cb) {
    var that = this;
    that.count({ sex : 'male'}, function (errMale, countMale) {
        that.count({ sex : 'female'}, function (errFemale, countFemale) {
            cb({ male : countMale, female: countFemale });
        });
    });
}

patientSchema.statics.search = function (sex, search, cb) {
    var regex = new RegExp(search, 'i');
  
    this.find({ sex : sex })
        .or([
            { 'name' : { $regex: regex } },
            { 'sex' : { $regex: regex } },
            { 'dob' : { $regex: regex } }
        ])
        .sort('name')
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

patientSchema.statics.addDetails = function (id_patient, detail, cb) {
    this.findById(id_patient, function (err, doc) {
        doc.details.push(detail);
        doc.save(cb);
    });
}

patientSchema.statics.updateDetails = function (detail, cb) {
    this.findOne(
        {'details._id': detail._id},
        {'details.$': 1},
        function (err, data) {
            if (data) {
                data.details[0].no = detail.no;
                data.details[0].details = detail.details;
                data.details[0].author = detail.author;
                data.details[0].date = detail.date;
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