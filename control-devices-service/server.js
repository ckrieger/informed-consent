var express = require("express");
const request = require('request-promise-native')
var app = express();
var cfenv = require("cfenv");
var bodyParser = require('body-parser')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


app.post('/remoteControlDevice', function(req, res) {
  var dataType = req.body.dataType;
  var senderId = 'ControlDevicesService'
  var recipientId = req.body.recipientId
  sendDataToCLoudGateway(senderId, recipientId, dataType, 'some data value', res);
})

app.post('/receiveData', function(req, res) {
  console.log(`received data of Type ${doc.dataType}`)
  res.json('received data')
})


function sendDataToCLoudGateway(senderId, recipientId, dataType, data, response){
  var options = {
      method: 'POST',
      uri: 'https://informedconsentgateway-chatty-parrot.eu-gb.mybluemix.net/checkConsent',
      body: {
          sender: senderId,
          recipient: recipientId,
          dataType: dataType,
          data:data
      },
      json: true 
  };
   
  request(options)
      .then(function (parsedBody) {
          console.log(parsedBody);
          response.json(parsedBody)
      })
      .catch(function (err) {
          console.log(err);
      });
}

//serve static file (index.html, images, css)
app.use(express.static(__dirname + '/views'));


var port = process.env.PORT || 3000
app.listen(port, function() {
    console.log("ControlDevicesService running on port" + port);
});

