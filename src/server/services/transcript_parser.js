var _cheerio = require('cheerio');
var _https   = require('https');
var _moment  = require('moment');
var _url     = require('url');

const TRANSCRIPT_BASE_URL = "https://www.youtube.com/api/timedtext?lang=en&fmt=ttml&name=&";
const TIMESTAMP_FORMAT = "HH:mm:ss:SSS";

module.exports = function(youtubeUrl, callback) {
	var transcriptUrl = TRANSCRIPT_BASE_URL + _url.parse(youtubeUrl).query;
	_https.get(transcriptUrl, function(response) {
		var completeHtml = "";
		response.on('data', function(data) {
			completeHtml += data.toString();
		});
		response.on('end', function() {
			var $ = _cheerio.load(completeHtml, {
				normalizeWhitespace : true,
				xmlMode : true
			});
			var transcript = [];
			$("tt").find('body').find('div').children().each(function(index, transcriptLine) {
					$(this).find('br').replaceWith(' ');

					var startTimeInMs = _moment.duration($(this).attr('begin'), TIMESTAMP_FORMAT).asMilliseconds();
					var endTimeInMs = _moment.duration($(this).attr('end'), TIMESTAMP_FORMAT).asMilliseconds();
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