var _assert  = require('chai').assert;

var sinon = require('sinon');
var fs = require('fs');

var ytdlStub = function(){return fs.createReadStream('../resources/fixture/test_vid.mp4')};
var proxyquire = require('proxyquire');

// var videoFetchService = require('../services/video_fetch_service');
var videoFetchService = proxyquire('../services/video_fetch_service', {'ytdl-core': ytdlStub});
var test_vid = fs.readFileSync('../resources/fixture/test_vid.mp4', 'utf-8');
_assert.equal(test_vid, 'test video');



var DUMMY_URL = "video_fetch_result_video";




describe('Video Downloader', function() {
	it('should download a video from a youtube URL', function() {
	  

		videoFetchService.getVideoForUrl(DUMMY_URL).then(function(file) {
			console.log(file);
			_assert.deepEqual(fs.readFileSync(file), test_vid);

		   }).catch(function(error) {
		        throw error;
		    });



	});
});