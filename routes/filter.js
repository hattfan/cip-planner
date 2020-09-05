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
    request = new Request("SELECT * FROM cip_objekt ORDER BY Objekt", function (err, rowCount) {
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

function uniqueValuesInObject(eval) {
  var flags = [], output = [], l = eval.length, i;
  for (i = 0; i < l; i++) {
    if (flags[eval[i].Typ]) continue;
    flags[eval[i].Typ] = true;
    output.push(eval[i].Typ);
  }
  return output;
}
