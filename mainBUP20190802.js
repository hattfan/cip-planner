var express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  MongoClient = require('mongodb').MongoClient,
  mongo = require('mongodb'),
  moment = require('moment'),
  config = require('./database/db_config');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/views'));
app.set('view engine', 'ejs');

MongoClient.connect('mongodb://localhost:27017', (err, client) => {

  var db = client.db('cip_logg');

  app.get('/', function (req, res) {
    res.render('index')
  })

  app.get('/filtrering', function (req, res) {
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

  app.get('/cellar', function (req, res) {
    var cleanedObject;
    req.query.cleanedobject ? cleanedObject = req.query.cleanedobject : cleanedObject = false;

    db.collection('cip_register').find('').sort({ 'Objekt': 1 }).toArray(function (err, dbObjects) {
      if (err) throw err;
      var today = moment().format('YYYY-MM-DD').toString();
      if (cleanedObject.length > 0) {
        db.collection('cip_logg').find({ 'Objekt': cleanedObject }).limit(1).sort({ 'DateTime': -1 }).toArray(function (err, lastRegisteredCleaning) {
          if (err) throw err;

          var now = new moment(moment().format())
          var lastCleanedTime = new moment(lastRegisteredCleaning[0]['DateTime'])
          var duration = moment.duration(now.diff(lastCleanedTime))
          if (duration.asSeconds() > 10) cleanedObject = null;

          db.collection('cip_logg').find({ 'Date': today }).toArray(function (err, dbRegisteredCleaning) {
            if (err) throw err;
            var uniqueVal = uniqueValuesInObject(dbObjects)
            res.render('cellar', { moment: moment, dbObjects: dbObjects, uniqueVal: uniqueVal, dbRegisteredCleaning: dbRegisteredCleaning, cleanedObject: cleanedObject });
          })
        })
      } else {
        db.collection('cip_logg').find({ 'Date': today }).toArray(function (err, dbRegisteredCleaning) {
          if (err) throw err;
          var uniqueVal = uniqueValuesInObject(dbObjects)
          res.render('cellar', { moment: moment, dbObjects: dbObjects, uniqueVal: uniqueVal, dbRegisteredCleaning: dbRegisteredCleaning, cleanedObject: cleanedObject });
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
    console.log('FLYTTAR BÄGGE');
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


/*=============================================
=            SQL implementation            =
=============================================*/


// use routes
// app.use("/", indexRoute);
// app.use("/filtrering", filterRoute);
// // async..await is not allowed in global scope, must use a wrapper
// async function main(){

//   // Generate test SMTP service account from ethereal.email
//   // Only needed if you don't have a real mail account for testing
//   let account = await nodemailer.createTestAccount();

//   // create reusable transporter object using the default SMTP transport
//   let transporter = nodemailer.createTransport({
//     host: "smtp.ethereal.email",
//     port: 587,
//     secure: false, // true for 465, false for other ports
//     auth: {
//       user: account.user, // generated ethereal user
//       pass: account.pass // generated ethereal password
//     }
//   });

//   // setup email data with unicode symbols
//   let mailOptions = {
//     from: '"Fred Foo 👻" <foo@example.com>', // sender address
//     to: "ola.anders.karlsson@gmail.com", // list of receivers
//     subject: "Hello ✔", // Subject line
//     text: "Hello world?", // plain text body
//     html: "<b>Hello world?</b>" // html body
//   };

//   // send mail with defined transport object
//   let info = await transporter.sendMail(mailOptions)

//   console.log("Message sent: %s", info.messageId);
//   // Preview only available when sending through an Ethereal account
//   console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
// Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
// }

// main().catch(console.error);


/*=====  End of SQL implementation  ======*/
