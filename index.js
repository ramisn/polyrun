var	express     = require("express"),
    flash       = require("connect-flash"),
    session     = require("express-session"),
	mongoose    = require("mongoose"),
	fs          = require("fs"),
    multer      = require("multer"),
    bodyParser  = require("body-parser"),
	geotools    = require("geojson-tools"),
	togeojson   = require("togeojson"),
    DOMParser   = require("xmldom").DOMParser;
	Track       = require("./models/Track"),
	midware     = require("./middleware/middleware"),
	app         = express(),
    upload      = multer({
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
            fileSize: 700000
        }
    }).array("gpxFile", 20),
	port        = process.env.PORT || 4545;
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://@ds217560.mlab.com:17560/polyrun');

app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/views"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));
app.use(flash());
app.set("view engine", "ejs");

app.get("/", function(req, res) {
    midware.loadTracks(res);
});

app.get("/upload", function(req, res) {
    res.render("upload", {message: ""});
});

app.post("/upload", function(req, res) {
	upload(req, res, function(err) {
        if(!err) {
            for (file of req.files) {
                var gpxParsed = new DOMParser().parseFromString(fs.readFileSync("./uploads/" + file.filename, "utf-8"));
                var geoj = togeojson.gpx(gpxParsed);
                var coords = geoj.features[0].geometry.coordinates;
                fs.unlink("./uploads/" + file.filename);
                var newTrack = {
                    id: file.originalname,
                    type: "line",
                    source: new midware.createGeoJSON(coords),
                    paint: {
                        "fill-color": "#00ffff"
                    },
                    layout: {
                        "line-join": "round",
                        "line-cap": "round"
                    },
                    dist_km: geotools.getDistance(geoj.features[0].geometry.coordinates)
                };
                var message = "";
                Track.create(newTrack, function(err, newlyCreated) {
                    if (err || !newlyCreated) { message = "Error while uploading file(s)."; }
                });
            }
            message = "Successfully added track(s).";
            res.render("upload", {message: message});
        } else {
            res.render("upload", {message: "A file is not supported or bigger than 700kB."});
        }
    });
});

app.listen(port, function() {
	console.log("listening on", port);
});