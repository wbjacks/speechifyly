'use strict';

var _sinon = require('sinon'),
    _childProcess = require('child_process'),
    _assert = require('chai').assert,
    BaseEmitter = require('events'),
    _workman = require('util/workman');

// A worker is an EventEmitter, and faking it allows testing through the
// messaging API
class FakeEmitter extends BaseEmitter {}

describe('Manager', function() {
    var childProcessMock;
    beforeEach(function() {
        childProcessMock = _sinon.mock(_childProcess);
    });

    afterEach(function() {
        childProcessMock.verify();
        childProcessMock.restore();
    });

    describe('method launch', function() {
        it('should create numberOfWorkers workers at given filepath', function() {
            childProcessMock.expects('fork')
                .withExactArgs('foo.bar')
                .thrice()
                .returns({on: function() {}});
            _workman.getManagerInstance(3).launch('foo.bar');
        });
    });

    describe('method addJob', function() {
        it('should give job to idle worker', function() {
            var mockWorkerData = {
                send: function() {},
                on: function() {}
            },
                job = {foo: 'bar'};
            childProcessMock.expects('fork')
                .once()
                .returns(mockWorkerData);
            var mockWorker = _sinon.mock(mockWorkerData).expects('send')
                .withExactArgs(job)
                .once();
            var manager = _workman.getManagerInstance(1);
            manager.launch();
            manager.addJob(job);
            mockWorker.verify();
        });

        it('should enqueue job if no idle workers are present', function() {
            var manager = _workman.getManagerInstance(0);
            manager.launch()
            manager.addJob({});
            _assert.equal(manager.getJobQueueSize(), 1);
        });
    });

    describe('method getJobQueueSize', function() {
        it('should return size of job queue', function() {
            var manager = _workman.getManagerInstanceToTestLaunch(0, [{}]);
            manager.launch('', true).then(_assert.equal(manager.getJobQueueSize(), 1));
        });
    });

    describe('message handling', function() {
        var manager, worker;

        // TODO: (wbjacks) unneeded?
        describe.skip('for message tagged ADD_JOB', function() {
            beforeEach(function() {
                worker = new FakeEmitter();
                childProcessMock.expects('fork')
                    .twice()
                    .onFirstCall().returns(worker)
                    .onSecondCall().returns({on: function() {}});
                manager = _workman.getManagerInstance(2);
            });

            it('should call method addJob', function() {
                var managerMock = _sinon.mock(manager);
                managerMock.expects('addJob')
                    .withExactArgs('foo')
                    .once();
                worker.emit('message', {tag: 'ADD_JOB', data: 'foo'});
                managerMock.verify();
                managerMock.restore();
            });
        });

        describe('for message tagged WORKER_DONE', function() {
            beforeEach(function() {
                worker = new FakeEmitter();
                worker.send = function() {}; // addJob will try to send
                worker.kill = function() {};
                childProcessMock.expects('fork')
                    .once()
                    .returns(worker);
                manager = _workman.getManagerInstance(1);
                manager.generator = function() {};
                manager.launch();
            }); 

            afterEach(function() {
                delete worker.send;
                delete worker.kill;
            });

            it('should enqueue worker if work is not complete', function() {
                manager.addJob({});
                worker.emit('message', {tag: 'WORKER_DONE'});
                _assert.equal(manager.getWorkerQueueSize(), 1);
            });

            it('should send kill message to worker if work is complete', function() {
                manager.isWorkComplete = true; // TODO: (wbjacks) should not be able to set
                var workerSpy = _sinon.spy(worker, 'kill');
                worker.emit('message', {tag: 'WORKER_DONE'});
                _assert.isTrue(workerSpy.calledTwice); // worker is in queue and passed in
            });
        });
    });
});

describe('Worker', function() {
    describe('message handling', function() {
        var fakeProcess;
        beforeEach(function() {
            fakeProcess = new FakeEmitter();
            fakeProcess.send = function() {};
        });

        it('should run doWork and send message tagged WORKER_DONE', function() {
            var processSpy = _sinon.spy(fakeProcess, 'send')
                    .withArgs({tag: 'WORKER_DONE', data: 'foo'}),
                doWork = function(msg, cb) {
                    cb(msg);
                },
                doWorkSpy = _sinon.spy(doWork);
            _workman.getWorkerInstance(doWorkSpy, fakeProcess);

            fakeProcess.emit('message', 'foo');
            _assert.isTrue(processSpy.calledOnce);
            _assert.isTrue(doWorkSpy.calledOnce);
        });
    });
});
