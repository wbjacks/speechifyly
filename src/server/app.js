/*
 * Module dependencies
 */
var express = require('express');
 
var server = express();
console.log(__dirname);
server.use(express.static('./static'));
 
server.get('/', function (req, res) {
  res.sendFile('index.html', {root: './static'});
})

var port = process.env.PORT || 3000;
server.listen(port, function() {
    console.log('server listening on port ' + port);
});
