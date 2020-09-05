
// /*----------  Schedueler  ----------*/
// var j = schedule.scheduleJob('20 * * * * *', function () {
//   MongoClient.connect('mongodb://localhost:27017', (err, client) => {
//     emailLateCleanings(client);
//   })
// });
/*----------  //Schedueler  ----------*/

function emailLateCleanings(client) {
  var db = client.db('carlsberg');
  db.collection('cip').find().sort({ 'Area': 1 }).toArray(function (err, res) {
    res.forEach(row => {
      if (row.Cleaning1NextDate < moment().format('YYYY-MM-DD') || row.Cleaning1NextDate < moment().format('YYYY-MM-DD')) {
        if (row.WillBeEmailed === true || row.WillBeEmailed === 'true') {
          console.log(row.Objekt + ' - ' + row.Area + ' - is delayed');
        }
      }
    })
  })
}