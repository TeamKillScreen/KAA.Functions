module.exports = function (context, myBlob) {
    context.log('Starting...');
    //context.log('Context: ', context);
    context.log('File: ', context.bindingData.blobTrigger);
    context.log('Url: ', process.env.StorageUri + context.bindingData.blobTrigger);
    //context.log('Node.js blob trigger function processed blob:', myBlob);
    context.done();
};