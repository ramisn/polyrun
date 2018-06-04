Track = require("../models/Track"),

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
    }
}

module.exports = exports;