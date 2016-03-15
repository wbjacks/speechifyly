var _assert       = require('chai').assert;

var _interpolator = require('../../src/server/transcript_interpolator.js');

describe('Transcript Interpolator', function() {
	it('should interpolate transcript chunks according to word length', function() {
		var parsedTranscript = 
			[
				{
					startTimeInMs : 3159,
					endTimeInMs : 15610,
					transcriptText : 'Mr. Speaker,'
				},
				{
					startTimeInMs : 15610,
					endTimeInMs : 23580,
					transcriptText : 'Mr. Vice President,'
				}
			];
		var expectedInterpolatedTranscript = 
			[
				{
					startTimeInMs : 3159,
					endTimeInMs : 6554.727272727272,
					word : 'Mr.'
				},
				{
					startTimeInMs : 6554.727272727272,
					endTimeInMs : 15610,
					word : 'Speaker,'
				},
				{
					startTimeInMs : 15610,
					endTimeInMs : 17016.470588235294,
					word : 'Mr.'
				},
				{
					startTimeInMs : 17016.470588235294,
					endTimeInMs : 18891.764705882353,
					word : 'Vice'
				},
				{
					startTimeInMs : 18891.764705882353,
					endTimeInMs : 23580,
					word : 'President,'
				},
			];

		_interpolator(parsedTranscript, function(interpolatedTranscript) {
			_assert.deepEqual(expectedInterpolatedTranscript, interpolatedTranscript);
		});
	});
});