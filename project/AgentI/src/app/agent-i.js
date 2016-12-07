/* jslint node: true */
'use strict';

var async = require('async');

var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
var toneAnalyzer = new ToneAnalyzerV3({
  username : '977db511-4b58-4f44-9a6c-cb5df2bc15a1',
  password : 'cuxQCNC3fO7p',
  version_date : '2016-05-19'
});

 
exports.analyze = function(email, sendResponse) {
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
    if (err) sendResponse(err);
    
    var customer = results[0];

    var emotionTones = results[1][0].document_tone.tone_categories[0].tones;
    var overallTone = getOverallTone(emotionTones);

    var queryCategory = results[2];

    generateResponses(customer, emotionTones, overallTone, queryCategory, sendResponse);
  });
};

function extractCustomerInfo(email, callback) {
  var customer = {};
  callback(null, customer);
}

function analyzeTone(email, callback) {
  toneAnalyzer.tone({
    text: email,
    tones: 'emotion',
    sentences: false
  }, callback);
}

function getOverallTone(emotionTones) {
  var max = null;

  emotionTones.forEach(function(tone) {
    if (!max || max.score < tone.score) max = tone;
  });

  return max.tone_id;
}

function analyzeQuery(email, callback) {
  var queryCategory = 'refunds';
  callback(null, queryCategory);
}

function generateResponses(customer, emotionTones, overallTone, queryCategory, sendResponse) {
  var response = {
    tones: emotionTones,
    overallTone: overallTone,
    templates: [
      '',
      ''
    ]
  };

  sendResponse(null, response);
}