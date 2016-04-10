/*
 * Module dependencies
 */
var express = require('express');

//get in memory map from s3 now?

var server = express();
console.log(__dirname);
server.use(express.static('./static'));
 
server.get('/', function (req, res) {
  res.sendFile('index.html', {root: './static'});
})

server.get('/words', function (req, res) {
  var speaker = req.query.speaker;
  //use in memory map for this part?

  var data = {"words": ["a", "b", "cat", "dog"]};
  res.send(JSON.stringify(data));
});


server.get('/speakers', function (req, res) {
 var data = {"speakers": ["obama", "osama", "cat", "dog"]};
  res.send(JSON.stringify(data));
});

server.get('/clips', function (req, res) {
	var speaker = req.query.speaker;
	var words = req.query.words;
//access map and return things?
//Should we throw if it's not possible to make such a video?

 var data = [{"big": "s3key1"}, {"butts":"s3key2"}];
  res.send(JSON.stringify(data));
});

var port = process.env.PORT || 3000;
server.listen(port, function() {
    console.log('server listening on port ' + port);
});
