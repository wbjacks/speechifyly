var container = require('./container.js');

function main() {
    console.log(container.get('videoFetchService'));
    console.log(container.get('gifProcessingService'));
}

main();
