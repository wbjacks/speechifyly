// Contains listeners to attach JS files to DOM
//

var autocomplete, isDebug;
var _streamerClient = require('./streamer_client'),
    _autocomplete = require('./autocomplete'),
    $ = require('jquery-browserify');

$(document).ready(function() {
    autocomplete = new Awesomplete(document.getElementById('autocomplete'), {
        autoFirst: true,
        minChars: 1,
        filter: function(text, input) {
            return Awesomplete.FILTER_STARTSWITH(text, input.match(/\S+/g).slice(-1)[0]);
        },
        replace: function(text) {
            this.input.value = this.input.value.match(/\S+/g).slice(0, -1)
                .concat(text).join(' ');
        }
    });
    isDebug = !!location.search.split('isDebug=')[1];

    $.getJSON('http://localhost:3000/speakers', function(data) {
        $('#celebrity-input').empty();
        $('#celebrity-input').append($('<option></option>'));
        data.forEach(function(speaker) {
            $('#celebrity-input').append($('<option></option>').text(speaker));
        });
    })
});

$('#celebrity-input').change(function() {
    var selected = $('#celebrity-input').find(':selected').text();
    _autocomplete.getWordsForSpeaker(selected, isDebug).then(function(data) {
        autocomplete.list = data;
    }); 
});

$('#submit').click(function() {
    var speaker = $('#celebrity-input').find(':selected').text(),
        sentence = $('#autocomplete').val();
    _streamerClient.connectToSocket(speaker, sentence);
});
