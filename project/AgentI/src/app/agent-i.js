/* jslint node: true */
'use strict';

var async = require('async');
var fs = require('fs');

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

    var overallTone = getOverallTone(results[1][0].document_tone.tone_categories[0].tones);

    var queryCategory = results[2];

    var response = generateResponse(customer, overallTone, queryCategory);

    sendResponse(null, response);
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
  var queryCategory = 'cancel_order';
  callback(null, queryCategory);
}

function generateResponse(customer, overallTone, queryCategory) {
  var templateFiles = {
    cancel_order: 'cancel-order.json',
    damaged_order: 'damaged-order.json',
    delivery_status: 'delivery-status.json',
    missing_order: 'missing-order.json',
    payment_issues: 'payment-issues.json',
    refund_status: 'refund-status.json',
    refunds_information: 'refunds-information.json',
    returns_information: 'returns-information.json',
    returns_status: 'returns-status.json'
  };

  var templateFile = templateFiles[queryCategory];
  return render(templateFile, customer, overallTone);
}

function render(templateFile, customer, tone) {
  var templatePath = __dirname + '/templates/' + templateFile;
  var template = JSON.parse(fs.readFileSync(templatePath, 'utf8'))[tone];
  return template;
}