var MongoClient = require('mongodb').MongoClient;

async function fetchDatabase() {
  console.log('fetch database called');
  let client, db;
  const databaseURL = 'mongodb://127.0.0.1:27017/?gssapiServiceName=mongodb';
  const database = 'Task';
  const collection = 'foo';

  try {
      client = await MongoClient.connect(databaseURL, {
          useUnifiedTopology: true,
          useNewUrlParser: true
      });
      db = client.db(database);
      let dbCollection = db.collection(collection);

      let data = await dbCollection.find({}).toArray();
      console.log(data);
      console.log(data[0]["tpep_dropoff_datetime"].replace(' ', 'T')+'Z');
      console.log(new Date(data[0]["tpep_dropoff_datetime"].replace(' ', 'T')+'Z'));
     
  }
  catch (err) { console.log(err); }
  finally { client.close(() => console.log('DB close!')); }
}

fetchDatabase();