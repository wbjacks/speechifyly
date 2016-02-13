var container = require('kontainer-di'),
    videoFetchService = require('./services/video_fetch_service.js'),
    gifProcessingService = require('./services/gif_processing_service.js');

// Services
container.register('videoFetchService', [], videoFetchService);
container.register('gifProcessingService', [], gifProcessingService);

module.exports = container;
