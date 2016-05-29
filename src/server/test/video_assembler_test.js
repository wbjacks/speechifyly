var _assert = require('chai').assert,
    _sinon  = require('sinon'),
    _tmp = require('tmp')
    rewire = require('rewire'),
    _videoAssemblerService = rewire('services/video_assembler_service'),
    _shitDb = require('services/shitdb'),
    _workMan = require('util/workman'),
    BiTree = require('util/bi_tree');

describe('VideoAssemblerService', function() {
    describe('_getKeysForSentence', function() {
        var shitDbMock; 
        beforeEach(function() {
            shitDbMock = _sinon.mock(_shitDb);
        });

        afterEach(function() {
            shitDbMock.verify();
            shitDbMock.restore();
        });

        it('should return a list of unique S3 keys for a given sentence', function() {
            shitDbMock.expects('getS3KeysForWords')
                .withExactArgs('obama', ['one', 'two', 'three', 'four'])
                .once()
                .returns(['a', 'b', 'c', 'd']);
            _assert.deepEqual({
                    one: 'a',
                    two: 'b',
                    three: 'c',
                    four: 'd'
                },
                _videoAssemblerService.__get__('getKeysForSentence')('obama',
                    'one two three two two four three'));
            shitDbMock.verify();
        })
    });

    describe('method _runManagerOnTree', function() {
        var ManagerMock;
        beforeEach(function() {
            workManMock = _sinon.mock(_workMan);
        });

        afterEach(function() {
            workManMock.verify();
            workManMock.restore();
        });

        it('creates a new manager with tree leaves, setting nodeId, generator, and' +
            ' launches it', function() {
                var dummyTree = {
                    getLeaves: function() {
                        return [{data: {a:'foo'}, id: 0}, {data: {a:'bar'}, id: 1}];
                    }
                };
                var dummyManager = {
                    launch: _sinon.spy()
                }

                workManMock.expects('getManagerInstance')
                    .withExactArgs(3, [{a: 'foo', nodeId: 0}, {a: 'bar', nodeId: 1}])
                    .once()
                    .returns(dummyManager);
                _videoAssemblerService.__get__('runManagerOnTree')(dummyTree);
                _assert.isTrue(dummyManager.launch.calledOnce);
                _assert.isOk(dummyManager.generator);
            });
    });
    describe('method _generator', function() {
        var TestJob = function(data) {
            this.isReady = false;
            this.data = data;
            this.nodeId = null;
        }

        var tree, manager, generator;
        before(function() {
            tree = new BiTree([new TestJob('foo'), new TestJob('bar')], TestJob);
        });

        beforeEach(function() {
            manager = {
                addJob: _sinon.spy()
            };
            generator = _videoAssemblerService.__get__('generator')(tree, manager);
        });

        afterEach(function() {
            manager.addJob.reset();
        });

        it('should set workComplete to be true if node is true', function() {
            generator({nodeId: 1});
            _assert.isTrue(manager.isWorkComplete);
        });

        it('should set parent file2 value, set parent nodeId to its own id, and call ' +
            'addJob if node is not root and parent is ready', function() {
                var parent = tree.getNodeAtId(1);
                parent.data.isReady = true;

                generator({nodeId: 2, file: 'foo'});
                _assert.equal(parent.data.file2, 'foo');
                _assert.equal(parent.data.nodeId, parent.id);
                _assert.isTrue(manager.addJob.calledOnce);
            });

        it('should set parent file1 value set parent nodeId to its own id and set ' +
            'parent isReady to true if node is not root and parent is ready', function() {
                var parent = tree.getNodeAtId(1);
                parent.data.isReady = false;

                generator({nodeId: 2, file: 'foo'});
                _assert.equal(parent.data.file1, 'foo');
                _assert.isTrue(parent.data.isReady);
            });
    });
});
