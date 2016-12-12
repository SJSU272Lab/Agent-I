/* jslint node: true */
'use strict';

var express       = require('express');
var bodyParser    = require('body-parser');
var AppController = require('./app/controller');
var CronJob = require('cron').CronJob;


var api = express();
api.use(bodyParser.json());
api.post('/email/analyze', AppController.analyzeEmail);

var PORT = 5000;
api.listen(PORT, function() {
  console.log('AgentI listening on port ' + PORT);
});


new  CronJob('*/5 * * * * *', qs.checkCredentials, null, true, 'America/Los_Angeles');


module.exports = api;