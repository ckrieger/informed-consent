var express = require("express");
const request = require('request-promise-native')
var app = express();
var cfenv = require("cfenv");
var bodyParser = require('body-parser');
var dateFormat = require('dateformat');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

var cloudant, mydb;
var log = [];


app.post('/checkConsent', function(req, res) {
  var data = req.body.data;
  const query = {
    "selector": {
       "sender": req.body.sender,
       "recipient": req.body.recipient,
       "dataType":  req.body.dataType
    }
  }
    
  
  mydb.find(query, function(er, result) {
    if (er) {
      throw er;
    }
    if(result.docs.length > 0){
      forwardData(req.body);
      console.log(`forwarded data of Type ${req.body.dataType} sended by ${req.body.sender} to ${req.body.recipient}`);
      log.push(`forwarded data of Type ${req.body.dataType} sended by ${req.body.sender} to ${req.body.recipient}.  ${dateFormat(new Date())}`);
      res.json(`forwarded data of Type ${req.body.dataType} to ${req.body.recipient}`)
    } else {
      console.log(`did not forward data of Type ${req.body.dataType} sended by ${req.body.sender} to ${req.body.recipient}`)
      log.push(`did not forward data of Type ${req.body.dataType} sended by ${req.body.sender} to ${req.body.recipient}.  ${dateFormat(new Date())}`);
      res.json(`did not forward data of Type ${req.body.dataType} to ${req.body.recipient}`)
    }
  });
})

function forwardData(data){
  var recipientArray = [['MonitorService', 'https://monitorservice-fearless-koala.eu-gb.mybluemix.net'], ['ControlService', 'https://controldevices-cheerful-gnu.eu-gb.mybluemix.net'], ['EmailNotificationService', '']];
  var recipientUrls = new Map(recipientArray);
  var recipientUrl = recipientUrls.get(data.recipient);

  var options = {
    method: 'POST',
    uri: recipientUrl + '/receiveData',
    body: data,
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

// load local VCAP configuration  and service credentials
var vcapLocal;
try {
  vcapLocal = require('./vcap-local.json');
  console.log("Loaded local VCAP", vcapLocal);
} catch (e) { }

const appEnvOpts = vcapLocal ? { vcap: vcapLocal} : {}
const appEnv = cfenv.getAppEnv(appEnvOpts);

var Cloudant = require('@cloudant/cloudant');
if (appEnv.services['cloudantNoSQLDB'] || appEnv.getService(/cloudant/)) {
  if (appEnv.services['cloudantNoSQLDB']) {
    cloudant = Cloudant(appEnv.services['cloudantNoSQLDB'][0].credentials);
  } else {
     cloudant = Cloudant(appEnv.getService(/cloudant/).credentials);
  }
} else if (process.env.CLOUDANT_URL){
  cloudant = Cloudant(process.env.CLOUDANT_URL);
}
if(cloudant) {
  var dbName = 'mydb';
  cloudant.db.create(dbName, function(err, data) {
    if(!err) 
      console.log("Created database: " + dbName);
  });
  mydb = cloudant.db.use(dbName);
}

//serve static file (index.html, images, css)
app.use(express.static(__dirname + '/views'));

app.get('/log', function(req, res){
  res.json(log);
})

app.get('/consents', function(req, res) {
  var allowedFunctions = [];
  if(!mydb) {
    response.send("No database");
    return;
  }
  // check consent 
  mydb.list({ include_docs: true}, function(err, body){
    if (!err){
      body.rows.forEach(function(row){
        allowedFunctions.push(`DataType: ${row.doc.dataType}, Sender: ${row.doc.sender}, Recipient: ${row.doc.recipient}`);
      })
      res.json(allowedFunctions);
    } else {
      res.json(err);
    }
  })
})

app.post('/clearLog', function(req, res){
  log = [];
  res.json(log);
})


var port = process.env.PORT || 8888
app.listen(port, function() {
    console.log("Informed Consent Gateway running");
});
