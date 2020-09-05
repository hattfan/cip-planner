var express = require('express'),
  router = express.Router(),
  Connection = require('tedious').Connection,
  Request = require('tedious').Request,
  moment = require('moment'),
  config = require('../database/db_config');


router.post("/", function (req, res) {
  connectAndRender(req);
  // res.send(cleaningChoice);
  console.log(req.body)
  res.redirect('filtrering')
})

// app.post('/cleaning', function (req, res) {
//   var cleaningChoice = req.body.cleaningChoice;
//   var backURL = req.header('Referer') || '/';
//   var id = require('mongodb').ObjectID(req.body.objektId);

//   db.collection('cip').find({ '_id': id }).toArray(function (err, cleaningObjekt) {
//     if (err) throw err;
//     var update = cleaningUpdate(cleaningObjekt, cleaningChoice);
//     db.collection('cip').updateOne({ _id: id }, { $set: update }, function (err, result) {
//       if (err) throw err;
//       var insertData = cleaningRegistration(cleaningObjekt, cleaningChoice);
//       insertData['Sign'] = req.body.cleaningSign;
//       db.collection('cip_register').insertOne(insertData, function (err, result) {
//         res.redirect(backURL);
//       })
//     })
//   })
// })


function connectAndRender(req) {
  const connection = new Connection(config);

  connection.on('requestCompleted', function (err) {
    registerCIPObject(req);
  });

  connection.on('debug', function (text) {
  });

  function registerCIPObject(req) {
    var today = moment().format('YYYY-MM-DD').toString();
    var dataEntry = {
      cleaningChoice: req.body.cleaningChoice,
      today: today,
      id: req.body.objektId,
      signature: req.body.cleaningSign,
      cleaningObjectName: req.body.cleaningObjectName,
      cleaningObjectNumber: req.body.cleaningObjectNumber,
      cleaningFrequency: req.body.frequency
    }

    var cipUnits = [];
    // TODO Lägg in frequency som dolt input field
    // function postCleaningIntoCIPRegister(res, dbEntry, connection, cipUnits) {
    request = new Request(`
        UPDATE dbo.cip_objekt 
        SET ${dataEntry.cleaningObjectNumber}LastDate = ${today}, ${dataEntry.cleaningObjectNumber}NextDate = ${today + dataEntry.cleaningFrequency}
        WHERE Id = ${dataEntry.id}`,
      function (err, rowCount) {
        if (err) {
          console.log(err);
        } else {
          console.log('Updated');
          // postCleaningIntoCIPLogg(res, dataEntry, connection, cipUnits);
        }
      });
  }


  var cipUnit = {};
  request.on('row', function (columns) {
    columns.forEach(column => {
      if (column.metadata.colName.indexOf('Date') !== -1) {
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


function postCleaningIntoCIPLogg(res, dbEntry, connection, cipUnits) {
  var cipCleanings = [];
  // request = new Request(`INSERT INTO dbo.cip_logg 
  //   (Objekt,DateTime,Sign,CleaningType) 
  //   VALUES (
  //     cleaningChoice: cleaningChoice,
  //     today: today,
  //     id: id,
  //     signature: signature
  //     ${dbEntry.},
  //     ${},
  //     ${},
  //     ${}

  //     )`,
  //   function (err, rowCount) {
  //     if (err) {
  //       console.log(err);
  //     } else {
  //       res.redirect('filtrering');
  //     }
  //     connection.close();
  //   });

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
