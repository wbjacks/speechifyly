var assert   = require('chai').assert;
var nock     = require('nock');

var parser   = require('../../src/server/transcriptParser.js');

var stubData = '<tt xmlns="http://www.w3.org/ns/ttml" xmlns:ttm="http://www.w3.org/ns/ttml#metadata" xmlns:tts="http://www.w3.org/ns/ttml#styling" xmlns:ttp="http://www.w3.org/ns/ttml#parameter" xml:lang="en" ttp:profile="http://www.w3.org/TR/profile/sdp-us"><head><styling><style xml:id="s1" tts:textAlign="center" tts:extent="90% 90%" tts:origin="5% 5%" tts:displayAlign="after"/><style xml:id="s2" tts:fontSize=".72c" tts:backgroundColor="black" tts:color="white"/></styling><layout><region xml:id="r1" style="s1"/></layout></head><body region="r1"><div><p begin="00:00:03.159" end="00:00:15.610" style="s2">Mr. Speaker, Mr. Vice President, members of<br/>Congress, my fellow Americans: tonight marks</p><p begin="00:00:15.610" end="00:00:23.580" style="s2">the eighth year that I’ve come here to report<br/>on the state of the Union. And for this final</p><p begin="00:00:23.580" end="00:00:31.689" style="s2">one, I’m going to try to make it a little<br/>shorter.</p></div></body></tt>';

describe('Transcript Parser', function() {
	it('should download transcript from YouTube and parse into JSON array', function(done) {
		var youtubeEndpoint = nock('https://www.youtube.com')
			.get('/api/timedtext?lang=en&fmt=ttml&name=&v=KJGZ9rYtcfE')
			.reply(200, stubData);

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

		parser('https://www.youtube.com/watch?v=KJGZ9rYtcfE',
			function(transcript) {
				assert.deepEqual(expectedTranscript, transcript);
				assert.isTrue(youtubeEndpoint.isDone());
				done();
		});
	});
});