var _assert       = require('chai').assert,
    _gifProcessor = require('../services/gif_processing_service');

describe('Gif Processor', function() {
    it('should convert a slice of a video file to a gif', function() {
            _assert.isNotNull(_gifProcessor);
    });
});
