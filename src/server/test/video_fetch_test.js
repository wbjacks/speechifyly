var _assert  = require('chai').assert,
    _sinon = require('sinon'),
    _fs = require('fs'),
    _proxyquire = require('proxyquire');

var ytdlStub = function() {
    return fs.createReadStream('../resources/fixture/test_vid.mp4')
};

var videoFetchService = _proxyquire('../services/video_fetch_service', {'ytdl-core': ytdlStub}),
    test_vid = _fs.readFileSync('./src/server/resources/fixture/test_vid.mp4', 'utf-8');

_assert.equal(test_vid, 'test video');


describe('Video Downloader', function() {
    it('should download a video from a youtube URL', function() {
        var DUMMY_URL = "video_fetch_result_video";
        videoFetchService.getVideoForUrl(DUMMY_URL).then(function(file) {
            _assert.deepEqual(fs.readFileSync(file), test_vid);

           }).catch(function(error) {
                throw error;
            });
    });
});
