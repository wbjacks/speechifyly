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

var ButtData = function(butt) {
    this.isReady = false;
    this.butt = butt;
    this.nodeId = null;
}

var VideoAssemblerService = function() {
    var _db = require('services/shitdb'),
        _s3Client = require('services/s3_client'),
        _path = require('path'),
        BiTree = require('util/bi_tree'),
        Manager = require('util/workman').Manager;

    var NUMBER_OF_WORKERS = 3;

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
    },
    _runManagerOnTree = function(tree) {
        var manager = new Manager(NUMBER_OF_WORKERS, __dirname + '/../workers/merge_worker',
            tree.getLeaves().map(function(leaf) {
                var job = leaf.data;
                job.nodeId = leaf.id;
                return job;
            }));
        manager.generator = function(response) {
            console.log("Response: " + JSON.stringify(response));
            var node = tree.getNodeAtId(response.nodeId);
            if (node.isRoot()) {
                console.log("generator setting work complete");
                manager.isWorkComplete = true;
            }
            else {
                if (node.parent.data.isReady) {
                    console.log("generator adding new job");
                    node.parent.data.file2 = response.file;
                    node.parent.data.nodeId = node.parent.id;
                    manager.addJob(node.parent.data);
                }
                else {
                    console.log("generator setting parent ready");
                    node.parent.data.isReady = true;
                    node.parent.data.file1 = response.file;
                    node.children = []; // GC children
                }
            }
        }
        return manager.launch();
    };

    return {
        makeVideo: function(speaker, sentence) {
            var wordToKeyMap = _getKeysForSentence(speaker, sentence),
                sentenceTree = new BiTree(sentence.match(/\S+/).map(function(word) {
                    return new JobNode(wordToKeyMap[word]); // TODO: (wbjacks) fixme
                }));
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
