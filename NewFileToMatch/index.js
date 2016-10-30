var https = require('https');

module.exports = function (context, req) {
    context.log('Starting...');
    
	var filePath = req.FilePath;
	var fileUrl = process.env.StorageUri + filePath;
	
	context.log('File: ', filePath);
    context.log('Url: ', fileUrl);
	
	var cognitiveServicePath = "/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=false";
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
			
			matchFaces(context, body, filePath);
			
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
};

function matchFaces(context, body, filePath)
{
	var jsonObject = JSON.parse(body);
	context.log('Matched number of faces:' + jsonObject.length);
	
	jsonObject.forEach(function(face) {
		matchFace(context, face, filePath);
	}, this);
}

function matchFace(context, face, filePath)
{
	context.log('Trying to match face: ', face);
	
	var cognitiveServicePath = "/face/v1.0/findsimilars";
	var ocpApimSubscriptionKey = process.env.OcpApimSubscriptionKey;
	
	var post_data = JSON.stringify({
    	faceId: face.faceId,
		faceListId: "missingpersons",
		maxNumOfCandidatesReturned: 10,
    	mode: "matchPerson"
	})
	
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
    		context.log('Face match response: ', body);
			
			linkFaceWithPersistedFace(context, body, filePath, face);
  		});
	});
	
	post_req.on('error', function(e) {
		context.log('problem with request: ' + e.message);
	});
	
	// post the data
	post_req.write(post_data);
	post_req.end();
}

function linkFaceWithPersistedFace(context, body, filePath, face)
{
	var jsonObject = JSON.parse(body);
	context.log('Number of persisted faces matched:' + jsonObject.length);
	
	jsonObject.forEach(function(persistedFace) {
		relateFaceWithPersistedFace(context, face, filePath, persistedFace);
	}, this);
}

function relateFaceWithPersistedFace(context, face, filePath, persistedFace)
{
	var path = "/api/relatefacetomugshot";
	
	var post_data = JSON.stringify({
		persistedFaceId: persistedFace.persistedFaceId,
		confidence: persistedFace.confidence,
		filePath: filePath,
		faceId: face.faceId,
		faceRectangle: face.faceRectangle
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
  		});
	});
	
	post_req.on('error', function(e) {
		context.log('problem with request: ' + e.message);
	});
	
	// post the data
	post_req.write(post_data);
	post_req.end();
}