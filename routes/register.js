var express = require('express'),
  router = express.Router(),
  Connection = require('tedious').Connection,
  Request = require('tedious').Request,
  moment = require('moment'),
  config = require('../database/db_config');


router.get("/", function (req, res) {
  connectAndRender(res);
})

function connectAndRender(res) {
  const connection = new Connection(config);

  connection.on('connect', function (err) {
    getCIPObjekt(res);
  });

  connection.on('debug', function (text) {
  });

  function getCIPObjekt(res) {
    var cipUnits = [];
    request = new Request("SELECT * FROM cip_objekt", function (err, rowCount) {
      if (err) {
        console.log(err);
      } else {
        getCleaning(res, connection, cipUnits);
      }
    });

    var cipUnit = {};
    request.on('row', function (columns) {
      columns.forEach(column => {
        if(column.metadata.colName.indexOf('Date') !== -1){
          cipUnit[column.metadata.colName] = moment(column.value).format('YYYY-MM-DD');
        } else {
          cipUnit[column.metadata.colName] = column.value;
        }
      })
      cipUnits.push(cipUnit);
      cipUnit = {};
    })
    connection.execSql(request);
  }
}

function getCleaning(res,connection, cipUnits) {
  var cipCleanings = [];
  var today = moment().format('YYYY-MM-DD').toString();
  var uniqueVal = uniqueValuesInObject(cipUnits);
  request = new Request("SELECT * FROM cip_logg WHERE DateTime = '2019-01-30' ORDER BY DateTime DESC", function (err, rowCount) {
    if (err) {
      console.log(err);
    } else {
      res.render('filtrering', { moment: moment, dbObjects: cipUnits, uniqueVal: uniqueVal, dbRegisteredCleaning: cipCleanings });

    }
    connection.close();
  });

  var cipUnit = {};
  request.on('row', function (columns) {
    columns.forEach(column => {
      cipUnit[column.metadata.colName] = column.value;
    })
    cipCleanings.push(cipUnit);
    cipUnit = {};
  })
  connection.execSql(request);
}

module.exports = router;

// Update cleaning
  app.post('/cleaning', function (req, res) {
    var cleaningChoice = req.body.cleaningChoice;
    var backURL = req.header('Referer') || '/';

    
function getCleaning(res,connection, cipUnits) {
  var cipCleanings = [];
  var today = moment().format('YYYY-MM-DD').toString();
  var uniqueVal = uniqueValuesInObject(cipUnits);
  request = new Request(`SELECT * FROM cip_objekt WHERE Id=${id}`, function (err, rowCount) {
    if (err) {
      console.log(err);
    } else {
      res.render('filtrering', { moment: moment, dbObjects: cipUnits, uniqueVal: uniqueVal, dbRegisteredCleaning: cipCleanings });

    }
    connection.close();
  });
    db.collection('cip').find({ '_id': id }).toArray(function (err, cleaningObjekt) {
      if (err) throw err;
      var update = cleaningUpdate(cleaningObjekt, cleaningChoice);
      db.collection('cip').updateOne({ _id: id }, { $set: update }, function (err, result) {
        if (err) throw err;
        var insertData = cleaningRegistration(cleaningObjekt, cleaningChoice);
        insertData['Sign'] = req.body.cleaningSign;
        db.collection('cip_register').insertOne(insertData, function (err, result) {
          res.redirect(backURL);
        })
      })
    })
  })
