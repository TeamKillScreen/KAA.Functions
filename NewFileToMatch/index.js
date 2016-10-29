var querystring = require('querystring');
var http = require('http');

module.exports = function (context, req) {
    context.log('Starting...');
    
	var filePath = req.FilePath;
	var fileUrl = process.env.StorageUri + filePath;
	
	context.log('File: ', filePath);
    context.log('Url: ', fileUrl);
	
	var cognitiveServicePath =  + "/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=false"
	var ocpApimSubscriptionKey = process.env.OcpApimSubscriptionKey;
	
	var post_data = querystring.stringify({
		"url":fileUrl
	});
	
	// An object of options to indicate where to post to
	var post_options = {
		host: process.env.CognitiveServiceUri,
		port: '443',
		path: cognitiveServicePath,
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Ocp-Apim-Subscription-Key' : ocpApimSubscriptionKey
		}
	};
	
	// Set up the request
	var post_req = http.request(post_options, function(res) {
		res.setEncoding('utf8');
		var str = ''
		res.on('data', function (chunk) {
			str += chunk;
		});
		
		res.on('end', function () {
    		context.log(str);
  		});
	});
	
	// post the data
	post_req.write(post_data);
	post_req.end();
	
	context.log('Complete.');
    context.done();
};