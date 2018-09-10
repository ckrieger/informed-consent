var express = require("express");
var app = express();
var cfenv = require("cfenv");
var bodyParser = require('body-parser')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.get('/', function(req, res) {
  res.send('ControlIoTDevice running')
})

app.post('/remoteControlDevice', function(req, res) {
  res.send('hello')
})

app.post('/receiveMonitorInfo', function(req, res) {
  res.send('hello')
})


var port = process.env.PORT || 3000
app.listen(port, function() {
    console.log("To view your app, open this link in your browser: http://localhost:" + port);
});
