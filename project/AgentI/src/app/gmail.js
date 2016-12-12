
var fs = require('fs');
var readline = require('readline');

var config = require('../config.json');

var google = require('googleapis');
var gmail = google.gmail(config.gmail.version); 

var googleAuth = require('google-auth-library');
var base64url = require('base64url');

var AgentI = require('./agent-i');

var SCOPES = [
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.readonly'
];
var TOKEN_PATH = __dirname + '/' + config.gmail.tokenFolder + '/gmail-token.json';

exports.generateDrafts = function(excludedMessages, callback) {
  checkCredentials(function(auth) {
    callback();
    getMessageList(excludedMessages, auth);
  });
};

function checkCredentials(callback) {
  fs.readFile(__dirname + '/' + config.gmail.clientSecret, function processClientSecrets(err, content) {
    if (err) {
      console.log('Error loading client secret file:', err);
      return;
    }
    authorize(JSON.parse(content), callback);
  });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * 
 * @param {Object}
 *            credentials The authorization client credentials.
 * @param {function}
 *            callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) getNewToken(oauth2Client, callback);
    else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * 
 * @param {google.auth.OAuth2}
 *            oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback}
 *            callback The callback to call with the authorized client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url:\n', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      try {
        var lastSubdir = TOKEN_PATH.lastIndexOf('/');
        if (lastSubdir > -1) {
          var dir = TOKEN_PATH.substring(0, lastSubdir);
          fs.mkdirSync(dir);
        }
      } catch (e) {
        if (e.code != 'EEXIST') throw e;
      }

      fs.writeFile(TOKEN_PATH, JSON.stringify(token));
      callback(oauth2Client);
    });
  });
}

function getMessageList(excludedMessages, auth) {
  var data = {
    auth : auth,
    userId: config.gmail.userId,
    labelIds : ['UNREAD','CATEGORY_PERSONAL'],
    media: { mimeType: 'message/rfc822' }
  };
                      
  gmail.users.messages.list(data, function(err, list) {
    var messages = list.messages;
    if (!messages) return;

    var readMessages = excludedMessages;
    messages.forEach(function(message) {
      if (!readMessages.has(message.id)) {
        getMessage(message, auth);
        readMessages.add(message.id);
      }
    });
  });
}

function getMessage(email, auth) {
  var data = {
    auth : auth,
    userId: config.gmail.userId,
    format : 'full',
    id: email.id,
    media: { mimeType: 'message/rfc822' }
  };
  
  gmail.users.messages.get(data, function(err, res) {
    if (err) {
      console.log(err);
      return;
    }

    var parts = res.payload.parts;
    if (!parts) {
      console.log('No message body found for email', email.id);
      return;
    }

    var message;
    for (var i = 0; i <= parts.length; ++i) {
      message = parts[i];
      if (message.mimeType === 'text/plain') break;
    }

    if (!message) {
      console.log('Email contains no plain text.');
      return;
    }

    AgentI.analyze(base64url.decode(message.body.data), function(err, template) {
      if (err) {
        console.log(err);
        return;
      }

      var draftTo;
      var draftSubject;
      var draftReplyToMessageId;
      var headers = res.payload.headers;
      if (!headers) {
        console.log('Email has no header.');
        return;
      }

      var header;
      for (var i = 0; i < headers.length; ++i) {
        if (draftTo && draftSubject && draftReplyToMessageId) break;

        header = headers[i];
        if (header.name === 'From') draftTo = header.value;
        else if (header.name === 'Subject') draftSubject = header.value;
        else if (header.name === 'Message-ID') draftReplyToMessageId = header.value;
      }

      var draft = [];
      draft.push('In-Reply-To: ' + draftReplyToMessageId);
      draft.push('References: ' + draftReplyToMessageId);
      draft.push('Subject: ' + draftSubject);
      draft.push('From: ' + config.gmail.email);
      draft.push('To: ' + draftTo);
      draft.push('Content-type: text/html;charset=iso-8859-1');
      draft.push(template);
      var data = {
        auth : auth,    
        userId: config.gmail.userId,
        resource: {
          message: {
            threadId : res.threadId,
            raw: base64url.encode(draft.join('\n'))
          }
        }
      };

      gmail.users.drafts.create(data, function(err, result) {
        if (err) console.log(err);
        else console.log(result);           
      });
    });
  });
}