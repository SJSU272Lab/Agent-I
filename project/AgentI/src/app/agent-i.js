/* jslint node: true */
'use strict';

var async = require('async');
var ejs = require('ejs');
var fs = require('fs');

var config = require('../config.json');
var mongo = require("./mongo");

var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
var toneAnalyzer = new ToneAnalyzerV3({
  username : config.toneAnalyzer.username,
  password : config.toneAnalyzer.password,
  version_date : config.toneAnalyzer.version
});

var watson = require('watson-developer-cloud');
var natural_language_classifier = watson.natural_language_classifier({
  username:  config.nlp.username,
  password: config.nlp.password,
  version: config.nlp.version
});
 
exports.analyze = function(email, sendResponse) {
  async.parallel([
    function(callback) {
      extractOrderInfo(email, callback);
    },
    function(callback) {
      analyzeTone(email, callback);
    },
    function(callback) {
      analyzeQuery(email, callback);
    }
  ], function(err, results) {
    if (err) {
      sendResponse(err);
      return;
    }

    var order = results[0];

    var overallTone = getOverallTone(results[1][0].document_tone.tone_categories[0].tones);

    var queryCategory = results[2];

    var response = generateResponse(order, overallTone, queryCategory);

    sendResponse(null, response);
  });
};

function extractOrderInfo(email, callback) {
  var orderIdPattern = /\d{4}-\d{7}-\d{7}/i;
  var results = email.match(orderIdPattern);
  if (results && results.length > 0) {
    getOrder(results[0], function (err, data) {
      if (err) {
        console.log(err);
        callback(err);
      } else callback(null, data);
    });
  }
  else callback('Could not retrieve order information.', null);
}

function getOrder(id, callback) {
  mongo.connect(config.mongoURL, function(db) {
    var collection = db.collection('orders', { connectTimeoutMS: 3000 });
    collection.findOne({ orderId : id }, function (err, order) {
      if (err) callback(err);
      else callback(null, order);
    });
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
    classifier_id: config.nlp.classifierId
  }, function(err, response) {
    if (err) {
      console.log('analyzeQuery error:', err);
      callback(err, null);
    }
    else
      callback(null, kebabCase(response.classes[0].class_name));
  });
}

function kebabCase(naturalStr) {
  return naturalStr.toLowerCase().replace(' ', '-');
}

function generateResponse(order, overallTone, queryCategory, callback) {
  var templateFile = getTemplateFile(queryCategory, overallTone);
  var html = ejs.render(fs.readFileSync(templateFile, 'utf8'), { order: order });
  return html;
}

function getTemplateFile(queryCategory, tone) {
  var templatePath = __dirname + '/' + config.templateFolder;
  
  // Could do binary search here but not worth it yet...
  var catPath = '';
  var catFolder = '';
  var catFolders = fs.readdirSync(templatePath);
  for (var i = 0; i < catFolders.length; ++i) {
    catFolder = catFolders[i];
    if (catFolder === queryCategory) {
      catPath = templatePath + '/' + catFolder;
      break;
    }
  }

  // Could do binary search here but not worth it yet...
  var templateFile = '';
  var toneFile = '';
  var toneFiles = fs.readdirSync(catPath);
  for (i = 0; i < toneFiles.length; ++i) {
    toneFile = toneFiles[i];
    if (toneFile.substr(0, toneFile.lastIndexOf('.')) === tone) {
      templateFile = catPath + '/' + toneFile;
      break;
    }
  }

  return templateFile;
}