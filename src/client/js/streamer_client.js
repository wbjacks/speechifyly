var MediaSourceElementWrapper = require('mediasource'),
    _socketIoStream = require('socket.io-stream'),
    _socketIo = require('socket.io-client');

$(document).ready(function() {
    var socket = _socketIo.connect('http://localhost:3000/stream'),
        elem = document.getElementById('v'),
        mediaSource = new MediaSourceElementWrapper(elem),
        mediaWritableStream = mediaSource.createWriteStream('video/webm; codecs="vorbis, vp8"'),
        stream = _socketIoStream.createStream();

    elem.addEventListener('error', function () {
        // listen for errors on the video/audio element directly
        console.error("Error on stream: " + mediaSource.detailedError);
    })

    _socketIoStream(socket).emit('STREAM_VIDEO', stream);
    stream.pipe(mediaWritableStream);
});
