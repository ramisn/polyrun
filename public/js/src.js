var defaultPos = [7.41, 51.51];

mapboxgl.accessToken = 'pk.eyJ1IjoiYmxhZGVnMzAiLCJhIjoiY2pnd2lqY2plMDZ4NTJ4bnd6NHNtd2ZvdSJ9.5A_6NhPLS87JaYEAfyqHJA';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v9',
    center: defaultPos,
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