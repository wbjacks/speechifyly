var getWordsForSpeaker;
(function($) {
    getWordsForSpeaker = function(speaker, isDebug) {
        if (isDebug) {
            return ["the", "a", "for", "why", "how", "who", "apple", "amith",
                "dumb", "is", "farts", "butts", "butt"];
        }
        else {
            return $.getJSON("/words", {speaker: speaker}).done(function(data) {
                return data;
            }).fail(function() {
                return [];
            });
        }
    }
}(jQuery));
