var map = L.map('map').setView([51.030, -114.035], 11);
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    subdomains: ['mt0','mt1','mt2','mt3'],
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoidmVnZXRhYmxlaHVudGVyIiwiYSI6ImNrenB1cTM4bzBkcHQybnJ4cDFwOHUzNnQifQ.XB2HogVSioH_O6t03oTGwA'
}).addTo(map);
var markergroup = L.layerGroup().addTo(map);
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);
var polyLayers = [];
L.drawLocal.draw.toolbar.buttons.polygon = 'Create Polygon';
var drawControl = new L.Control.Draw({
    position: 'topright',
    draw: {
        polyline: false,
        circle: false,
        marker: false,
        polygon: {
            allowIntersection: true,
            showArea: true,
            drawError: {
                color: 'blue',
                timeout: 1000
            },
            shapeOptions: {
                color: 'blue'
            }
        },
        rectangle: {
            allowIntersection: true,
            showArea: true,
            drawError: {
                color: 'blue',
                timeout: 1000
            },
            shapeOptions: {
                color: 'blue'
            }
        },
    },
    edit: {
        featureGroup: drawnItems,
        remove: false
    }
});
map.addControl(drawControl);
map.on('draw:created', function (e) {
    var type = e.layerType,
    layer = e.layer;
    drawnItems.addLayer(layer);
});
map.on('draw:edited', function (e) {
    var layers = e.layers;
    var countOfEditedLayers = 0;
    layers.eachLayer(function(layer) {
        countOfEditedLayers++;
    });
});
drawnItems.on("click", function(event) {
    var lat = event.layer.getBounds().getCenter().lat;
    var lon = event.layer.getBounds().getCenter().lng;
    var id = event.layer._leaflet_id;
    if (document.getElementById(id) == null) {
        var tempid = Math.random()*10000;
        info = event.layer.bindPopup(
            $('<button>Monitor This Area</button>').click(function() {
                var newDiv = $(
                    '<div id="' + id + '" class="weatherreport">' + 
                        '<h6>Weather Report:</h6>' + 
                        '<p>Polygon ID: ' + id + '</p>' +
                        '<p>Weather Calcuated at: ' + lat.toFixed(4) + ', ' + lon.toFixed(4) + '</p>' +
                        '<p style="display:inline">Temperature: </p>' + '<p style="display:inline" id="' + tempid + '"></p>' +
                        '<button style="display:block" onclick="removediv(' + id + ')">Quit Monitoring</button>' +
                    '</div>'
                );
                $(".info-bar").append(newDiv);
                weather(lat, lon, tempid, id);
                info = event.layer.bindPopup("This Polygon is Already in the Dashboard")
            }
        )[0]);
    } else {
        info = event.layer.bindPopup("This Polygon is Already in the Dashboard");
    }
});

function weather(lat, lon, tempid, id) {
    var key = '5b736e0ec904ce6e499a1afe0e2a2740'
    fetch('https://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + lon + '&appid=' + key + '&units=metric')
    .then(function(response) {return response.json()}).then(function(data) {
        temperature = parseFloat(data.main.temp);
        document.getElementById(tempid).innerHTML = temperature;
        var changediv = document.getElementById(id);
        if (temperature < 15 && temperature > 20) {
            changediv.style.setProperty('--back-color', '#90EE90');
        } else {
            changediv.style.setProperty('--back-color', '#ffcccb');
        }
    })
    .catch(function() {
        console.log("Error!")
    });
}

function removediv(id) {
    const element = document.getElementById(id);
    element.remove();
    drawnItems.removeLayer(id);
}