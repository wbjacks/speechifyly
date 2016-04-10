var getWordsForSpeaker, getAllSpeakers;
(function($) {
    getWordsForSpeaker = function(speaker, successCallback, failCallback, isDebug) {
        if (isDebug) {
            successCallback(['the', 'a', 'for', 'why', 'how', 'who', 'apple',
                'amith', 'dumb', 'is', 'farts', 'butts', 'butt']);
        }
        else {
            $.getJSON('/words', {speaker: speaker}).done(function(data) {
                successCallback(data.words);
            }).fail(failCallback);
        }
    };

    getAllSpeakers = function(successCallback, failCallback, isDebug) {
        if (isDebug) {
            successCallback(['bob', 'mike', 'sarah', 'michelle']);
        }
        else {
            $.getJSON('/speakers').done(function(data) {
                successCallback(data.speakers);
            }).fail(failCallback);
        }
    }
}(jQuery));
