var    assert = require('chai').assert,
    sinon  = require('sinon'),
    spy = sinon.spy,
    proxyquire = require('proxyquire'),
    http_mocks = require('node-mocks-http');

var shitdbStub = {
    loadDB: function(callback){callback(undefined);},
    getWordsForSpeaker: function(speaker){ return {"words": ["a", "b", "cat", "dog"]}},
    getAllSpeakers: function(){return {"speakers": ["obama", "osama", "cat", "dog"]}},
    getS3KeysForWords: function(speaker, words){return [{"big": "s3key1"}, {"butts":"s3key2"}]},
    '@noCallThru': true
};

var app = proxyquire('../app', {
  shitdb: shitdbStub
});

// var app = require('../app.js');
function buildResponse() {
  return http_mocks.createResponse({eventEmitter: require('events').EventEmitter})
}

describe('App Controller', function() {
   

    describe('/words', function() {
        it('return a list of words for a speaker passed in as a query parm', function(done) {
        var wordsForSpeakerSpy = spy(shitdbStub, 'getWordsForSpeaker');

        var response = buildResponse();
        var request  = http_mocks.createRequest({
          method: 'GET',
          url: '/words',
          query: {
            speaker: 'obama'
          }
        });

        response.on('end', function() {
            assert(wordsForSpeakerSpy.calledWith("obama"));
            assert(response._isJSON());
            assert.deepEqual(JSON.parse(response._getData()), shitdbStub.getWordsForSpeaker());
            done();
        })

        app.handle(request, response);
            
        });
    });

    describe('/speakers', function() {
        it('return a list of speakers', function(done) {
        var speakersSpy = spy(shitdbStub, 'getAllSpeakers');

        var response = buildResponse();
        var request  = http_mocks.createRequest({
          method: 'GET',
          url: '/speakers',
          
        });

        response.on('end', function() {
            assert(speakersSpy.called);
            assert(response._isJSON());
            assert.deepEqual(JSON.parse(response._getData()), shitdbStub.getAllSpeakers());
            done();
        })

        app.handle(request, response);
            
        });
    });

 describe('/clips', function() {
        it('return a list of clips for a speaker and words passed in as query parms', function(done) {
        var clipsSpy = spy(shitdbStub, 'getS3KeysForWords');

        var response = buildResponse();
        var request  = http_mocks.createRequest({
          method: 'GET',
          url: '/clips',
          query: {
            speaker: 'obama',
            words:'butts'
          }
        });

        response.on('end', function() {
            assert(clipsSpy.calledWith("obama", "butts"));
            assert(response._isJSON());
            assert.deepEqual(JSON.parse(response._getData()), shitdbStub.getS3KeysForWords());
            done();
        })

        app.handle(request, response);

        });        
    });


    
});
