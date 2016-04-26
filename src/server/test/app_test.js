var _assert = require('chai').assert,
    _sinon  = require('sinon'),
    _shitDb = require('services/shitdb'),
    _request = require('supertest');

describe('App Controller', function() {
    var app, shitDbMock;
    beforeEach(function() {
        shitDbMock = _sinon.mock(_shitDb);
        app = require('../app.js');
    });

    afterEach(function() {
        shitDbMock.restore();
    });

    describe('/words', function() {
        it('return a list of words for a speaker passed in as a query parm', function(done) {
            shitDbMock.expects('getWordsForSpeaker')
                .withExactArgs('obama')
                .once()
                .returns({"words": ["a", "b", "cat", "dog"]});

            _request(app).get('/words').query({speaker: 'obama'})
                .expect('Content-Type', /json/)
                .expect(function() {
                    shitDbMock.verify();
                })
                .expect({"words": ["a", "b", "cat", "dog"]}, done);
        });
    });

    describe('/speakers', function() {
        it('return a list of speakers', function(done) {
            shitDbMock.expects('getAllSpeakers').once()
                .returns({"speakers": ["obama", "osama", "cat", "dog"]});

            _request(app).get('/speakers')
                .expect('Content-Type', /json/)
                .expect(function() {
                    shitDbMock.verify();
                })
                .expect({"speakers": ["obama", "osama", "cat", "dog"]}, done);
        });
    });

    describe('/makeVideo', function() {
        it('should return a map of word to keys for each unique word in a sentence', function() {
        });
    });

    describe('_getKeysForSentence', function() {
        it('should return a list of unique S3 keys for a given sentence', function() {
            shitDbMock.expects('getS3KeysForWords')
                .withExactArgs('obama', ['one', 'two', 'three', 'four'])
                .once()
                .returns('success');
            _assert.equal('success',
                app._getKeysForSentence('obama', 'one two three two two four three'));
            shitDbMock.verify();
        })
    });
});
