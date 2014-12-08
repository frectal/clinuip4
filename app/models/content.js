'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var contentSchema = new Schema({
    name: String,
    tags: [String],
    contents: [String]
});

module.exports = mongoose.model('Content', contentSchema);