'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var contentSchema = new Schema({
    tags: [String],
    contents: [String]
});