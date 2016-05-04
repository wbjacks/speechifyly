'use strict';

var _sinon = require('sinon'),
    _childProcess = require('child_process'),
    _assert = require('chai').assert,
    BaseEmitter = require('events'),
    Manager = require('util/workman').Manager,
    Worker = require('util/workman').Worker;

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

    describe('upon Manager construction', function() {
        it('should create numberOfWorkers workers at given filepath', function() {
            childProcessMock.expects('fork')
                .withExactArgs('foo.bar')
                .thrice()
                .returns({on: function() {}});
            new Manager(3, 'foo.bar');
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
                .withExactArgs({data: job})
                .once();
            new Manager(1).addJob(job);
            mockWorker.verify();
        });

        it('should enqueue job if no idle workers are present', function() {
            var manager = new Manager(0);
            manager.addJob({});
            _assert.equal(manager.getJobQueueSize(), 1);
        });
    });

    describe('method getJobQueueSize', function() {
        it('should return size of job queue', function() {
            var manager = new Manager(0, null, [{}]);
            _assert.equal(manager.getJobQueueSize(), 1);
        });
    });

    describe('message handling', function() {
        var manager, worker;

        describe('for message tagged ADD_JOB', function() {
            beforeEach(function() {
                worker = new FakeEmitter();
                childProcessMock.expects('fork')
                    .twice()
                    .onFirstCall().returns(worker)
                    .onSecondCall().returns({on: function() {}});
                manager = new Manager(2);
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

        describe('for message tagged WORK_COMPLETE', function() {
            beforeEach(function() {
                worker = new FakeEmitter();
                worker.kill = function() {};
                childProcessMock.expects('fork')
                    .twice()
                    .onFirstCall().returns(worker)
                    .onSecondCall().returns({on: function() {}, kill: function(){}});
                manager = new Manager(2);
                worker.emit('message', {tag: 'WORK_COMPLETE'});
            });

            afterEach(function() {
                delete worker.kill;
            });

            it('should set isWorkComplete to true', function() {
                _assert.isTrue(manager.isWorkComplete);
            })

            it('should add dead worker to killed queue', function() {
                _assert.equal(manager.getNumberOfKilledWorkers(), 1);
            })
        });

        describe('for message tagged WORKER_DONE', function() {
            beforeEach(function() {
                worker = new FakeEmitter();
                worker.send = function() {}; // addJob will try to send
                worker.kill = function() {};
                childProcessMock.expects('fork')
                    .once()
                    .returns(worker);
                manager = new Manager(1);
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
                _assert.isTrue(workerSpy.calledOnce);
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

        it('should send message tagged WORK_COMPLETE if workComplete callback ' +
            'evaluates true', function()
        {
            var processSpy = _sinon.spy(fakeProcess, 'send')
                .withArgs({tag: 'WORK_COMPLETE'});
            new Worker(null, function() {return true;}, fakeProcess);
            fakeProcess.emit('message', {data: null});
            _assert.isTrue(processSpy.calledOnce);
        });

        it('should run doWork and send message tagged WORKER_DONE if workComplete ' +
            'callback evaluates false', function()
        {
            var processSpy = _sinon.spy(fakeProcess, 'send')
                    .withArgs({tag: 'WORKER_DONE'}),
                doWorkSpy = _sinon.spy(function() {}).withArgs('foo');
            new Worker(doWorkSpy, function() {return false;}, fakeProcess);

            fakeProcess.emit('message', {data: 'foo'});
            _assert.isTrue(processSpy.calledOnce);
            _assert.isTrue(doWorkSpy.calledOnce);
        });
    });
});
