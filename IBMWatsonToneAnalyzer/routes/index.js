var watson = require('watson-developer-cloud');
/*
 * GET home page.
 */

exports.index = function(req, res) {
	res.render('index', {
		title : 'Express'
	});
};

var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');

var tone_analyzer = new ToneAnalyzerV3({
	username : '977db511-4b58-4f44-9a6c-cb5df2bc15a1',
	password : 'cuxQCNC3fO7p',
	version_date : '2016-05-19'
});

tone_analyzer.tone({
	text : 'Greetings from Watson Developer Cloud!'
}, function(err, tone) {
	if (err) {
		console.log(err);
	} else {
		console.log(JSON.stringify(tone, null, 2));
	}
});