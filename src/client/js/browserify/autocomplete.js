var Autocomplete = function() {
    return {
        getWordsForSpeaker: function getWordsForSpeaker(speaker, isDebug) {
            if (isDebug) {
                return new Promise(function(res) {
                    res(['the', 'a', 'for', 'why', 'how', 'who', 'apple', 'amith',
                        'dumb', 'is', 'farts', 'butts', 'butt']);
                });
            }
            else {
                return new Promise(function(res, rej) {
                    $.getJSON("http://localhost:3000/words", {speaker: speaker})
                        .done(res).fail(rej);
                });
            }
        }
    };
}

module.exports = Autocomplete();
