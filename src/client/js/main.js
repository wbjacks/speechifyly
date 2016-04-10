// Contains listeners to attach JS files to DOM
//

var autocomplete, isDebug;

$(document).ready(function() {
    autocomplete = new Awesomplete(document.getElementById('autocomplete'), {
        autoFirst: true,
        minChars: 1,
        filter: function(text, input) {
            return Awesomplete.FILTER_STARTSWITH(text, input.split(/\s+/).slice(-1)[0]);
        }
    });
    isDebug = !!location.search.split('isDebug=')[1];
});

$('#celebrity-input').change(function() {
    var selected = $('#celebrity-input').find(':selected').text();
   autocomplete.list = getWordsForSpeaker(selected, isDebug); 
});
