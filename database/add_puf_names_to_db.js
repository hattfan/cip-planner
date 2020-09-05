var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://localhost:27017', (err, client) => {

    var db = client.db('cip_logg');
    db.collection('cip_logg').find('').toArray(function (err, data) {
        if (err) throw err;

        var dbInsert = [];

        data.forEach(row => {

            if (test[row['Objekt']]) {
                row['PufNamn'] = test[row['Objekt']];
                dbInsert.push(row);
            }
            else {
                row['PufNamn'] = "";
                dbInsert.push(row);
            }

        });

        db.collection('cip_logg_puf').insert(dbInsert, function (err, res) {
            if (err) throw err
            console.log(res);
        })

        //console.log(dbInsert);


    })
})

var test = {
    '303 Vattentank': 'SUB_OBJECT=303',
    'BBT 304': 'SUB_OBJECT=304',
    'BBT 305': 'SUB_OBJECT=305',
    'BBT 306': 'SUB_OBJECT=306',
    'BBT 307': 'SUB_OBJECT=307',
    'BBT 308': 'SUB_OBJECT=308',
    '301 Vattentank': 'SUB_OBJECT=301',
    'BBT 310': 'SUB_OBJECT=310',
    'BBT 309': 'SUB_OBJECT=309',
    'BBT 311': 'SUB_OBJECT=311',
    'BBT 312': 'SUB_OBJECT=312',
    'BBT 313': 'SUB_OBJECT=313',
    'BBT 314': 'SUB_OBJECT=314',
    'BBT 315': 'SUB_OBJECT=315',
    'BBT 317': 'SUB_OBJECT=317',
    'BBT 318': 'SUB_OBJECT=318',
    'BBT 319': 'SUB_OBJECT=319',
    'BBT 320': 'SUB_OBJECT=320',
    'BBT 321': 'SUB_OBJECT=321',
    'BBT 322': 'SUB_OBJECT=322',
    'BBT 323': 'SUB_OBJECT=323',
    '302 Vattentank': 'SUB_OBJECT=',
    'BBT 324': 'SUB_OBJECT=324',
    'Filtret Sterilning': 'OBJECT=LK%20Filterlinje',
    'BBT 325': 'SUB_OBJECT=325',
    'T34': 'OBJECT=LK%20Tank%2034',
    'T45': 'OBJECT=LK%20Tank%2045',
    'Maltax': '',
    'Filtret-Veckoavslut': '',
    'Kontrollera BBT:er i Citect': '',
    'Gurtank T66': '',
    'Aldox': '',
    'Gurtank T67': '',
    'Gurtank T68': '',
    'Rengör avloppsrännor jäskällaren': '',
    'Vattenfilter': '',
    'Lilla balanssystemet (2)': '',
    'Balanssystemet jäskällaren': '',
    'Kolsyraledning': '',
    'Byt ut gula rengöringsverktyg (Filtrering)': '',
    'Stora balanssystemet (1)': '',
    'BBT 316': '',
    'Byt ut blåa rengöringsverktyg (Filtrering)': '',
    'Byt ut blåa rengöringsverktyg (Brygghuset)': '',
    'Byt ut gula rengöringsverktyg (Brygghuset)': '',
    'CIP av 321 och 45 Tillsammans': '',
    'Byte av filterpatroner': '',
    'LT 01': 'SUB_OBJECT=01',
    'LT 03': 'SUB_OBJECT=03',
    'LT 02': 'SUB_OBJECT=02',
    'LT 05': 'SUB_OBJECT=05',
    'LT 06': 'SUB_OBJECT=06',
    'LT 04': 'SUB_OBJECT=04',
    'LT 07': 'SUB_OBJECT=07',
    'Byt ut gula rengöringsverktyg (Jäskällaren)': '',
    'LT 09': 'SUB_OBJECT=09',
    'LT 08': 'SUB_OBJECT=08',
    'LT 10': 'SUB_OBJECT=10',
    'Byt ut blåa rengöringsverktyg (Jäskällaren)': '',
    'LT 12': 'SUB_OBJECT=12',
    'LT 13': 'SUB_OBJECT=13',
    'LT 14': 'SUB_OBJECT=14',
    'LT 15': 'SUB_OBJECT=15',
    'LT 16': 'SUB_OBJECT=16',
    'LT 21': 'SUB_OBJECT=21',
    'LT 11': 'SUB_OBJECT=11',
    'LT 25': 'SUB_OBJECT=25',
    'LT 22': 'SUB_OBJECT=22',
    'LT 26': 'SUB_OBJECT=26',
    'LT 27': 'SUB_OBJECT=27',
    'LT 28': 'SUB_OBJECT=28',
    'LT 23': 'SUB_OBJECT=23',
    'LT 29': 'SUB_OBJECT=29',
    'LT 30': 'SUB_OBJECT=30',
    'LT 24': 'SUB_OBJECT=24',
    'LT 32': 'SUB_OBJECT=32',
    'LT 33': 'SUB_OBJECT=33',
    'LT 34': 'SUB_OBJECT=34',
    'Byt ut gula rengöringsverktyg (Jäskällaren)': '',
    'JT 51': 'SUB_OBJECT=51',
    'Byt ut blåa rengöringsverktyg (Jäskällaren)': '',
    'LT 31': 'SUB_OBJECT=31',
    'JT 53': 'SUB_OBJECT=53',
    'JT 52': 'SUB_OBJECT=52',
    'JT 57': 'SUB_OBJECT=57',
    'JT 56': 'SUB_OBJECT=56',
    'JT 58': 'SUB_OBJECT=58',
    'JT 54': 'SUB_OBJECT=54',
    'JT 59': 'SUB_OBJECT=59',
    'JT 61': 'SUB_OBJECT=61',
    'JT 60': 'SUB_OBJECT=60',
    'JT 62': 'SUB_OBJECT=62',
    'JT 63': 'SUB_OBJECT=63',
    'JT 64': 'SUB_OBJECT=64',
    'JT 55': 'SUB_OBJECT=55',
    'JT 65': 'SUB_OBJECT=65',
    'JT 67': 'SUB_OBJECT=67',
    'JT 66': 'SUB_OBJECT=66',
    'JT 68': 'SUB_OBJECT=68',
    'JT 69': 'SUB_OBJECT=69',
    'JT 70': 'SUB_OBJECT=70',
    'JT 71': 'SUB_OBJECT=71',
    'JT 73': 'SUB_OBJECT=73',
    'JT 72': 'SUB_OBJECT=72',
    'JT 74': 'SUB_OBJECT=74',
    'JT 75': 'SUB_OBJECT=75',
    'JT 76': 'SUB_OBJECT=76',
    'JT 77': 'SUB_OBJECT=77',
    'JT 79': 'SUB_OBJECT=79',
    'JT 82': 'SUB_OBJECT=82',
    'JT 84': 'SUB_OBJECT=84',
    'Balanssystemet': '',
    'JT 78': 'SUB_OBJECT=78',
    'Disk av sockermottagningen': '',
    'JT 83': 'SUB_OBJECT=83',
    'Nya rundkörningen': '',
    'Rundkörningen jästledning': '',
    'Rengöring av Lundin': '',
    'Silar i sockermottagningen (2st)': '',
    'Nybered balja gång 2 & mellangång': '',
    'Rensa gångar på pumpar & slangar': '',
    'Rengör pumpar & slangar': '',
    'Kalibrera & Rengör Anton Paar': '',
    'Byta luftfilter försörjningsluft JB': '',
    'Byta luftfilter jästbehållare': '',
    'Rengöring Maltgropen': '',
    'Rengöring Maltsilo 1': '',
    'Rengöring Maltsilo 2': '',
    'Rengöring Maltsilo 3': '',
    'Gamla rundkörningen': '',
    'Rengöring Maltsilo 4': ''
}