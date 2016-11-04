/* jslint node: true */
'use strict';

var async = require('async');

 
exports.analyze = function(email, sendResponses) {
  async.parallel([
    function(callback) {
      extractCustomerInfo(email, callback);
    },
    function(callback) {
      analyzeTone(email, callback);
    },
    function(callback) {
      analyzeQuery(email, callback);
    }
  ], function(err, results) {
    if (err) sendResponses(err);
    
    var customer = results[0];
    var tones = results[1];
    var overallTone = getOverallTone(tones);
    var queryCategory = results[2];
    generateResponses(customer, overallTone, queryCategory, sendResponses);
  });
};

function extractCustomerInfo(email, callback) {
  var customer = {};
  callback(null, customer);
}

function analyzeTone(email, callback) {
  var tones = {};
  callback(null, tones);
}

function getOverallTone(tones) {
  var tone = 'happy';
  return tone;
}

function analyzeQuery(email, callback) {
  var queryCategory = 'refunds';
  callback(null, queryCategory);
}

function generateResponses(customer, overallTone, queryCategory, sendResponses) {
  var responses = [''];
  sendResponses(null, responses);
}