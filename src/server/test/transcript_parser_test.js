var _assert   = require('chai').assert,
    _nock     = require('nock'),
    _parser   = require('services/transcript_parser.js');

describe('Transcript Parser', function() {
    it('should download transcript from YouTube and parse into JSON array', function(done) {
        var youtubeEndpoint = _nock('https://www.youtube.com')
            .get('/api/timedtext?lang=en&fmt=ttml&name=&v=KJGZ9rYtcfE')
            .replyWithFile(200, __dirname + '/../resources/fixture/youtube_transcript.html');

        var expectedTranscript = [
            {
                startTimeInMs : 3159,
                endTimeInMs : 15610,
                transcriptText : 'Mr. Speaker, Mr. Vice President, members of Congress, my fellow Americans: tonight marks'
            },
            {
                startTimeInMs : 15610,
                endTimeInMs : 23580,
                transcriptText : 'the eighth year that I’ve come here to report on the state of the Union. And for this final'
            },
            {
                startTimeInMs : 23580,
                endTimeInMs : 31689,
                transcriptText : 'one, I’m going to try to make it a little shorter.'
            }
        ];

        _parser('https://www.youtube.com/watch?v=KJGZ9rYtcfE')
        .then(function(transcript) {
            _assert.deepEqual(expectedTranscript, transcript);
            _assert.isTrue(youtubeEndpoint.isDone());
            done();
        });
    });
});
