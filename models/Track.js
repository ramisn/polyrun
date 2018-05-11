var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

trackSchema = new mongoose.Schema({
	name: String,
	data: Object,
	dist_km: Number
});

var Track = mongoose.model("Track", trackSchema);
module.exports = Track;