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
        //_fetchData(job.key, job.bucket, job.nodeId, onCompletion);
        _fetchButts(job.butt, job.nodeId, onCompletion);
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
        });
    _fs.writeFile(manifest, "file '" + file1 + "'" + _os.EOL + "file '" + file2 + "'");

    var ffmpeg = _childProcess.spawn('ffmpeg', [
        '-f', 'concat',
        '-i', manifest,
        '-c', 'copy',
        '-y', mergedFileName
    ]);

    ffmpeg.stdout.on('data', function(data) {
        console.log("Spawn: " + data);
    });

    ffmpeg.on('close', function(exitCode) {
        if (exitCode === 0) {
            _fs.unlink(file1, function(err) {
                if (err) {
                    console.error('Error deleting file ' + file1 + ': ' + err);
                }
            });

            _fs.unlink(file2, function(err) {
                if (err) {
                    console.error('Error deleting file ' + file2 + ': ' + err);
                }
            });
            complete({file: mergedFileName, nodeId: nodeId});
        }
        else {
            console.error("Spawned process exited with code: " + exitCode);
        }
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

function _fetchButts(butt, nodeId, onCompletion) {
    var tempFileName = _tmp.tmpNameSync({
        dir: _path.resolve('./tmp/'),
        prefix: 'temp-',
        postfix: '.webm'
    });
    _fs.createReadStream(butt).pipe(_fs.createWriteStream(tempFileName));
    onCompletion({file: tempFileName, nodeId: nodeId});
}
