/* jslint node: true */
'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var AppController = require('./app/controller');
var CronJob = require('cron').CronJob;
var gmail = require ('./app/gmail');


var api = express();
api.use(bodyParser.json());
api.post('/email/analyze', AppController.analyzeEmail);

var PORT = 5000;
api.listen(PORT, function() {
  console.log('AgentI listening on port ' + PORT);
});

gmail.generateDrafts(function(err) {
  if (!err) {
    console.log('Polling for customer emails...');
    new CronJob(
      '*/30 * * * * *',
      gmail.generateDrafts,
      function(err) {},
      true,
      'America/Los_Angeles'
    );
  }
});

module.exports = api;