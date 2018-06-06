var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

trackSchema = new mongoose.Schema({
	id: String,
	type: String,
	source: Object,
	paint: Object,
	layout: Object,
	dist_km: Number
});

var Track = mongoose.model("Track", trackSchema);
module.exports = Track;