var container = require('./container.js');
var DUMMY_URL = 'https://www.youtube.com/watch?v=RDrfE9I8_hs';
function main() {
    container.get('videoFetchService').getGifForVideoSegment(DUMMY_URL, {
        start: 30,
        duration: 2
    }).then(function(file) {
        console.log('File available at ' + file);
    }).catch(function(error) {
        throw error;
    });
}

main();
