mapboxgl.accessToken = MAPBOX_API_KEY;
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v9',
    center: DEFAULT_POS,
    zoom: 12,
    maxZoom: 15
});

var tracks = document.getElementById("map").dataset.tracks;
var distance = document.getElementById("map").dataset.dist;
tracks = JSON.parse(tracks)[0];

map.on('load', function () {

    var layers = map.getStyle().layers;
    // Find the index of the first symbol layer in the map style
    var firstSymbolId;
    for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol') {
            firstSymbolId = layers[i].id;
            break;
        }
    }
    map.addControl(new mapboxgl.GeolocateControl({
        trackUserLocation: true
    }));

    map.addLayer(tracks, firstSymbolId);
});