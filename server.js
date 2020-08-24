const express = require('express');
const request = require('request');
var GeoJSON = require('geojson');
const Supercluster = require('supercluster');
const cors = require('cors');
var MongoClient = require('mongodb').MongoClient;
const app = express();
app.use(cors());

var port = process.env.PORT || 8000;
let db, dbCollection;
const databaseURL = 'mongodb://127.0.0.1:27017/?gssapiServiceName=mongodb';
const database = 'Task';
const collection = 'taxi_data_new_1';

MongoClient.connect(databaseURL, {
    useUnifiedTopology: true,
    useNewUrlParser: true
},
    (err, client) => {
        if (err) return err;

        console.log('Open database connection!');
        db = client.db(database);
        dbCollection = db.collection(collection);

        app.listen(port, () => {
            console.log('Listen to port ' + port);
        });
    });



app.get('/getdata', (req, res) => {
    //db.executeDbAdminCommand({ currentOp: { localOps: true }, op: 'query' }, function (err, cb) { console.log(cb);});

    const box = {
        bounds: JSON.parse(req.query.bounds),
        zoomLevel: JSON.parse(req.query.zoomLevel)
    };

    fetchDatabase(box)
        .then(queryResult => {
            let geoData = queryResult.map(d => {
                return { lng: d.loc[0], lat: d.loc[1] }
            });

            let geoJSONData = GeoJSON.parse(geoData, { Point: ['lat', 'lng'] });

            const index = new Supercluster({
                radius: 100,
                maxZoom: 16
            });

            index.load(geoJSONData.features);

            const bbox = [box.bounds._southWest.lng, box.bounds._southWest.lat, box.bounds._northEast.lng, box.bounds._northEast.lat];

            let clusterMarkers = index.getClusters(bbox, box.zoomLevel);

            res.json({ clusters: clusterMarkers });
            console.log('Send response!');
        })
},
    (error) => {
        console.log(error);
    }
);


async function fetchDatabase(box) {

    console.log('fetch database called');
    console.log(box.bounds);
    const geoQuery = {
        loc: {
            $geoWithin: {
                $box: [
                    [box.bounds._southWest.lng, box.bounds._southWest.lat],
                    [box.bounds._northEast.lng, box.bounds._northEast.lat]
                ]
            }
        }
    };

    dbCollection.createIndex({ loc: "2dsphere" });
    let queryResult = await dbCollection.find(geoQuery, { loc: 1 }).hint("loc_2dsphere").limit(100000).toArray();
    // let queryResult = await dbCollection.find(geoQuery, { loc: 1 }).hint("loc_2dsphere").explain().winningPlan;
    
    console.log(queryResult);

    return await queryResult;
}

