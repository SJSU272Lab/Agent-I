/* jslint node: true */
'use strict';

var async = require('async');
var config = require('../config.json');
var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
var toneAnalyzer = new ToneAnalyzerV3({
  username : config.toneAnalyzer.username,
  password : config.toneAnalyzer.password,
  version_date : '2016-05-19'
});
var watson = require('watson-developer-cloud');
var natural_language_classifier = watson.natural_language_classifier({
  username:  config.nlp.username,
  password: config.nlp.password,
  version: 'v1'
});
var mongo         = require("./mongo");
var mongoConn;
mongo.connect(config.mongoURL, function(db){
  mongoConn = db;
  console.log('Connected to mongo at: ' + config.mongoURL);
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
    
    var order = results[0];
    var emotionTones = results[1][0].document_tone.tone_categories[0].tones;
    var overallTone = getOverallTone(emotionTones);
    var queryCategory = results[2];

    generateResponses(order, emotionTones, overallTone, queryCategory, sendResponse);
  });
};

function extractCustomerInfo(email, callback) {
  var orderIdPattern = /\d{4}-\d{7}-\d{7}/i;
  var results = email.match(orderIdPattern);
  if(results != null && results.length >0)
    getOrder(results[0], function (err,data) {
      if(err) console.log(err);
      callback(err, data);
    });
  else
    callback(false, null);
}
function getOrder(id, callback) {
  var collection = mongoConn.collection("orders");
  //mongodb call
  collection.findOne({ orderId : id}, function (err, order) {
    if(err)
      callback(err, null)
    else
      callback(null, order);
  });

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
  natural_language_classifier.classify({
        text: email,
        classifier_id: 'd67c62x139-nlc-342' },
      function(err, response) {
        if(err){
          console.log('analyzeQuery error:', err);
          callback(err, null);
        }
        else
          callback(null, snakeCase(response.classes[0].class_name));
      });
}
function snakeCase(class_name){
  var emailClass;
  switch (class_name){
    case "Returns Information":
      emailClass = "returns_information";
      break;
    case "Returns Status":
      emailClass = "returns_status";
      break;
    case "Damaged Order":
      emailClass = "damaged_order";
      break;
    case "Refunds Information":
      emailClass = "refunds_information";
      break;
    case "Refund Status":
      emailClass = "refund_status";
      break;
    case "Delivery Status":
      emailClass = "delivered_status";
      break;
    case "Cancel Order":
      emailClass = "cancel_order";
      break;
    case "Payment Issues":
      emailClass = "payment_issues";
      break;
    case "Missing Order":
      emailClass = "missing_order";
      break;
  }
  return emailClass;
}
function generateResponses(order, emotionTones, overallTone, queryCategory, sendResponse) {
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