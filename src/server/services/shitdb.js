const S3_DB_KEY = 'SHIT_DB';
const S3_DB_BUCKET = 'speechifyly-test';

var ShitDb = function() {
    var _s3     = require('services/s3_client'),
        _stream = require('stream');

    var db = {};

    function loadDb(callback) {
        _s3.getFromBucket(S3_DB_KEY, S3_DB_BUCKET, function(err, dataStream) {
                if (err) {
                    callback(err);
                    return;
                } 
                db = _parseJSONFromResponseStream(dataStream);
                callback(undefined);
            });
    }

    function persistDb(callback) {
        _s3.putInBucket(S3_DB_KEY, _getReadableDbStream(), S3_DB_BUCKET, function(err, response) {
                if (err) {
                    callback(err);
                    return;
                }
                callback(undefined, response);
            });
    }

    function getAllSpeakers() {
        return Object.keys(db);
    }

    function getAllWords() {
        var words = [];

        getAllSpeakers().forEach(function(speaker) {
            words = words.concat(getWordsForSpeaker(speaker));
        });

        return words;
    }

    function getWordsForSpeaker(speaker) {
        return Object.keys(db[speaker]);
    }

    function getS3KeysForWords(speaker, words) {
        var keysForWords = [];

        words.forEach(function(word) {
            var s3Key = db[speaker][word];
            keysForWords.push(s3Key);
        });

        return keysForWords;
    }

    function addSpeaker(newSpeaker) {
        if (db[newSpeaker]) {
                throw "That speaker is already being tracked in the ShitDb!";
            }
        
        db[newSpeaker] = {};
    }

    function addWordAndS3KeyForSpeaker(speaker, word, s3Key) {
        if (db[speaker] && db[speaker][word]) {
                throw "That speaker - word combination is already being tracked in the ShitDb!";
            }

        if (!db[speaker]) {
            _addSpeaker(speaker);
        }
        db[speaker][word] = s3Key;
    }

    function _getReadableDbStream() {
        var rs = new _stream.Readable();
        rs._read = function(numBytes) {
            rs.push(JSON.stringify(db));
            _closeReadStream(rs);
        };
        return rs;
    }

    function _closeReadStream(readStream) {
        readStream.push(null);
    }

    function _parseJSONFromResponseStream(dataStream) {
        return JSON.parse(dataStream.Body.toString());
    }

    return {
        loadDb: loadDb,
        persistDb: persistDb,
        getAllSpeakers: getAllSpeakers,   
        getAllWords: getAllWords,
        getWordsForSpeaker: getWordsForSpeaker,
        getS3KeysForWords: getS3KeysForWords,
        addSpeaker: addSpeaker,
        addWordAndS3KeyForSpeaker: addWordAndS3KeyForSpeaker
    }
}

module.exports = ShitDb();
