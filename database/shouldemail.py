# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #  
#? Uppdaterar MongoDB med vilken typ av objekt, för att veta om lutdisk skall flytta fram syradisk # 
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #  

import pymongo

#!Definition of mongo
myclient = pymongo.MongoClient("mongodb://localhost:27017/")
mydb = myclient['carlsberg']
mycol = mydb["cip"]

#!database-findings
dbdata = mycol.find()

# För varje artikel, kör loopen
for row in dbdata:
    print(row['Objekt'][:3])
    if row['Objekt'][:2] == 'LT' or row['Objekt'][:2] == 'JT' or row['Objekt'][:3] == 'BBT' :
        x = False
    else:
        x = True
    
    mycol.update_one({'_id': row['_id']},{'$set': {'WillBeEmailed': x}})
        
            # if(row.Objekt[:3])
