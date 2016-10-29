module.exports = function (context, myBlob) {
    context.log('Starting...');
    context.log('File: ', context.bindingData.blobTrigger);
    context.log('Url: ', process.env.StorageUri + context.bindingData.blobTrigger);
	context.log('Complete.');
    context.done();
};