var MongoClient = require('mongodb').MongoClient;

async function fetchDatabase() {
  console.log('fetch database called');
  let client, db;
  const databaseURL = 'mongodb://127.0.0.1:27017/?gssapiServiceName=mongodb';
  const database = 'Task';
  const collection = 'taxi_data_new';

  try {
      client = await MongoClient.connect(databaseURL, {
          useUnifiedTopology: true,
          useNewUrlParser: true
      });
      db = client.db(database);
      let dbCollection = db.collection(collection);

      const geoQuery = {
        loc: { $geoWithin: { $box:  [ 
          [ -73.02823925018312, 40.73610423919209 ],
          [ -74.95957469940187, 40.7640963068463 ]
          ] } }}

      // dbCollection.createIndex({loc:"2dsphere"});
      let queryResult = await dbCollection.find(geoQuery).limit(10000000).toArray();
       console.log(queryResult.length);
      // dbCollection.dropIndexes(); 


  }
  catch (err) { console.log(err); }
  finally { client.close(() => console.log('DB close!')); }
}

fetchDatabase();
