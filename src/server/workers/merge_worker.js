var _childProcess = require('child_process'),
    _path = require('path'),
    _tmp = require('tmp'),
    _s3Client = require('services/s3_client'),
    _fs = require('fs'),
    _os = require('os');

require('util/workman').Worker(function(job, onCompletion) {
    if (job.file1) {
        console.log("Process PID#" + process.pid + " merging.");
        _doMerge(job.file1, job.file2, job.nodeId, onCompletion);
    }
    else {
        console.log("Process PID#" + process.pid + " fetching.");
        _fetchData(job.key, job.bucket, job.nodeId, onCompletion);
        //_fetchButts(job.butt, job.nodeId, onCompletion);
    }
}, process);

function _doMerge(file1, file2, nodeId, complete) {
    var mergedFileName = _tmp.tmpNameSync({
            dir: _path.resolve('./tmp/'),
            prefix: 'merged-',
            postfix: '.webm'
        }),
        manifest = _tmp.tmpNameSync({
            dir: _path.resolve('./tmp/')
        }),
        printFileDeletionErrors = function(err, file) {
            if (err) {
                console.error('Error deleting file ' + file + ': ' + err);
            }
        };
    _fs.writeFile(manifest, "file '" + file1 + "'" + _os.EOL + "file '" + file2 + "'");

    console.log("Merging " + file1 + " + " + file2 + " to " + mergedFileName);

    var ffmpeg = _childProcess.spawn('ffmpeg', [
        '-hide_banner',
        '-loglevel', 'panic',
        '-f', 'concat',
        '-i', manifest,
        '-c', 'copy',
        '-y', mergedFileName
    ]);

    ffmpeg.stderr.setEncoding('utf8');
    ffmpeg.stderr.on('data', function(data) {
        console.log(data);
    });

    ffmpeg.on('error', function(err) {
        console.error("Spawn error:" + err);
    });

    ffmpeg.on('close', function(exitCode) {
        if (exitCode === 0) {
            _fs.unlink(file1, function(err) {
                printFileDeletionErrors(err, file1);
            });

            _fs.unlink(file2, function(err) {
                printFileDeletionErrors(err, file2);
            });

            _fs.unlink(manifest, function(err) {
                printFileDeletionErrors(err, manifest);
            });
            complete({file: mergedFileName, nodeId: nodeId});
        }
        else {
            console.error("Spawned process exited with code: " + exitCode);
        }
    });
}

function _fetchData(key, bucket, nodeId, complete) {
        // TODO: (wbjacks) log error?
        var tempFileName = _tmp.tmpNameSync({
            dir: _path.resolve('./tmp/'),
            prefix: 'temp-',
            postfix: '.webm'
        });
        var s3DataStream = _s3Client.getStreamFromBucket(key, bucket);
        s3DataStream.on('finish', function() {
            complete({file: tempFileName, nodeId: nodeId});
        });
        s3DataStream.pipe(_fs.createWriteStream(tempFileName));
}

function _fetchButts(butt, nodeId, onCompletion) {
    var tempFileName = _tmp.tmpNameSync({
        dir: _path.resolve('./tmp/'),
        prefix: 'temp-',
        postfix: '.webm'
    });
    _fs.createReadStream(butt).pipe(_fs.createWriteStream(tempFileName));
    onCompletion({file: tempFileName, nodeId: nodeId});
}
