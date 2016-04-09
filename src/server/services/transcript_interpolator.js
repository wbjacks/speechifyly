module.exports = function(parsedTranscript, callback) {
    var interpolatedWords = [];

    parsedTranscript.forEach(function(transcriptChunk) {
        var chunkDurationInMs = transcriptChunk.endTimeInMs - transcriptChunk.startTimeInMs;
        var numChunkChars = transcriptChunk.transcriptText.replace(/ /g, '').length;

        var previousStartTimeInMs = transcriptChunk.startTimeInMs;
        transcriptChunk.transcriptText.split(' ').forEach(function(word) {
            var numWordChars = word.length;
            var wordDurationInMs = (numWordChars / numChunkChars) * chunkDurationInMs;

            var wordStartTimeInMs = previousStartTimeInMs;
            var wordEndTimeInMs = wordStartTimeInMs + wordDurationInMs;

            interpolatedWords.push({
                startTimeInMs : wordStartTimeInMs,
                endTimeInMs : wordEndTimeInMs,
                word : word
            });

            previousStartTimeInMs = wordEndTimeInMs;
        });
    });

    callback(interpolatedWords);
}
