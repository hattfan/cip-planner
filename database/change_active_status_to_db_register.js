var MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://localhost:27017', (err, client) => {

    var db = client.db('carlsberg');
    db.collection('cip_register').find('').toArray(function (err, data) {
        if (err) throw err;

        data.forEach(row => {
            if(row['Objekt'].replace("BBT","Tank")){
                db.collection('cip_register').update({'Objekt':row['Objekt']}, {$set:{'Objekt':row['Objekt']}},function(err, result){
                    console.log(result)
                })
            }
        });
    })
})
