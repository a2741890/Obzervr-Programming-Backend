const express = require('express');
const request = require('request');
var GeoJSON = require('geojson');
const Supercluster = require('supercluster');
const cors = require('cors');
var MongoClient = require('mongodb').MongoClient;
const app = express();
app.use(cors());

app.get('/getdata', (req, res) => {

    const box = {
        bounds: JSON.parse(req.query.bounds),
        zoomLevel: JSON.parse(req.query.zoomLevel)
    };
    const currentViewBoundingBox = {
        topLeft: { lat: box.bounds._northEast.lat, lon: box.bounds._southWest.lng },
        bottomRight: { lat: box.bounds._southWest.lat, lon: box.bounds._northEast.lng }
    }


    fetchDatabase(currentViewBoundingBox, box)
        .then(result => {
            res.json({clusters: result});
        })
},
    (error) => {
        console.log(error);
    }
);


async function fetchDatabase(boundingBox, box) {
    console.log('fetch database called');
    let client, db;
    const databaseURL = 'mongodb://127.0.0.1:27017/?gssapiServiceName=mongodb';
    const database = 'Task';
    const collection = 'taxi_data2';

    try {
        client = await MongoClient.connect(databaseURL, {
            useUnifiedTopology: true,
            useNewUrlParser: true
        });
        db = client.db(database);
        let dbCollection = db.collection(collection);

        const query = {
            $and: [
                {
                    pickup_latitude: {
                        $gte: boundingBox.bottomRight.lat,
                        $lte: boundingBox.topLeft.lat
                    }
                },
                {
                    pickup_longitude: {
                        $gte: boundingBox.topLeft.lon,
                        $lte: boundingBox.bottomRight.lon
                    }
                }
            ]
        };
        let queryResult = await dbCollection.find(query, { _id: 1 }).limit(1000).toArray();


        let data = queryResult.map(d => {
            return {
                lng: d.pickup_longitude,
                lat: d.pickup_latitude
            }
        });

        let geoJSONData = GeoJSON.parse(data, { Point: ['lat', 'lng'] });

        const index = new Supercluster({
            radius: 100,
            maxZoom: 17
        });

        index.load(geoJSONData.features);

        const bbox = [box.bounds._southWest.lng, box.bounds._southWest.lat, box.bounds._northEast.lng, box.bounds._northEast.lat];

        let clusterMarkers = index.getClusters(bbox, box.zoomLevel);

        let dataArray = [];
        for (let key in queryResult) {
            dataArray.push({
                lng: queryResult[key].pickup_longitude,
                lat: queryResult[key].pickup_latitude
            })
        }
        return clusterMarkers;
    }
    catch (err) { console.log(err); }
    finally { client.close(() => console.log('DB close!')); }
}

var port = process.env.PORT || 8000;

app.listen(port, () => {
    console.log('Listen to port ' + port);
})