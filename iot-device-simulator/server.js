var express = require('express')
const request = require('request-promise-native')
var app = express()

app.get('/', function(req, res) {
  res.send('IoT SImulator is running')
})
app.listen(8080, function() {
  console.log('Sample app is listening on port 8080.')

  var coffeMachineIntervall = setInterval(function() {
   sendDataToCLoudGateway('CoffeMachine', 'TankStatus', 'full')
  }, 5000);

  var coffeMachineIntervall = setInterval(function() {
    sendDataToCLoudGateway('CoffeMachine', 'BeanStatus', 'empty')
   }, 7000);
})

function sendDataToCLoudGateway(deviceId, dataType, data){
    var options = {
        method: 'POST',
        uri: 'http://localhost:8888/',
        body: {
            deviceId: deviceId,
            dataType: dataType,
            data:data
        },
        json: true 
    };
     
    request(options)
        .then(function (parsedBody) {
            console.log(parsedBody);
        })
        .catch(function (err) {
            console.log(err);
        });
}
