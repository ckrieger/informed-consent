var express = require("express");
var app = express();
var cfenv = require("cfenv");
var bodyParser = require('body-parser')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

var cloudant, mydb;


app.post('/initDB', function(request, response) {
  var doc = { "functionID" :"CheckTankStatus" };
  if(!mydb) {
    console.log("No database.");
    response.send("no db")
    return;
  }
  // insert in db
  mydb.insert(doc, function(err, body, header) {
    if (err) {
      console.log('[mydb.insert] ', err.message);
      response.send("Error" + err.message);
      return;
    }
    doc._id = body.id;
    response.send(doc);
  });
})


app.post('/', function(req, res) {
  var allowedFunctions = [];
  if(!mydb) {
    response.send("No database");
    return;
  }
  // check consent 
  mydb.list({ include_docs: true}, function(err, body){
    if (!err){
      body.rows.forEach(function(row){
        allowedFunctions.push(row.doc);
      })
      res.json(allowedFunctions);
    } else {
      res.json(err);
    }
  })
})

app.post('/checkConsent', function(req, res) {
  var dataType = req.body.dataType;
  var data = req.body.data;
  mydb.find({selector:{'dataType': dataType}}, function(er, result) {
    if (er) {
      throw er;
    }
    if(result.docs.length > 0){
      result.docs.forEach(doc => console.log(`forward data of Type ${doc.dataType} to ${doc.recipient}`));
      res.json(`forwarded data to ${result.docs.length} recipients`)
    } else {
      res.json('did not forward data')
    }
  });
})

// load local VCAP configuration  and service credentials
var vcapLocal;
try {
  vcapLocal = require('./vcap-local.json');
  console.log("Loaded local VCAP", vcapLocal);
} catch (e) { }

const appEnvOpts = vcapLocal ? { vcap: vcapLocal} : {}

const appEnv = cfenv.getAppEnv(appEnvOpts);

// Load the Cloudant library.
var Cloudant = require('@cloudant/cloudant');
if (appEnv.services['cloudantNoSQLDB'] || appEnv.getService(/cloudant/)) {

  // Initialize database with credentials
  if (appEnv.services['cloudantNoSQLDB']) {
    // CF service named 'cloudantNoSQLDB'
    cloudant = Cloudant(appEnv.services['cloudantNoSQLDB'][0].credentials);
  } else {
     // user-provided service with 'cloudant' in its name
     cloudant = Cloudant(appEnv.getService(/cloudant/).credentials);
  }
} else if (process.env.CLOUDANT_URL){
  cloudant = Cloudant(process.env.CLOUDANT_URL);
}
if(cloudant) {
  //database name
  var dbName = 'mydb';

  // Create a new "mydb" database.
  cloudant.db.create(dbName, function(err, data) {
    if(!err) //err if database doesn't already exists
      console.log("Created database: " + dbName);
  });

  // Specify the database we are going to use (mydb)...
  mydb = cloudant.db.use(dbName);
}

var port = process.env.PORT || 8888
app.listen(port, function() {
    console.log("Informed Consent Gateway running");
});
