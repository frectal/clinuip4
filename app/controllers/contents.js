'use strict';

var express = require('express'),
    Content = require('../models').Content;

var Contents = function Contents(passport) {

    if (!(this instanceof Contents)) {
        return new Contents(passport);
    }

    this.router = express.Router();
    this.passport = passport === undefined ? function (req, res, next) { next(); } : passport;

    this.router.use(function (req, res, next) {
        next();
    });

    this.router.use(this.passport);

    this.router.get('/', function (req, res) {

        Content
            .find()
            .exec(function(err, data) {
                res.json(data);
            });


    });

    this.router.post('/', function (req, res) {
        if (req.body._id) {
            Content
                .findOne({'_id': req.body._id})
                .exec(function (err, data) {
                    if (data) {
                        data.tag = req.body.tag;
                        data.contents = req.body.contents;
                        data.save(function () {
                            res.json(data);
                        });
                    }
                });
        } else {
            var newContent = new Content(req.body);
            newContent.save(function (err, content) {
                res.json(content);
            });
        }
    });

    this.router.delete('/', function (req, res) {
        Content.find({ _id: req.param('_id') }).remove().exec(function(){
            res.json(true);
        });
    });
};

module.exports = Contents;