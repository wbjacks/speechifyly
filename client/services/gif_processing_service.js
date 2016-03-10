var GifProcessingService = function() {
    var _gifsicle = require('gifsicle');

    return {
        convertVideoToGif(filePath, timeSegment) {
            var gifFile = Date.now() + '.gif';
            return new Promise(function(resolve, reject) {
                _gify(filePath, gifFile, timeSegment, function(err) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        _fs.unlink(filePath, function(err) {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(gifFile);
                            }
                        });
                    }
                });
            });
        },

        appendGif: function(source, gifToAppend) {
        }
    };
}
module.exports = GifProcessingService;
