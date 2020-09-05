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
    if row['Objekt'][:3] == 'BBT':
        x = True
    else:
        x = False
    
    mycol.update_one({'_id': row['_id']},{'$set': {'MoveBothObjects': x}})
        
            # if(row.Objekt[:3])
