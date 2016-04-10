const S3_DB_KEY = 'SHIT_DB';
const S3_DB_BUCKET = 'speechifyly';

var ShitDb = function() {
    var _s3     = require('services/s3_client'),
        _stream = require('stream');

    var db = {};

    function getReadableDbStream() {
        var rs = new stream.Readable();
        rs._read = function(numBytes) {
            rs.push(JSON.stringify(db));
            rs.push(null);
        };
        return rs;
    }

    function parseJSONFromResponseStream(dataStream) {
        return JSON.parse(dataStream.Body.toString());
    }

    return {
        loadDb: function(callback) {
            _s3.getFromBucket(S3_DB_KEY, S3_DB_BUCKET, function(err, dataStream) {
                if (err) {
                    callback(err);
                    return;
                } 
                db = parseJSONFromResponseStream(dataStream);
                callback(undefined);
            });
        },

        persistDb: function(callback) {
            _s3.putInBucket(S3_DB_KEY, getReadableDbStream(), S3_DB_BUCKET, function(err, response) {
                if (err) {
                    callback(err);
                    return;
                }
                callback(undefined, response);
            });
        },

        getAllSpeakers: function() {
            return Object.keys(db);
        },

        getAllWords: function() {
            var words = [];

            getAllSpeakers().forEach(function(speaker) {
                words.push(getWordsForSpeaker(speaker));
            });

            return words;
        },

        getWordsForSpeaker: function(speaker) {
            return Object.keys(db[speaker]);
        },

        getS3KeysForWords: function(speaker, words) {
            var keysForWords = [];

            words.forEach(function(word) {
                var s3Key = db[speaker][word];
                keysForWords.push(s3Key);
            });

            return keysForWords;
        },

        addSpeaker: function(newSpeaker) {
            if (db[newSpeaker]) {
                throw "That speaker is already being tracked in the ShitDb!";
            }
            db[newSpeaker] = {};
        },

        addWordAndS3KeyForSpeaker: function(speaker, word, s3Key) {
            if (db[speaker] && db[speaker][word]) {
                throw "That speaker - word combination is already being tracked in the ShitDb!";
            }

            if (!db[speaker]) {
                addSpeaker(speaker);
            }
            db[speaker][word] = s3Key;
        }
    }
}

module.exports = ShitDb();