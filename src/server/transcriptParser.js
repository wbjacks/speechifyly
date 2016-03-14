var cheerio = require('cheerio');
var https   = require('https');
var moment  = require('moment');
var url  	= require('url');

const TRANSCRIPT_BASE_URL = "https://www.youtube.com/api/timedtext?lang=en&fmt=ttml&name=&";
const TIMESTAMP_FORMAT = "HH:mm:ss:SSS";

module.exports = function(youtubeUrl, callback) {
	var transcriptUrl = TRANSCRIPT_BASE_URL + url.parse(youtubeUrl).query;
	https.get(transcriptUrl, function(response) {
		var completeHtml = "";
		response.on('data', function(data) {
			completeHtml += data.toString();
		});
		response.on('end', function() {
			$ = cheerio.load(completeHtml, {
				normalizeWhitespace : true,
				xmlMode : true
			});
			var transcript = [];
			$("tt").find('body').find('div').children().each(function(index, transcriptLine) {
					$(this).find('br').replaceWith(' ');

					var startTimeInMs = moment.duration($(this).attr('begin'), TIMESTAMP_FORMAT).asMilliseconds();
					var endTimeInMs = moment.duration($(this).attr('end'), TIMESTAMP_FORMAT).asMilliseconds();
					var transcriptText = $(this).text();
					transcript.push({
						startTimeInMs : startTimeInMs,
						endTimeInMs : endTimeInMs,
						transcriptText : transcriptText
					});
				});
			callback(transcript);
		});
	});
}