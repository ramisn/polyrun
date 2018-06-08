var	express     = require("express"),
    flash       = require("connect-flash"),
    session     = require("express-session"),
	mongoose    = require("mongoose"),
	fs          = require("fs"),
    bodyParser  = require("body-parser"),
	geotools    = require("geojson-tools"),
	togeojson   = require("togeojson"),
    DOMParser   = require("xmldom").DOMParser;
	Track       = require("./models/Track"),
	midware     = require("./middleware/middleware"),
    CONFIG      = require("./middleware/config"),
	app         = express();
    
	port        = process.env.PORT || 4545;
mongoose.Promise = global.Promise;
mongoose.connect(`mongodb://${CONFIG.USER}:${CONFIG.PASSWORD}@ds217560.mlab.com:17560/polyrun`);

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
	midware.upload(req, res, function(err) {
        if(!err) {
            var filesCount = 0;
            for (file of req.files) {
                var geoj = togeojson.gpx(new DOMParser().parseFromString(fs.readFileSync("./uploads/" + file.filename, "utf-8")));
                fs.unlink("./uploads/" + file.filename);

                var coords = [geoj.features[0].geometry.coordinates];
                var source = new midware.createGeoJSON(coords);
                var dist_km = geotools.getDistance(geoj.features[0].geometry.coordinates);
                var timeCreated = new Date(geoj.features[0].properties.time);
                var newTrack = new midware.Track(file.originalname, source, dist_km, timeCreated);
                
                var message = "";
                Track.create(newTrack, function(err, newlyCreated) {
                    if (err || !newlyCreated) { message = "Error while uploading file(s)."; }
                });
            }
            if (message.length === 0) { message = `Successfully added track(s).`; }
            res.render("upload", {message: message});
        } else {
            res.render("upload", {message: "A file is not supported or bigger than 700kB."});
        }
    });
});

app.listen(port, function() {
	console.log("listening on", port);
});