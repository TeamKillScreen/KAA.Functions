var https = require('https');

module.exports = function (context, req) {
    context.log('Starting...');
    
	var filePath = req.FilePath;
	var personId = req.personId;
	var fileUrl = process.env.StorageUri + filePath;
	
	context.log('File: ', filePath);
    context.log('Url: ', fileUrl);
	
	var cognitiveServicePath = "/face/v1.0/facelists/missingpersons/persistedFaces/" + req.persistedFaceId;
	var ocpApimSubscriptionKey = process.env.OcpApimSubscriptionKey;
	
	context.log('Service Url', process.env.CognitiveServiceUri);
	context.log('Path: ', cognitiveServicePath);
	
	// An object of options to indicate where to post to
	var post_options = {
		host: process.env.CognitiveServiceUri,
		port: '443',
		path: cognitiveServicePath,
		method: 'DELETE',
		headers: {
			'Ocp-Apim-Subscription-Key' : ocpApimSubscriptionKey
		}
	};
	
	var body = ''
	// Set up the request
	var post_req = https.request(post_options, function(res) {
		res.setEncoding('utf8');
		
		res.on('data', function (chunk) {
			body += chunk;
		});
		
		res.on('end', function () {
    		context.log(body);
			context.log('Deleted persistedFaceId', req.persistedFaceId);
			context.done();
  		});
	});
	
	post_req.on('error', function(e) {
		context.log('problem with request: ' + e.message);
		context.done();
	});
	
	// post the data
	post_req.write(null);
	post_req.end();
};