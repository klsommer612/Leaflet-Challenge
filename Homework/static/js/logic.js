accessToken =
    'pk.eyJ1Ijoia2xzb21tZXI2MTIiLCJhIjoiY2s0MG5pNXBjMDBqdTNlbzBkdm1rNTZ1NyJ9.u2UQbrXUMsRAojpjFnLkNw';

// endpoint stored as usgsData
var usgsData = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson";

d3.json(usgsData, function(data) {
    // send the data.features object to the createFeatures function
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
            "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: function(feature, latlng) {

            //moment magnitude scale in use at this time
            //it might be better to have each magnitude blown up to represent the energy. the scale is logarithmic; non-linear. 
            var geojsonMarkerOptions = {
                radius: feature.properties.mag * 2.5,
                fillColor: getColor(feature.properties.mag),
                color: "black",
                weight: 0.5,
                opacity: 0.75,
                fillOpacity: 0.7
            };
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }
    });

    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
}

function createMap(earthquakes) {

    // Define streetmap and darkmap layers
    var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.streets",
        accessToken: 'pk.eyJ1IjoiYXVudGllYW5nZWxiIiwiYSI6ImNqeGFpaTZ3aTE2aHQzeXFiaXA1dXV0eGQifQ.CkNZf0oo73ZsTVe9JfO6xQ'
    });

    var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.satellite",
        accessToken: 'pk.eyJ1IjoiYXVudGllYW5nZWxiIiwiYSI6ImNqeGFpaTZ3aTE2aHQzeXFiaXA1dXV0eGQifQ.CkNZf0oo73ZsTVe9JfO6xQ'
    });

    // Define a baseMaps 
    var baseMaps = {
        "Street Map": streetmap,
        "Satellite Map": darkmap
    };

    // Create overlay 
    var overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create  map,
    var myMap = L.map("map-id", {
        center: [
            37.09, -95.71
        ],
        zoom: 5,
        layers: [streetmap, earthquakes]
    });


    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);
    createLegend(myMap);
}

//  create legend
function createLegend(myMap) {
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");
        var limits = [2.5, 3, 4, 5, 6, 7]
        var labels = [];

        // Create title for legend and pass in to html
        var legendInfo = "<b>Earthquake Magnitude</b><br>";
        "<div class=\"labels\">" +
        "<div class=\"min\">" + limits[0] + "</div>" +
            "<div class=\"max\">" + limits[limits.length - 1] + "</div>" +
            "</div>";

        div.innerHTML = legendInfo;




        // Loop through limits, using getColor function to add colors
        for (var i = 0; i < limits.length; i++) {
            div.innerHTML +=
                '<i style="background: ' + getColor(limits[i]) + '"></i> ' +
                limits[i] + (limits[i + 1] ? '&ndash;' + limits[i + 1] + '<br>' : '+');
        }
        return div;
    };
    // Add legend to map
    legend.addTo(myMap);
};

function getColor(mag) {
    return mag >= 7 ? "#990000" :
        mag >= 6 ? "#cc0000" :
        mag >= 5 ? '#ff0000' :
        mag >= 4 ? '#ff3333' :
        mag >= 3 ? '#ff6666' :
        mag < 2.5 ? '#ff9999' :
        '#ffcccc';
}