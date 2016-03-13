/*
 * Module dependencies
 */
var express = require('express');
 
var server = express();
server.use(express.static(__dirname + '/static'));
 
server.get('/', function (req, res) {
  res.sendFile('./static/index.html');
})

var port = 3000;
server.listen(port, function() {
    console.log('server listening on port ' + port);
});
