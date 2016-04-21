/*
 * Module dependencies
 */
var express = require('express'),
    db = require('services/shitdb');
//get in memory map from s3 now?
var app = express();
console.log(__dirname);
app.use(express.static('./static'));
 
app.get('/', function (req, res) {
    res.sendFile('index.html', {root: './static'});
})

app.get('/words', function (req, res) {
    var speaker = req.query.speaker;
    var data = db.getWordsForSpeaker(speaker);
  
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(data));
});

app.get('/speakers', function (req, res) {
    var data = db.getAllSpeakers();
    res.setHeader('Content-Type', 'application/json');

    //use in memory map for this part?

    res.send(JSON.stringify(data));
});

app.get('/makeVideo', function (req, res) {
    var speaker = req.query.speaker;

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(data));
});

// TODO: (wjackson) move out of app.js
if (!module.parent) {
    db.loadDb(function(){
        var port = process.env.PORT || 3000;
        app.listen(port, function() {
            console.log('app listening on port ' + port);
        });
    });
}

app._getKeysForSentence = function(speaker, sentence) {
    var uniqueWords = sentence.trim().split(/\s+/).filter(function(value, index, self) {
        return self.indexOf(value) === index;
    });
    return db.getS3KeysForWords(speaker, uniqueWords);
};

module.exports = app;
