var express = require("express");
const request = require('request-promise-native')
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
  console.log(`received data of Type ${req.body.dataType}`);
  sendDataToInformedConsentGateway('ControlService', req.body.dataType, req.body.data);
  res.json('MonitorService response: received data of Type' + req.body.dataType)
})

function sendDataToInformedConsentGateway(recipient, dataType, data) {
  console.log(`sent data of Type ${dataType} and recipient ${recipient} to gateway`)
  var options = {
    method: 'POST',
    uri: 'https://informedconsentgateway-chatty-parrot.eu-gb.mybluemix.net/checkConsent',
    body: {
        sender: 'MonitorService',
        recipient: recipient,
        dataType: dataType,
        data:data
    },
    json: true 
};
 
request(options)
    .then(function (parsedBody) {
        console.log('Gateway Response ' + parsedBody);
    })
    .catch(function (err) {
        console.log(err);
    });
}



var port = process.env.PORT || 3000
app.listen(port, function() {
    console.log("Monitor service is running on" + port);
});
