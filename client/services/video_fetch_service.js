var VideoFetchService = function() {
    var _fs = require('fs'),
        _ytdl = require('ytdl-core'),
        _gify = require('gify'),
        I_TAG = 18;

    return {
        getGifForVideoSegment: function(videoUrl, timeSegment) {
            var fileTag = Date.now(),
                gifFile = fileTag+'.gif',
                mp4File = fileTag+'.mp4';
            console.log('Writing file: ' + fileTag);
            return new Promise(function(resolve, reject) {
                var writeStream = _fs.createWriteStream(mp4File);
                console.log(mp4File + ' ' + gifFile + ' ' + timeSegment.start + ' ' + timeSegment.duration);
                writeStream.on('finish', function() {
                    console.log(mp4File + ' ' + gifFile + ' ' + timeSegment.start + ' ' + timeSegment.duration);
                    _gify(mp4File, gifFile, timeSegment, function(err) {
                        // TODO: (wbjacks) more callbacks??
                        _fs.unlinkSync(mp4File);
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(gifFile);
                        }
                    });
                });
                _ytdl(videoUrl, {quality: I_TAG}).pipe(writeStream);
            });
        }
    };
}

module.exports = VideoFetchService;
