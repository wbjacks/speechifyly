// Contains listeners to attach JS files to DOM
//

var autocomplete, isDebug;

// Main loop / initialization
(function($, document, location) {
    $(document).ready(function() {
        autocomplete = new Awesomplete(document.getElementById('autocomplete'), {
            autoFirst: true,
            minChars: 1,
            filter: function(text, input) {
                return Awesomplete.FILTER_STARTSWITH(text, input.split(/\s+/).slice(-1)[0]);
            }
        });
        isDebug = !!location.search.split('isDebug=')[1];
        populateSpeakers();
    });

    $('#speaker-input').change(function() {
        var selected = $('#celebrity-input').find(':selected').text();
        getWordsForSpeaker(selected, function(words) {
            autocomplete.list = words;
        }); 
    });

    function populateSpeakers() {
        var speakerDropdown = $('#speaker-input');
        speakerDropdown.empty();
        getAllSpeakers(function (speakers) {
            speakerDropdown.append(speakers.map(_createOptionNode));
        }, function() {}, isDebug);
        speakerDropdown.prepend(_createOptionNode('')); // give that shit some space
    }

    function _createOptionNode(text) {
        return "<option value=\"" + text + "\">" + text + "</option>";
    }
} (jQuery, document, location));
