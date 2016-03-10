var VideoFetchService = function() {
    var _fs = require('fs'),
        _ytdl = require('ytdl-core'),
        _gify = require('gify'),
        I_TAG = 18;

    return {
        getVideoForUrl: function(videoUrl) {
            var mp4File = Date.now() + '.mp4';
            return new Promise(function(resolve) {
                var writeStream = _fs.createWriteStream(mp4File);
                writeStream.on('finish', resolve);
                _ytdl(videoUrl, {quality: I_TAG}).pipe(writeStream);
            });
        }
    };
}

module.exports = VideoFetchService;
