'use strict';

var _ = require('underscore'),
    express = require('express'),
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

    this.router.get('/tags', function (req, res) {
        Content
            .find()
            .distinct('tags', function(error, tags) {
                res.json(tags);
            });
    });

    this.router.get('/contents/:tag', function (req, res) {
        Content
            .find({ 'tags' : req.params.tag })
            .select('contents')
            .exec(function(err, data) {
                var contentsStr = [];
                _.each(data, function (item) {
                    _.each(item.contents, function (c) {
                        contentsStr.push(c);
                    });
                });

                res.json(contentsStr);
            });
    });

    this.router.post('/', function (req, res) {
        if (req.body._id) {
            Content
                .findOne({'_id': req.body._id})
                .exec(function (err, data) {
                    if (data) {
                        data.name = req.body.name;
                        data.tags= req.body.tags;
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