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
}

exports.Track = function(id, source, dist, timeCreated) {
    // avoid dots and dups in IDs
    this.id = (Math.random()+1).toString(36).substring(2,4) + id.replace(".", "-");
    this.type = "line";
    this.source = source;
    this.paint = {
        "line-color": "#d63f35",
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

(function () { 'use strict';
    // to suit your point format, run search/replace for '.x' and '.y';
    // for 3D version, see 3d branch (configurability would draw significant performance overhead)

    // square distance between 2 points
    function getSqDist(p1, p2) {

        var dx = p1[0] - p2[0],
            dy = p1[1] - p2[1];

        return dx * dx + dy * dy;
    }

    // square distance from a point to a segment
    function getSqSegDist(p, p1, p2) {

        var x = p1[0],
            y = p1[1],
            dx = p2[0] - x,
            dy = p2[1] - y;

        if (dx !== 0 || dy !== 0) {

            var t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);

            if (t > 1) {
                x = p2[0];
                y = p2[1];

            } else if (t > 0) {
                x += dx * t;
                y += dy * t;
            }
        }

        dx = p[0] - x;
        dy = p[1] - y;

        return dx * dx + dy * dy;
    }
    // rest of the code doesn't care about point format

    // basic distance-based simplification
    function simplifyRadialDist(points, sqTolerance) {

        var prevPoint = points[0],
            newPoints = [prevPoint],
            point;

        for (var i = 1, len = points.length; i < len; i++) {
            point = points[i];

            if (getSqDist(point, prevPoint) > sqTolerance) {
                newPoints.push(point);
                prevPoint = point;
            }
        }

        if (prevPoint !== point) newPoints.push(point);

        return newPoints;
    }

    function simplifyDPStep(points, first, last, sqTolerance, simplified) {
        var maxSqDist = sqTolerance,
            index;

        for (var i = first + 1; i < last; i++) {
            var sqDist = getSqSegDist(points[i], points[first], points[last]);

            if (sqDist > maxSqDist) {
                index = i;
                maxSqDist = sqDist;
            }
        }

        if (maxSqDist > sqTolerance) {
            if (index - first > 1) simplifyDPStep(points, first, index, sqTolerance, simplified);
            simplified.push(points[index]);
            if (last - index > 1) simplifyDPStep(points, index, last, sqTolerance, simplified);
        }
    }

    // simplification using Ramer-Douglas-Peucker algorithm
    function simplifyDouglasPeucker(points, sqTolerance) {
        var last = points.length - 1;

        var simplified = [points[0]];
        simplifyDPStep(points, 0, last, sqTolerance, simplified);
        simplified.push(points[last]);

        return simplified;
    }

    // both algorithms combined for awesome performance
    function simplify(points, tolerance, highestQuality) {

        if (points.length <= 2) return points;

        var sqTolerance = tolerance !== undefined ? tolerance * tolerance : 1;

        points = highestQuality ? points : simplifyRadialDist(points, sqTolerance);
        points = simplifyDouglasPeucker(points, sqTolerance);

        return points;
    }

    exports.simplify = simplify;
})();

module.exports = exports;