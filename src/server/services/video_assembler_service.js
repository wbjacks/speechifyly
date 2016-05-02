'use strict';

class WorkerData {
    constructor(key, bucket) {
        this.key = key;
        this.bucket = bucket;
        this.isReady = false;
        this.file1 = null;
        this.file2 = null;
    }
}

var VideoAssemblerService = function() {
    var _db = require('services/shitdb'),
        _s3Client = require('services/s3_client'),
        BiTree = require('util/bi_tree'),
        Manager = require('util/workman').Manager;

    var NUMBER_OF_WORKERS = 4;

    var _getKeysForSentence = function(speaker, sentence) {
        var uniqueWords = sentence.trim().split(/\s+/).filter(
            function(value, index, self)
        {
            return self.indexOf(value) === index;
        });
        return _db.getS3KeysForWords(speaker, uniqueWords);
    },
    _makeClipList = function(sentence, wordToKeyMap) {
        return sentence.match(/\S+/).map(function(word) {
            return _s3Client.getFromBucket(wordToKeyMap[word]);
        });
    }

    return {
        makeVideo: function(speaker, sentence) {
            var wordToKeyMap = _getKeysForSentence(speaker, sentence),
                sentenceTree = new BiTree(sentence.match(/\S+/).map(function(word) {
                    return new JobNode(wordToKeyMap[word]);
                })),
                manager = new Manager(NUMBER_OF_WORKERS,
                    _path.resolve('./src/server/workers/merge_worker.js'),
                    sentenceTree.getLeaves());
            manager.generator = function(response, isWorkComplete) {
                var node = sentenceTree.getNodeAtId(response.nodeId);
                if (node.isRoot()) {
                    isWorkComplete = true;
                }
                else {
                    if (node.parent.isReady) {
                        node.parent.file2 = response.file;
                        manager.addJob(node.parent);
                    }
                    else {
                        node.parent.isReady = true;
                        node.parent.file1 = response.file;
                        node.children = []; // GC children
                    }
                }
            }
            var result = new Promise();
            manager.completionCallback = result.promise;
            return result;
        }
    };
};
module.exports = VideoAssemblerService();
