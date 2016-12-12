
var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var base64url = require('base64url');


// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/gmail-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly','https://mail.google.com/',
	'https://www.googleapis.com/auth/gmail.modify',
		'https://www.googleapis.com/auth/gmail.compose'];
var TOKEN_DIR =  'TOKEN_DIR/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'gmail-nodejs-quickstart.json';


// Load client secrets from a local file.



exports.checkCredentials = function(){
	fs.readFile('client_secret.json', function processClientSecrets(err, content) {
		  if (err) {
		    console.log('Error loading client secret file: ' + err);
		    return;
		  }
		  // Authorize a client with the loaded credentials, then call the
		  // Gmail API.
		  authorize(JSON.parse(content), getMessageList);
		});
};

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
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
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
  console.log('Authorize this app by visiting this url: ', authUrl);
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
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 * 
 * @param {Object}
 *            token The token to store to disk.
 */
function storeToken(token) {
  try {
	  console.log(TOKEN_DIR);
	  console.log(TOKEN_PATH);
	  fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

var gmail = google.gmail('v1'); 
var readMessages = [];

function getMessageList(auth){
	
	var data2 = {
	  auth : auth,
      userId: 'me',
      labelIds : ['UNREAD','CATEGORY_PERSONAL'],
      media: {
			mimeType: 'message/rfc822',
			}
	};
											
	gmail.users.messages.list(data2,function(err, result){
    if (!result.messages) return;

	    	for(var i=0;i<result.messages.length;i++){
	    		console.log(readMessages.indexOf(result.messages[i].id));
	    		if(readMessages.indexOf(result.messages[i].id) == -1){
		    		console.log(result.messages[i].id);
	    			readMessages.push(result.messages[i].id); 
	    
		    		console.log("got message");
		    		
		    					getMessage(result.messages[i],auth);
	    		}
	    	}
	});
}


function getMessage(mail,auth){
	
	var data3 = {
		  auth : auth,
	      userId: 'me',
	      format : 'full',
	      id: mail.id,
		  media: {
				mimeType: 'message/rfc822',
				}
		};
	
	gmail.users.messages.get(data3,function(err2,result2){
		if(err2){
			console.log(err2);
		}else{
			if(result2.payload.parts !== null){
				console.log(result2);
				var messageBody = result2.payload.parts;
				var message;
				if(messageBody !== undefined){
					for(var i=0;i<=messageBody.length;i++){
				// console.log(messageBody[i]);
				if(messageBody[i] !== undefined){
					console.log(messageBody[i]);
					if(messageBody[i].mimeType === 'text/plain'){
							message =+ base64url.decode(messageBody[i].body.data);
				    		console.log(message);
				 // call Watson Natural Language Classifier send (message) }
				    		callWatson(message,function(err,draftMsg){
				    			if(err){
				    				// do something
				    			}
				    			if(draftMsg){
				    				var sendingTo;
				    				var sendingSubject;
				    				var header = result2.payload.headers;
				    				for(var i=0;i<header.length;i++){
				    					if(header[i].name === 'From'){
				    						sendingTo = header[i].value;
				    			    		console.log(header[i].value);
				    					}
				    					if(header[i].name === 'Subject'){
				    						sendingSubject = header[i].value;
				    			    		console.log(header[i].value);
				    					}
				    				}
				    				
				    				var message = "To:"+sendingTo+"\n" +
				    				"From: agenti@gmail.com\n" +
				    				"Subject: "+sendingSubject+"\n" + "\n" + draftMsg;
				    				// Provide Watson generated draft email
						
				    				var data = {
				    						auth : auth,		
				    						userId: 'me',
				    						threadId : result2.threadId,
				    						media: {
				    						mimeType: 'message/rfc822',
				    						body: message 	
				    						}
				    					};	    		
				    				gmail.users.drafts.create(data,function(err,result3){
				    				console.log(result3);	    			
				    			});
			    			}
			    		});
					}
					}
				}			
			}
			}
		}
	});
}