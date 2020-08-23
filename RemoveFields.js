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

        var ops = [];

        //No longer need lon and lat columns
        await dbCollection.find().forEach(async function (x) {
            ops.push({
                "updateOne": {
                    "filter": { "_id": x._id },
                    "update": {
                        "$unset": { pickup_longitude:"", pickup_latitude:"" }
                    }
                }
            });


            if (ops.length === 500) {
                await dbCollection.bulkWrite(ops);
                ops = [];
            }
        })

        if (ops.length > 0)
            await dbCollection.bulkWrite(ops);

    }
    catch (err) { console.log(err); }
    finally { client.close(() => console.log('DB close!')); }
}

fetchDatabase();
