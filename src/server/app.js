/*
 * Module dependencies
 */
var express = require('express');
 
var server = express();
server.use(express.static(__dirname + 'resources/static'));
 
server.get('/', function (req, res) {
  res.sendFile('./resources/static/index.html');
})

var port = process.env.PORT || 3000;
server.listen(port, function() {
    console.log('server listening on port ' + port);
});
