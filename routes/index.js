"use strict";

var fs = require('fs');
var util = require('util');

module.exports = function(app){

  var fakeData = require( __dirname + '/../public/data.json');

  app.get('/', function(req, res) {
    return res.render('index');    
  });

  app.get (
    '/data/:slug', 
    function(req, res) {
      res.writeHead(200, {'Content-Type': 'application/json' });
      res.end(JSON.stringify(fakeData));
    });

};
