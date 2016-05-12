'use strict';

var _childProcess = require('child_process'),
DEBUG = false; // TODO: (wbjacks) set this from environment

var Manager = function(numberOfWorkers, initialData) {
    var self = this;

    // Constructor
    var _initialJobs = initialData ? initialData.map(function (initialDatum) {
            return new __Job(initialDatum);
        }) : [],
        _workerQueue = [],
        _killedWorkers = [],
        _jobQueue = [],
        _numberOfWorkers = numberOfWorkers,
        _isManagerComplete = false;

    this.isWorkComplete = false; // ehhhh this needs to be tested sry
    this.generator = null;
    this.completionCallback = null;

    // TODO: (wbjacks) needs a lock for editing calls


    // Privates
    function _messageHandler(worker, message, resolve) {
        switch(message.tag) {
            case 'WORKER_DONE':
                self.generator(message.data);
                _handleIdleWorker(worker, message.data, resolve);
                break;
            // TODO: (wbjacks) unneeded?
            case 'ADD_JOB':
                self.addJob(message.data);
                break;
            default:
                console.warn("WARNING: Recieved message " + message.tag + "from child " +
                    worker.pid + " is unrecognized. Ignoring.");
        }
    }

    function _handleIdleWorker(worker, data, resolve) {
        if (self.isWorkComplete) {
            console.log('Killing workers');
            _killWorker(worker);
            _workerQueue.forEach(function(worker) {
                _killWorker(worker);
            });
            
            if (_killedWorkers.length === _numberOfWorkers) {
                _killedWorkers = []; // garbage collect
                _log('Resolving manager with data: ' + JSON.stringify(data));
                resolve(data);
            }
        }
        else {
            _matchWorkerToJobOrEnqueue(worker);
        }
    }

    function _killWorker(worker) {
        worker.kill();
        _killedWorkers.push(worker);
    }

    function _matchWorkerToJobOrEnqueue(worker) {
        if (_jobQueue.length === 0) {
            _workerQueue.unshift(worker);
        }
        else {
            var message = _jobQueue.pop();
            _log("Sending message to PID#" + worker.pid + ": " +
                JSON.stringify(message));
            worker.send(message.data); // TODO: (wbjacks) tag outgoing messages?
        }
    }

    function _matchJobToWorkerOrEnqueue(job) {
        if (_workerQueue.length === 0) {
            _log("Enqueueing job: " + JSON.stringify(job));
            _jobQueue.unshift(job);
        }
        else {
            var worker = _workerQueue.pop();
            _log("Sending message to PID#" + worker.pid + ": " +
                JSON.stringify(job.data));
            worker.send(job.data);
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

    this.launch = function(workerFile) {
        return new Promise(function(resolve, reject) {
            for (var i = 0; i < _numberOfWorkers; i++) {
                var worker = _childProcess.fork(workerFile);
                _workerQueue.push(worker);
                worker.on('message', function(message) {
                    _messageHandler(worker, message, resolve);
                });
            } 
            while(_initialJobs.length !== 0) {
                _matchJobToWorkerOrEnqueue(_initialJobs.pop());
            }
        });
    }
};


class __Job {
    constructor(data) {
        this.data = data;
    }
};

var Worker = function(doWork, process) {
    _log('Process spawned with PID ' + process.pid);
    process.on('message', function(message) {
        _log("Process PID#" + process.pid + " received message: " +
            JSON.stringify(message));
        doWork(message, function(data) {
            var message = {tag: 'WORKER_DONE', data: data};
            _log("Process PID#" + process.pid + " sending message: " +
                JSON.stringify(message));
            process.send(message);
            _log("foo!");
        });
    });
};

function _log(msg) {
    if (DEBUG) console.log(msg);
}

// TODO: (wbjacks) remove constructor export
module.exports = {
    Manager: Manager,
    Worker: Worker,
    getWorkerInstance: function(doWork, process) {
        return new Worker(doWork, process);
    },
    getManagerInstance: function(numberOfWorkers, workerFile, initialData) {
        return new Manager(numberOfWorkers, workerFile, initialData);
    }
};
