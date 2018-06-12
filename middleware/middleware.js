var Track = require("../models/Track"),
    multer = require("multer");

exports.loadTracks = function(res) {
    var mapData = {
        "tracks": [],
        "total_dist": 0
    };
    Track.find().cursor()
    .on("data", function(track) {
        mapData.tracks.push(track);
        mapData.total_dist += track.dist_km;
    })
    .on("end", function() {
        res.render("index", {mapData: mapData});
    });
}

exports.createGeoJSON = function(coords) {
    this.type = "geojson";
    this.data = {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "properties": {},
            "geometry": {
                "coordinates": coords,
                "type": "LineString"
            }
        }]
    };
    this.lineMetrics = true;
    this.tolerance = 1;
}

exports.Track = function(id, source, dist, timeCreated) {
    this.id = id.replace(".", "-");
    this.type = "line";
    this.source = source;
    this.paint = {
        "line-color": "#38ede7",
        "line-width": {
            "type": "exponential",
            "base": 2,
            "stops": [
                [5, 1],
                [9, 2],
                [11, 2.5],
                [13, 3.2],
                [15, 5]
            ]
        },
        'line-gradient': [
            'interpolate',
            ['linear'],
            ['line-progress'],
            0, "rgba(137, 191, 175, 0.8)",
            0.1, "rgba(108, 180, 182, 0.8)",
            0.3, "rgba(86, 180, 180, 0.8)",
            0.5, "rgba(79, 165, 165, 0.8)",
            0.7, "rgba(72, 150, 150, 0.8)",
            1, "rgba(30, 138, 150, 0.8)"
        ]
    };
    this.layout = {
        "line-join": "round",
        "line-cap": "round"
    };
    this.dist_km = dist;
    this.timeCreated = timeCreated;
}

exports.upload = multer({
        storage: multer.diskStorage({
            destination: function(req, file, next) {
                next(null, "./uploads")
            }
        }),
        fileFilter: function(req, file, next) {
            if (!file) next();
            else {
                if (file.mimetype && file.mimetype.includes("gpx")) {
                    next(null, true);
                } else {
                    next({message: "file not supported."}, false);
                }
            }
        },
        limits: {
            fileSize: 700000 //Bytes
        }
    }).array("gpxFile", 50);

module.exports = exports;