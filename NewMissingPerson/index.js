var https = require('https');

module.exports = function (context, req) {
    context.log('Starting...');
    
	var filePath = req.FilePath;
	var personId = req.personId;
	var fileUrl = process.env.StorageUri + filePath;
	
	context.log('File: ', filePath);
    context.log('Url: ', fileUrl);
	
	var cognitiveServicePath = "/face/v1.0/facelists/missingpersons/persistedFaces";
	var ocpApimSubscriptionKey = process.env.OcpApimSubscriptionKey;
	
	var post_data = JSON.stringify({
    	url: fileUrl
	})
	
	context.log('Service Url', process.env.CognitiveServiceUri);
	context.log('Path: ', cognitiveServicePath);
	context.log('Post Data: ', post_data);
	
	// An object of options to indicate where to post to
	var post_options = {
		host: process.env.CognitiveServiceUri,
		port: '443',
		path: cognitiveServicePath,
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Ocp-Apim-Subscription-Key' : ocpApimSubscriptionKey,
			'Content-Length': Buffer.byteLength(post_data),
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
			updatePerson(context, body, personId, filePath);
  		});
	});
	
	post_req.on('error', function(e) {
		context.log('problem with request: ' + e.message);
		context.done();
	});
	
	// post the data
	post_req.write(post_data);
	post_req.end();
};

function updatePerson(context, data, personId, filePath)
{
	var path = "/api/relatemugshot";
	
	var post_data = JSON.stringify({
    	personId: personId,
		persistedFaceId: data.persistedFaceId,
		filePath: filePath
	})
	
	context.log('KAA API Service Url', process.env.KAAApi);
	context.log('PUT Path: ', path);
	context.log('PUT Data: ', post_data);
	
	// An object of options to indicate where to post to
	var post_options = {
		host: process.env.KAAApi,
		port: '443',
		path: path,
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			'Content-Length': Buffer.byteLength(post_data),
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
			context.log('Complete.');
    		context.done();
  		});
	});
	
	post_req.on('error', function(e) {
		context.log('problem with request: ' + e.message);
		context.done();
	});
	
	// post the data
	post_req.write(post_data);
	post_req.end();
}