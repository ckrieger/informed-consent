var express = require("express");
var app = express();
var cfenv = require("cfenv");
var bodyParser = require('body-parser')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.get('/', function(req, res) {
  res.send('Monitor Service running')
})

app.post('/receiveData', function(req, res) {
  console.log(`received data of Type ${doc.dataType}`)
  res.json('received data')
})


var port = process.env.PORT || 3000
app.listen(port, function() {
    console.log("Monitor service is running on" + port);
});
