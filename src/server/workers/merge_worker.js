var _childProcess = require('child_process'),
    _path = require('path'),
    _tmp = require('tmp'),
    _s3Client = require('s3_client');

require('util/workman').Worker(function(job, onCompletion) {
    if (job.file1) {
        _doMerge(job.file1, job.file2, job.nodeId, onCompletion);
    }
    else {
        _fetchData(job.key, job.bucket, job.nodeId, onCompletion);
    }
}, process);

function _doMerge(file1, file2, nodeId, complete) {
    var mergedFileName = _tmp.tmpNameSync({
        dir: _path.resolve('./tmp/'),
        prefix: 'merged-',
        postfix: '.webm'
    }),
        ffmpeg = _childProcess.spawn('ffmpeg', [
        '-f', 'concat',
        '-i', '<(echo -e \"file \'' + file1 + '\'\\nfile \'' + file2 + '\'\")',
        '-c', 'copy',
        '-y', mergedFileName])
    ]);
    ffmpeg.on('close', function() {
        _fs.unlink(file1, function(err) {
            console.error('Error deleting file ' + file1 + ': ' + err);
        });

        _fs.unlink(file2, function(err) {
            console.error('Error deleting file ' + file2 + ': ' + err);
        })
        complete({file: mergedFileName, nodeId: nodeId});
    });
}

function _fetchData(key, bucket, nodeId, complete) {
    var completionHandler = function(data) {
        var tempFileName = _tmp.tmpNameSync({
            dir: _path.resolve('./tmp/'),
            prefix: 'temp-',
            postfix: '.webm'
        });
        data.createReadStream().pipe(_fs.createWriteStream(tempFileName));
        complete({file: tempFileName, nodeId: nodeId});
    };
    _s3Client.getFromBucket(key, bucket, completionHandler);
}
