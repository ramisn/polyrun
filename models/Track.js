var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

trackSchema = new mongoose.Schema({
	id: String,
	type: String,
	source: Object,
	paint: Object,
	layout: Object,
	dist_km: { type: Number, default: 0 },
	timeCreated: { type: Date, default: Date.now }
});

var Track = mongoose.model("Track", trackSchema);
module.exports = Track;