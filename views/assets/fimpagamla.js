var express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  MongoClient = require('mongodb').MongoClient,
  mongo = require('mongodb'),
  moment = require('moment');

  MongoClient.connect('mongodb://ola:Neroxrox5(@ds243897.mlab.com:43897/cip-planner', (err, client) => {

  var db = client.db('cip-planner');
  var today = moment('2020-01-01').format('YYYY-MM-DD').toString();

  db.collection('cip_logg').find('').toArray(function (err, dbObjects) {

    dbObjects.forEach(row => {
      if(moment(row.DateTime) < moment(today)){
        var myquery = { _id: row._id };
        console.log('tog bort ' + row.DateTime);
        
        db.collection("cip_logg").deleteOne(myquery, function(err, obj) {
        });
      }
    })
  })
})