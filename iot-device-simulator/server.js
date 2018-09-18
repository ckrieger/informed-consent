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
    var senderId = request.body.senderId;
    var recipientId = request.body.recipientId;
    sendDataToCLoudGateway(senderId, recipientId, dataType, 'some data value');
    response.json('sended')
});

function sendDataToCLoudGateway(senderId, recipientId, dataType, data){
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
        })
        .catch(function (err) {
            console.log(err);
        });
  }
