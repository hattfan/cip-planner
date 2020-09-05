# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #  
#? Ändrar lagertankar till will move both # 
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #  

import pymongo

#!Definition of mongo
myclient = pymongo.MongoClient("mongodb://localhost:27017/")
mydb = myclient['carlsberg']
mycol = mydb["cip_logg"]

#!database-findings
dbdata = mycol.find()

# För varje artikel, kör loopen
for row in dbdata:
    if row['Objekt'][:2] == 'LT':
      print(row['Objekt'][:2])
      x = True
    else:
      x = False
    
    # mycol.update_one({'_id': row['_id']},{'$set': {'MoveBothObjects': x}})
        
            # if(row.Objekt[:3])
