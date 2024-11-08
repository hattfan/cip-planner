var express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  mongo = require('mongodb'),
  moment = require('moment'),
  config = require('./database/db_config');

require('dotenv').config()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/views'));
app.set('view engine', 'ejs');

const { MongoClient } = require('mongodb');

MongoClient.connect("mongodb+srv://ola:CL5QYRBR7qITFsVQ@cluster0.vsoyuhh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", { poolSize: 100 }, (err, client) => {  
  console.log(err);
  const db = client.db("cip")
  var today = moment().format('YYYY-MM-DD').toString();

  app.get('/alive', function (req, res) {
    res.send('stayin alive');
  })

  app.get('/', function (req, res) {
    var cleanedObject;
    req.query.cleanedobject ? cleanedObject = req.query.cleanedobject : cleanedObject = false;

    db.collection('cip_register').find('').sort({ 'Objekt': 1 }).toArray(function (err, dbObjects) {
      if (err) throw err;
      var today = moment().format('YYYY-MM-DD').toString();
      var thisTime = moment().format();
      if (cleanedObject.length > 0) {
        db.collection('cip_logg').find({ 'Objekt': cleanedObject }).limit(1).sort({ 'DateTime': -1 }).toArray(function (err, lastRegisteredCleaning) {
          if (err) throw err;
          if (lastRegisteredCleaning.length > 0) {
            var now = new moment(moment().format())
            var lastCleanedTime = new moment(lastRegisteredCleaning[0]['DateTime'])
            var duration = moment.duration(now.diff(lastCleanedTime))
            if (duration.asSeconds() > 10) cleanedObject = null;
          } else {
            cleanedObject = null;
          }

          db.collection('cip_logg').find({ 'Date': today }).toArray(function (err, dbRegisteredCleaning) {
            if (err) throw err;
            var uniqueVal = uniqueValuesInObject(dbObjects);
            res.render('filtrering', { moment: moment, dbObjects: dbObjects, uniqueVal: uniqueVal, dbRegisteredCleaning: dbRegisteredCleaning, cleanedObject: cleanedObject });
          })
        })
      } else {
        db.collection('cip_logg').find({ 'Date': today }).toArray(function (err, dbRegisteredCleaning) {
          if (err) throw err;
          var uniqueVal = uniqueValuesInObject(dbObjects)
          res.render('filtrering', { moment: moment, dbObjects: dbObjects, uniqueVal: uniqueVal, dbRegisteredCleaning: dbRegisteredCleaning, cleanedObject: cleanedObject });
        })
      }
    });
  });



  // Update cleaning
  app.post('/cleaning', function (req, res) {
    var cleaningChoice = req.body.cleaningChoice;
    var backURL = req.header('Referer') || '/';
    var changedURL = backURL.indexOf('?') > 0 ? backURL.substr(0, backURL.indexOf('?')) : backURL;
    var id = require('mongodb').ObjectID(req.body.objektId);

    //Exception for recovery beer tanks
    if (req.body.objektId === "5cee696cb65fe65628f25acf") {
      //console.log('Cleaning of T45 & T321 tillsammans');
      var tank45 = require('mongodb').ObjectID("5cee696cb65fe65628f25ab9");
      db.collection('cip_register').find({ '_id': tank45 }).toArray(function (err, cleaningObjekt) {
        if (err) throw err;
        var update = cleaningUpdate(cleaningObjekt, cleaningChoice);

        db.collection('cip_register').updateOne({ _id: tank45 }, { $set: update }, function (err, result) {
          if (err) throw err;
          var insertData = cleaningRegistration(cleaningObjekt, cleaningChoice);
          insertData['Sign'] = req.body.cleaningSign;
          db.collection('cip_logg').insertOne(insertData, function (err, result) {
            // console.log(changedURL);
            var tank321 = require('mongodb').ObjectID("5cee696cb65fe65628f25ab2");

            db.collection('cip_register').find({ '_id': tank321 }).toArray(function (err, cleaningObjekt) {
              if (err) throw err;
              var update = cleaningUpdate(cleaningObjekt, cleaningChoice);
              db.collection('cip_register').updateOne({ _id: tank321 }, { $set: update }, function (err, result) {
                if (err) throw err;

                var insertData = cleaningRegistration(cleaningObjekt, cleaningChoice);
                insertData['Sign'] = req.body.cleaningSign;
                db.collection('cip_logg').insertOne(insertData, function (err, result) {
                  // console.log(changedURL);
                  res.redirect(changedURL + `?cleanedobject=T45 & T321 tillsammans`);
                });
              });
            });
          });
        })
      })

    } else {
      db.collection('cip_register').find({ '_id': id }).toArray(function (err, cleaningObjekt) {
        if (err) throw err;
        var update = cleaningUpdate(cleaningObjekt, cleaningChoice);
        db.collection('cip_register').updateOne({ _id: id }, { $set: update }, function (err, result) {
          if (err) throw err;

          var insertData = cleaningRegistration(cleaningObjekt, cleaningChoice);
          insertData['Sign'] = req.body.cleaningSign;
          db.collection('cip_logg').insertOne(insertData, function (err, result) {
            // console.log(changedURL);
            res.redirect(changedURL + `?cleanedobject=${insertData['Objekt']}`);
          });
        });
      });
    }
  });


  app.post('/emailtoola', function (req, res) {
    var backURL = req.header('Referer') || '/';
    var changedURL = backURL.indexOf('?') > 0 ? backURL.substr(0, backURL.indexOf('?')) : backURL;
    var id = require('mongodb').ObjectID("5d1367eb7f0cb11e58a12abb");
    db.collection('cip_register').updateOne({ "_id": id }, {
      $set:
      {
        "Cleaning1LastDate": today,
        "Cleaning1NextDate": moment(today).add('days', 30).format('YYYY-MM-DD')
      }
    }, function (err, result) {

      if (err) throw err;
      var insertData = {
        Sign: "seanyone",
        DateTime: moment().format(),
        Date: moment().format('YYYY-MM-DD'),
        Objekt: "Skicka hur läget på bryggeriet är till Ola",
        CleaningType: "Maila"
      };

      db.collection('cip_logg').insertOne(insertData, function (err, result) {
        if (err) throw err;
        res.redirect(changedURL + `?cleanedobject=Mailat Ola, wohooo`);
      });
    });
  });


  /*=============================================
  =                    Admin                    =
  =============================================*/

  app.get('/admin', function (req, res) {
    db.collection('cip_register').find('').sort({ 'Objekt': 1 }).toArray(function (err, dbObjects) {
      if (err) throw err;

      var uniqueKeys = Object.keys(dbObjects.reduce(function (result, obj) {
        return Object.assign(result, obj);
      }, {}))

      res.render('admin', { uniqueKeys: uniqueKeys, moment: moment, dbObjects: dbObjects });
    })
  })

  app.get('/admintable', function (req, res) {
    db.collection('cip_register').find('').sort({ 'Objekt': 1 }).toArray(function (err, dbObjects) {
      if (err) throw err;

      var uniqueKeys = Object.keys(dbObjects.reduce(function (result, obj) {
        return Object.assign(result, obj);
      }, {}))

      res.render('admin_datatables', { uniqueKeys: uniqueKeys, moment: moment, dbObjects: dbObjects });
    })
  })

  app.get('/admintabledata', function (req, res) {
    db.collection('cip_register').find('').sort({ 'Objekt': 1 }).toArray(function (err, dbObjects) {
      if (err) throw err;
      res.json(dbObjects);
    })
  })

  app.post('/undo', function (req, res) {
    var backURL = req.header('Referer') || '/';
    var changedURL = backURL.indexOf('?') > 0 ? backURL.substr(0, backURL.indexOf('?')) : backURL;
    //1. Hitta senaste 2 rengöringarna
    console.log(req.body)
    db.collection('cip_logg')
      .find({ $and: [{ 'Objekt': req.body['objekt-namn-undo'] }, { 'CleaningType': req.body['cleaning-type-undo'] }] })
      .sort({ 'DateTime': -1 })
      .limit(2).toArray(function (err, loggResult) {
        console.log(loggResult)
        if (err) throw err;
        //*******************************        

        //2. DELETE:a senaste ifrån loggen
        db.collection('cip_logg')
          .deleteOne({ '_id': loggResult[0]['_id'] }, function (err, deleteCb) {
            if (err) throw err;
            //*******************************        

            //3. Sätt datum på registret till näst senaste
            //Hämtar data ifrån registret
            db.collection('cip_register').find({ 'Objekt': req.body['objekt-namn-undo'] }).toArray(function (err, registerResult) {
              if (err) throw err;

              //Uppdateraderar registrets datum
              if (registerResult[0].Cleaning1 === req.body['cleaning-type-undo']) {
                //! Problem
                var update = {
                  "Cleaning1LastDate": loggResult[1]['Date'],
                  "Cleaning1NextDate": moment(loggResult[1]['Date']).add('days', registerResult[0].Cleaning1Frequency).format('YYYY-MM-DD')
                }
              }
              else if (registerResult[0].Cleaning2 === req.body['cleaning-type-undo']) {
                //! Problem
                var update = {
                  "Cleaning2LastDate": loggResult[1]['Date'],
                  "Cleaning2NextDate": moment(loggResult[1]['Date']).add('days', registerResult[0].Cleaning2Frequency).format('YYYY-MM-DD')
                }
              }
              db.collection('cip_register').updateOne({ 'Objekt': req.body['objekt-namn-undo'] }, { $set: update }, function (err, updateRes) {
                if (err) throw err

                //4. Utvärdera om Cleaning 1 flyttades pga Cleaning 2 gjordes
                if (registerResult[0].Cleaning2 === req.body['cleaning-type-undo'] && registerResult[0].MoveBothObjects === 'TRUE') {
                  //Om det är sant hitta föregående CIP-datum för Cleaning 1
                  db.collection('cip_logg').find({ $and: [{ 'Objekt': req.body['objekt-namn-undo'] }, { 'CleaningType': registerResult[0].Cleaning1 }] })
                    .sort({ 'DateTime': -1 })
                    .limit(1)
                    .toArray(function (err, moveBothResults) {
                      if (moveBothResults.length > 0) {
                        var update = {
                          "Cleaning1LastDate": moveBothResults[0]['Date'],
                          "Cleaning1NextDate": moment(moveBothResults[0]['Date']).add('days', registerResult[0].Cleaning1Frequency).format('YYYY-MM-DD')
                        }
                        db.collection('cip_register').updateOne({ 'Objekt': req.body['objekt-namn-undo'] }, { $set: update }, function (err, updateRes) {
                          if (err) throw err
                        })
                      }
                      res.redirect(changedURL);
                    })
                }

                else {
                  res.redirect(changedURL);
                }
              })
            })
          })
      })
  })

  app.get('/admin/getObjectData/:id', function (req, res) {

    db.collection('cip_register').find().toArray(function (err, dbObject) {
      if (err) throw err;
      res.json(dbObject);
    })
  })

  app.get('/admin/getDistinctData', function (req, res) {
    db.collection('cip_register').find().toArray(function (err, dbObject) {
      if (err) throw err;
      res.json(dbObject);
    })
  })

  app.get('/admin/gethistorikdata', function (req, res) {
    db.collection('cip_logg').find().toArray(function (err, dbObject) {
      if (err) throw err;
      res.json(dbObject);
    })
  })

  app.get('/historik', function (req, res) {
    db.collection('cip_register').find().sort({ 'Objekt': 1 }).toArray(function (err, result) {
      if (err) throw err;
      db.collection('cip_register').distinct('Area', function (err, distinctAreas) {
        res.render("historik", { result: result, distinctAreas: distinctAreas });
      })
    })
  })

  app.get('/historikspecific', function (req, res) {
    db.collection('cip_logg').find({ 'Objekt': req.query.objekt }).sort({ 'DateTime': -1 }).toArray(function (err, registerResult) {
      if (err) throw err;
      db.collection('cip_register').find().toArray(function (err, loggResult) {
        if (err) throw err;
        res.render("historikspecific", { moment: moment, registerResult: registerResult, loggResult: loggResult });
      })
    })
  })

  app.post('/admin/newObject', function (req, res) {
    var newValues = req.body.newValues;
    var date = moment(newValues.Cleaning1LastDate, 'YYYY-MM-DD').toDate();
    var Cleaning1NextDate = moment(date, "YYYY-MM-DD").add('days', newValues.Cleaning1Frequency).format('YYYY-MM-DD');
    newValues['Cleaning1NextDate'] = Cleaning1NextDate;
    if (newValues.Cleaning2LastDate.length > 0 && newValues.Cleaning2Frequency.length > 0) {
      var date = moment(newValues.Cleaning2LastDate, 'YYYY-MM-DD').toDate();
      var Cleaning2NextDate = moment(date, "YYYY-MM-DD").add('days', newValues.Cleaning2Frequency).format('YYYY-MM-DD');
      newValues['Cleaning2NextDate'] = Cleaning2NextDate;
    } else {
      newValues['Cleaning2NextDate'] = '';
    }
    db.collection('cip_register').insertOne(newValues, function (err, result) {
      if (err) throw err;
      res.redirect('/admin');
    })
  })

  app.post('/admin/changeObject', function (req, res) {
    var inputValues = req.body.inputValues;
    var o_id = new mongo.ObjectId(req.body.objektId);
    db.collection('cip_register').updateOne({ _id: o_id }, { $set: inputValues }, function (err, result) {
      if (err) throw err;
      res.redirect('/admin');
    })
  })

  app.post('/admin/deleteObject', function (req, res) {
    var o_id = new mongo.ObjectId(req.body['objektId-delete']);
    db.collection('cip_register').deleteOne({ "_id": o_id }, function (err, result) {
      if (err) throw err;
      res.redirect('/admin');
    })
  })
  /*=====  End of Admin  ======*/
})



//!OBS
var port = process.env.PORT || 3031;
// var port = process.env.PORT || 3032;

app.listen(port, process.env.IP, function () {
  var appConsoleMsg = 'Hemsidan startad: ';
  appConsoleMsg += process.env.IP + ':' + port;
  console.log(appConsoleMsg);
});



function uniqueValuesInObject(eval) {
  var flags = [], output = [], l = eval.length, i;
  for (i = 0; i < l; i++) {
    if (flags[eval[i].Typ]) continue;
    flags[eval[i].Typ] = true;
    output.push(eval[i].Typ);
  }
  return output;
}

function cleaningUpdate(cleaningObjekt, cleaningChoice) {

  var cleaningOptions = ['Cleaning1', 'Cleaning2'], update = {}, cleaningDates = ['Cleaning1LastDate', 'Cleaning2LastDate'],
    cleaningNextDates = ['Cleaning1NextDate', 'Cleaning2NextDate'], cleaningFrequencies = ['Cleaning1Frequency', 'Cleaning2Frequency'];

  // Sätt dagens datum till 
  for (let i = 0; i < cleaningOptions.length; i++) {
    // Lägg till dagens datum för valt cleaningOption
    if (cleaningObjekt[0][cleaningOptions[i]] === cleaningChoice) {
      update[cleaningDates[i]] = moment().format('YYYY-MM-DD');
      // Adderar frequency till dagens datum, för att definiera nästa rengöringsdatum
      update[cleaningNextDates[i]] = moment().add(cleaningObjekt[0][cleaningFrequencies[i]], 'days').format('YYYY-MM-DD');
    }
  }
  // Om objektet har MoveBothObject och disken är en lutdisk skall syradisk även flyttas fram med Frequency
  if (cleaningObjekt[0].MoveBothObjects === true || cleaningObjekt[0].MoveBothObjects === 'TRUE') {
    if (cleaningChoice === "Lutdisk") {
      update[cleaningDates[0]] = moment().format('YYYY-MM-DD');
      // Adderar frequency till dagens datum, för att definiera nästa rengöringsdatum
      update[cleaningNextDates[0]] = moment().add(cleaningObjekt[0][cleaningFrequencies[0]], 'days').format('YYYY-MM-DD');
    }
  }
  return update;
}


function cleaningRegistration(cleaningObjekt, cleaningChoice) {

  var insert = {
    DateTime: moment().format(),
    Date: moment().format('YYYY-MM-DD'),
    Objekt: cleaningObjekt[0].Objekt,
    CleaningType: cleaningChoice
  }

  return insert;
}