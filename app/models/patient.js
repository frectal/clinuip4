'use strict';

var _ = require('underscore'),
    moment = require('moment'),
    mongoosePaginate = require('mongoose-paginate'),
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
    dob: Date,
    sex: String,
    author: String,
    details: [detailsSchema]
});

patientSchema.plugin(mongoosePaginate)

patientSchema.statics.getByGender = function (sex, cb) {
    this.find({ sex : sex })
        .sort('no')
        .exec(cb);
}

patientSchema.statics.percentage = function (query, cb) {
    var that = this;
    var regexQuery = new RegExp(query, 'i');

    if (query) {
        that.count({ sex : 'male', 'details.details': { $regex: regexQuery }}, function (errMale, countMale) {
            that.count({ sex : 'female', 'details.details': { $regex: regexQuery }}, function (errFemale, countFemale) {
                cb({ male : countMale, female: countFemale });
            });
        });
    } else {
        that.count({ sex : 'male'}, function (errMale, countMale) {
            that.count({ sex : 'female'}, function (errFemale, countFemale) {
                cb({ male : countMale, female: countFemale });
            });
        });
    }
}

patientSchema.statics.age = function (query, cb) {
    var that = this;
    var regexQuery = new RegExp(query, 'i');

    // 0 - 30
    var start1 = moment().add(-30, 'y').hour(0).minute(-1).second(0);
    var end1 = moment().hour(23).minute(59).second(59);

    // 31 - 60
    var start2 = moment().add(-60, 'y').hour(0).minute(-1).second(0);
    var end2 = moment().add(-30, 'y').add(-1, 'm').hour(23).minute(59).second(59);

    // 61 - 100+
    var start3 = moment().add(-150, 'y').hour(0).minute(0).second(0);
    var end3 = moment().add(-60, 'y').add(-1, 'm').hour(23).minute(59).second(59);

    if (query) {
        that.count({"dob":{ "$gte": start1, "$lt":end1 }, 'details.details': { $regex: regexQuery }}, function(err1, count1) {
            that.count({"dob":{ "$gte": start2, "$lt":end2 }, 'details.details': { $regex: regexQuery }}, function(err2, count2) {
                that.count({"dob":{ "$gte": start3, "$lt":end3 }, 'details.details': { $regex: regexQuery }}, function(err3, count3) {
                    cb({
                        age30 : count1,
                        age60: count2,
                        age100: count3
                    });
                });
            });
        });
    } else {
        that.count({"dob":{ "$gte": start1, "$lt":end1 }}, function(err1, count1) {
            that.count({"dob":{ "$gte": start2, "$lt":end2 }}, function(err2, count2) {
                that.count({"dob":{ "$gte": start3, "$lt":end3 }}, function(err3, count3) {
                    cb({
                        age30 : count1,
                        age60: count2,
                        age100: count3
                    });
                });
            });
        });
    }

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