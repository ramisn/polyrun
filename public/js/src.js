mapboxgl.accessToken = MAPBOX_API_KEY;
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v9',
    center: DEFAULT_POS,
    zoom: 13,
    maxZoom: 15
});

var tracks = JSON.parse(document.getElementById("map").dataset.tracks);
var distance = document.getElementById("map").dataset.dist;

document.getElementById("sidebarBtn").addEventListener("click", function() {
    if(document.getElementById("sidebar").style.display === "block") {
        document.getElementById("sidebar").style.display = "none";
    } else document.getElementById("sidebar").style.display = "block";
});

document.getElementById("distDisplay").innerHTML += Math.round(distance * 100) / 100 + " Km"; 

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
    for (var i=0; i<tracks.length; i++) {
        map.addLayer(tracks[i], firstSymbolId);
    }
});