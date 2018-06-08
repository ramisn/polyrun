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
        "type": "Feature",
        "properties": {},
        "geometry": {
            "type": "MultiLineString",
            "coordinates": coords
        }
    };
    this.tolerance = 3;
}

exports.Track = function(id, source, dist, timeCreated) {
    this.id = id;
    this.type = "line";
    this.source = source;
    this.paint = {
        "line-color": "#3de5e2",
        "line-width": 4,
        "line-opacity": 0.5
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