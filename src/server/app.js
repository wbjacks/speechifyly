/*
 * Module dependencies
 */
var express = require('express'),
    _db = require('services/shitdb'),
    _fs = require('fs'),
    _path = require('path'),
    _io = require('socket.io'),
    _ioStream = require('socket.io-stream'),
    _videoAssemblerService = require('services/video_assembler_service');

//get in memory map from s3 now?
var app = express();
console.log(__dirname);
app.use(express.static('./static'));
 
// Routes
// End point for sample video streaming
app.get('/foo', function(req, resp) {
    if (!req.headers.range) {
        // 416 Wrong range
        return resp.sendStatus(416);
    }
    var file = _path.resolve('./static/test_video.mp4');
    _fs.stat(file, function(err, stats) {
        if (err) {
            if (err.code === 'ENOENT') {
                // 404 Error if file not found
                return resp.sendStatus(404);
            }
            resp.end(err);
        }
        _setResponseHeadersToStreamVideo(resp, req.headers.range, stats.size);

        var stream = _fs.createReadStream(file, { start: start, end: end })
            .on("open", function() {
                stream.pipe(resp);
            }).on("error", function(err) {
                resp.end(err);
            });
    });
});

function _setResponseHeadersToStreamVideo(resp, range, totalSize) {
    var positions = range.replace(/bytes=/, "").split("-"),
        start = parseInt(positions[0], 10),
        total = stats.size,
        end = positions[1] ? parseInt(positions[1], 10) : total - 1,
        chunkSize = (end - start) + 1;

    resp.writeHead(206, {
        'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4'
    });
}

app.get('/', function (req, res) {
    res.sendFile('index.html', {root: './static'});
})

app.get('/words', function (req, res) {
    var speaker = req.query.speaker;
    var data = _db.getWordsForSpeaker(speaker);
  
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(data));
});

app.get('/speakers', function (req, res) {
    var data = _db.getAllSpeakers();
    res.setHeader('Content-Type', 'application/json');

    //use in memory map for this part?

    res.send(JSON.stringify(data));
});

app.get('/makeVideo', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    //_videoAssemblerService.makeVideo(req.query.speaker, req.query.sentence)
    _videoAssemblerService.AHHHHHHHHH()
        .then(function(fileName) {
            res.send(JSON.stringify({file: fileName}));
        });
});

// TODO: (wjackson) move out of app.js
if (!module.parent) {
    _db.loadDb(function(){
        var port = process.env.PORT || 3000,
            io = _io.listen(app.listen(port, function() {
                console.log('app listening on port ' + port);
            }));

        // Sockets
        io.of('/stream').on('connection', function(socket) {
            console.log('connected');
            _ioStream(socket).on('STREAM_VIDEO', function(req) {
                console.log('Video request for ' + req.speaker + ' to say ' + req.sentence);
                _fs.createReadStream(_path.resolve('./static/test_video.webm')).pipe(req.stream);
            });
        });
    });
}

app._getKeysForSentence = function(speaker, sentence) {
    var uniqueWords = sentence.trim().split(/\s+/).filter(function(value, index, self) {
        return self.indexOf(value) === index;
    });
    return _db.getS3KeysForWords(speaker, uniqueWords);
};

module.exports = app;
