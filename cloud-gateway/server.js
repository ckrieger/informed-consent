var express = require('express')
var bodyParser = require('body-parser')
var app = express()

// parse application/json
app.use(bodyParser.json())

app.post('/', function(req, res) {
  console.log("received data: " + "deviceId: " + req.body.deviceId + " dataType: " + req.body.dataType);
  res.send('received data')
})


app.listen(8888, function() {
  console.log('Cloud Gateway is listening on port 8888.')
})
