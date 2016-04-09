var container = require('../src/server/container.js');
var DUMMY_URL = 'https://www.youtube.com/watch?v=RDrfE9I8_hs';

function main() {
    container.get('videoFetchService').getVideoForUrl(DUMMY_URL).then(function(file) {
        container.get('gifProcessingService').convertVideoToGif(file, 
    {
        start: 30,
        duration: 2
    }).then(function(file) {
        console.log('File available at ' + file);
    }).catch(function(error) {
        throw error;
    });
});
}

main();
