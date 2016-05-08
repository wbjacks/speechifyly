'use strict';

var _tmp = require('tmp'),
    _childProcess = require('child_process'),
    _sinon = require('sinon'),
    _fs = require('fs'),
    _os = require('os'),
    _s3Client = require('services/s3_client'),
    _assert = require('chai').assert,
    rewire = require('rewire'), _mergeWorker = rewire('workers/merge_worker'),
    BaseEmitter = require('events');

// A worker is an EventEmitter, and faking it allows testing through the
// messaging API
class FakeEmitter extends BaseEmitter {}

describe('MergeWorker', function() {
    describe('Private function _doMerge', function() {
        var tmpMock, childProcessMock, fsMock;
        before(function() {
            tmpMock = _sinon.mock(_tmp);
            childProcessMock = _sinon.mock(_childProcess);
            fsMock = _sinon.mock(_fs);
        });

        after(function() {
            tmpMock.verify();
            fsMock.verify();
            childProcessMock.verify();

            tmpMock.restore();
            fsMock.restore();
            childProcessMock.restore();
        });

        it('Should create two new files, delete input files and one created file, and ' +
            ' launch a child process', function()
        {
            var ffmpegWorker = new FakeEmitter();
            tmpMock.expects('tmpNameSync')
                .twice()
                .returns('foo');
            fsMock.expects('writeFile')
                .withExactArgs('foo', "file 'bar'" + _os.EOL + "file 'baz'")
                .once();
            childProcessMock.expects('spawn')
                .withExactArgs('ffmpeg', ['-f', 'concat', '-i', 'foo', '-c', 'copy',
                    '-y', 'foo'])
                .once()
                .returns(ffmpegWorker);
            fsMock.expects('unlink')
                .withArgs('bar')
                .once();
            fsMock.expects('unlink')
                .withArgs('baz')
                .once();
            fsMock.expects('unlink')
                .withArgs('foo')
                .once();
            _mergeWorker.__get__('_doMerge')('bar', 'baz', 0, function() {});
            ffmpegWorker.emit('close', 0);
        });
    });

    describe('Private function _fetchData', function() {
        var s3ClientMock, fsMock, readStreamMock, tmpMock, s3DataMock, mockS3Data;

        var dummyS3Data = {
                createReadStream: function() {}
            },
            dummyReadStream = {
                pipe: function() {}
            }

        beforeEach(function() {
            fsMock = _sinon.mock(_fs);
            s3ClientMock = _sinon.mock(_s3Client);
            s3DataMock = _sinon.mock(dummyS3Data);
            readStreamMock = _sinon.mock(dummyReadStream);
            tmpMock = _sinon.mock(_tmp);
        });

        afterEach(function() {
            s3ClientMock.verify();
            tmpMock.verify();
            s3DataMock.verify();
            readStreamMock.verify();
            fsMock.verify();

            s3ClientMock.restore();
            fsMock.restore();
            s3DataMock.restore();
            readStreamMock.restore();
            tmpMock.restore();
        });

        it('should fetch from s3 and create a file for the data in a callback',
            function(){
                s3ClientMock.expects('getFromBucket')
                    .withArgs('foo', 'bar')
                    .once()
                    .callsArgWith(2, dummyS3Data);
                tmpMock.expects('tmpNameSync')
                    .once()
                    .returns('tmpFileName');
                s3DataMock.expects('createReadStream')
                    .once()
                    .returns(dummyReadStream);
                readStreamMock.expects('pipe')
                    .once();
                fsMock.expects('createWriteStream')
                    .withExactArgs('tmpFileName')
                    .once();

                var completionSpy = _sinon.spy();
                _mergeWorker.__get__('_fetchData')('foo', 'bar', 0, completionSpy);
                _assert.isTrue(completionSpy.calledOnce);
            });
    });
});
