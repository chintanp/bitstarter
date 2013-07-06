

var express = require('express');

var app = express.createServer(express.logger());

var fs = require('fs');

//Var buf holds the buffer from reading the file index.html
var buf = fs.readFileSync('./index.html');

 //The variable str is declared to hold the string to be sent to the browser
var str = buf.toString('ascii');



app.get('/', function(request, response) {
  response.send(str);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
