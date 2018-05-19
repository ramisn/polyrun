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
	db          = require("./models/Track"),
	//midware = require("./middleware"),
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
//mongoose.Promise = global.Promise;
//mongoose.connect('mongodb://george:pw@ds217560.mlab.com:17560/polyrun');

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
    res.render("index");
});

app.get("/upload", function(req, res) {
    res.render("upload", {errorMessage: ""});
});

app.post("/upload", function(req, res) {
    upload(req, res, function(err) {
        if(!err) {
            var upfiles = {};
            for (file of req.files) {
                var name = file.filename;
                var gpxParsed = new DOMParser().parseFromString(fs.readFileSync("./uploads/" + name, "utf-8"));
                var geoj = togeojson.gpx(gpxParsed);
                delete geoj.features[0].properties.coordTimes;
                geoj.features[0].properties.desc = geotools.getDistance(geoj.features[0].geometry.coordinates);
                fs.unlink("./uploads/" + name);
                upfiles[file.size] = geoj;
            }
            res.send(upfiles);
        } else {
            res.render("upload", {errorMessage: "A file is not supported or bigger than 700kB."});
        }
    });
});

app.get("/testing", function(req, res) {
	var dist = geotools.getDistance(test.features[0].geometry.coordinates);
	res.send(dist + "km");
});

app.listen(port, function() {
	console.log("listening on", port);
});