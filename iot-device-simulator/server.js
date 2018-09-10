var express = require('express')
const request = require('request-promise-native')
var bodyParser = require('body-parser')
var app = express()

// parse application/json
app.use(bodyParser.json())

//serve static file (index.html, images, css)
app.use(express.static(__dirname + '/views'));

app.listen(8080, function() {
  console.log('Sample app is listening on port 8080.')
})

app.post("/createData", function (request, response){
    var dataType = request.body.dataType;
    var sender = request.body.sender
    sendDataToCLoudGateway(sender, dataType, 'some data value');
});

function sendDataToCLoudGateway(deviceId, dataType, data){
    var options = {
        method: 'POST',
        uri: 'http://localhost:8888/checkConsent',
        body: {
            sender: deviceId,
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
