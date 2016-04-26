var _childProcess = require('child_process');

var Manager = function(numberOfWorkers, workerFile, initialData) {
    var self = this;

    // Constructor
    var _jobQueue = initialData ? initialData.map(function (initialDatum) {
            return new __Job(initialDatum);
        }) : [],
        _workerQueue = [],
        _killedWorkers = [],
        _numberOfWorkers = numberOfWorkers,
        _isManagerComplete = false;

    this.isWorkComplete = false; // ehhhh this needs to be tested sry

    // TODO: (wbjacks) needs a lock for editing calls

    for (var i = 0; i < _numberOfWorkers; i++) {
        var worker = _childProcess.fork(workerFile);
        _workerQueue.push(worker);
        worker.on('message', function(message) {
            _messageHandler(worker, message);
        });
        
    } 

    // Privates
    function _messageHandler(worker, message) {
        switch(message.tag) {
            case 'WORKER_DONE':
                _handleIdleWorker(worker);
                break;
            case 'WORK_COMPLETE':
                self.isWorkComplete = true;
                _handleIdleWorker(worker);
                break;
            case 'ADD_JOB':
                self.addJob(message.data);
                break;
            default:
                console.warn("WARNING: Recieved message " + message.tag + "from child " +
                    worker.pid + " is unrecognized. Ignoring.");
        }
    }

    function _handleIdleWorker(worker) {
        if (self.isWorkComplete) {
            worker.kill();
            _killedWorkers.push(worker);
            if (_killedWorkers.length === _numberOfWorkers) {
                _killedWorkers = []; // garbage collect
                _isManagerComplete = true;
            }
        }
        else {
            _workerQueue.unshift(worker);
        }
    }

    function _matchWorkerToJobOrEnqueue(worker) {
        if (_jobQueue.length === 0) {
            _workerQueue.unshift(worker);
        }
        else {
            worker.send(_jobQueue.pop().data); // TODO: (wbjacks) tag outgoing messages?
        }
    }

    function _matchJobToWorkerOrEnqueue(job) {
        if (_workerQueue.length === 0) {
            _jobQueue.unshift(job);
        }
        else {
            _workerQueue.pop().send(job);
        }
    }

    // Publics
    this.addJob = function(data) {
        _matchJobToWorkerOrEnqueue(new __Job(data));
    };

    this.getJobQueueSize = function() {
        return _jobQueue.length;
    };

    this.getWorkerQueueSize = function() {
        return _workerQueue.length;
    };

    this.getNumberOfKilledWorkers = function() {
        return _killedWorkers.length;
    };
};


var __Job = function(data) {
    this.data = data;
};

var Worker = function(doWork, workComplete, process) {
    process.on('message', function(message) {
        if (workComplete(message.data)) {
            process.send({tag: 'WORK_COMPLETE'});
        }
        else {
            doWork(message.data);
            process.send({tag: 'WORKER_DONE'});
        }
    });
};

module.exports = {
    Manager: Manager,
    Worker: Worker
};
