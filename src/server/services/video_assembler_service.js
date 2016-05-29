'use strict';

class WorkerData {
    constructor(key) {
        this.key = key;
        this.bucket = 'speechifyly-test';
        this.isReady = false;
        this.file1 = null;
        this.file2 = null;
    }
}

var ButtData = function(butt) {
    this.isReady = false;
    this.butt = butt;
    this.nodeId = null;
}

// Protected: exposed using rewire
var generator, getKeysForSentence, runManagerOnTree;

var VideoAssemblerService = function() {
    var _db = require('services/shitdb'),
        _s3Client = require('services/s3_client'),
        _path = require('path'),
        BiTree = require('util/bi_tree'),
        _workMan = require('util/workman');

    var NUMBER_OF_WORKERS = 3;

    function _getKeysForSentence(speaker, sentence) {
        var uniqueWords = sentence.trim().split(/\s+/).filter(
            function(value, index, self) {
                return self.indexOf(value) === index;
            }),
            keys = _db.getS3KeysForWords(speaker, uniqueWords),
            wordToKeyMap = {};
        uniqueWords.forEach(function(word) {
            wordToKeyMap[word] = keys.shift();
        });
        return wordToKeyMap;
    }

    function _makeClipList(sentence, wordToKeyMap) {
        return sentence.match(/\S+/).map(function(word) {
            return _s3Client.getFromBucket(wordToKeyMap[word]);
        });
    }

    function _generator(tree, manager) {
        return function(response) {
            var node = tree.getNodeAtId(response.nodeId);
            if (node.isRoot()) {
                manager.isWorkComplete = true;
            }
            else {
                if (node.parent.data.isReady) {
                    node.parent.data.file2 = response.file;
                    node.parent.data.nodeId = node.parent.id;
                    manager.addJob(node.parent.data);
                }
                else {
                    node.parent.data.isReady = true;
                    node.parent.data.file1 = response.file;
                    node.children = []; // GC children
                }
            }
        }
    }

    function _runManagerOnTree(tree) {
        var manager = _workMan.getManagerInstance(NUMBER_OF_WORKERS, tree.getLeaves()
            .map(function(leaf) {
                var job = leaf.data;
                job.nodeId = leaf.id;
                return job;
            }));
        manager.generator = _generator(tree, manager);
        return manager.launch('./node_modules/workers/merge_worker'); // why can't I use node_module?
    }

    // Expose protected functions
    generator = _generator;
    getKeysForSentence = _getKeysForSentence;
    runManagerOnTree = _runManagerOnTree;

    return {
        makeVideo: function(speaker, sentence) {
            var wordToKeyMap = _getKeysForSentence(speaker, sentence),
                sentenceTree = new BiTree(sentence.match(/\S+/g).map(function(word) {
                    return new WorkerData(wordToKeyMap[word]); // TODO: (wbjacks) fixme
                }), WorkerData);
            return _runManagerOnTree(sentenceTree);
        },

        AHHHHHHHHH: function() {
            // TODO: (wbjacks) need to set data of internal nodes
            var tree = new BiTree(['butt1.webm', 'butt2.webm', 'butt3.webm']
                .map(function(butt)
            {
                return new ButtData(_path.resolve('./foo/'+butt));
            }), ButtData);
            return _runManagerOnTree(tree);
        }
    };
};
module.exports = VideoAssemblerService();
