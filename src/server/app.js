/*
 * Module dependencies
 */
var express = require('express');
var db = require('shitdb');
//get in memory map from s3 now?
var app;

db.loadDB(function(){


app = express();
console.log(__dirname);
app.use(express.static('./static'));
 
app.get('/', function (req, res) {
  res.sendFile('index.html', {root: './static'});
})

app.get('/words', function (req, res) {
  var speaker = req.query.speaker;
  var data = db.getWordsForSpeaker(speaker); //{"words": ["a", "b", "cat", "dog"]};
  
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(data));
});


app.get('/speakers', function (req, res) {
 var data = db.getAllSpeakers(); //{"speakers": ["obama", "osama", "cat", "dog"]};
      res.setHeader('Content-Type', 'application/json');

  //use in memory map for this part?

  var data = {'words': ['a', 'b', 'cat', 'dog']};
  res.send(JSON.stringify(data));
});

server.get('/speakers', function (req, res) {
 var data = {'speakers': ['obama', 'osama', 'cat', 'dog']};
  res.send(JSON.stringify(data));
});

app.get('/clips', function (req, res) {
	var speaker = req.query.speaker;
	var words = req.query.words;

  //Should we throw if it's not possible to make such a video?

  var data =   db.getS3KeysForWords(speaker, words); // [{"big": "s3key1"}, {"butts":"s3key2"}];

  res.setHeader('Content-Type', 'application/json');
 var data = [{'big': 's3key1'}, {'butts':'s3key2'}];
  res.send(JSON.stringify(data));
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log('app listening on port ' + port);
});

});

module.exports = app;
