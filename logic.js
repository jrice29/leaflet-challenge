// Define the URL of the GeoJSON data
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to fetch the GeoJSON data
d3.json(url).then(function(data) {
    createMap(data.features);
});


// Function to create the map and layers
function createMap(earthquakeData) {
    // Define tile layers for base maps
    let streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    let topoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // Create a baseMaps object
    let baseMaps = {
        "Street Map": streetMap,
        "Topographic Map": topoMap
    };

    // Function to determine marker size based on magnitude
    function markerSize(magnitude) {
        return magnitude * 5;  // Multiply by a factor to adjust marker size
    }

    // Function to determine marker color based on depth
    function markerColor(depth) {
        if (depth <= 10) {
            return "#84fd6c";  // Shallow
        } else if (depth <= 30) {
            return "#bfd16e";  // Intermediate
        } else if (depth <= 50) {
            return "#ddbf5c";  // Moderate
        } else if (depth <= 70) {
            return "#e79b37";  // Deep
        } else if (depth <= 90) {
            return "#ec7141";  // Very Deep
        } else {
            return "#f82720";  // Extremely Deep
        }
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    let earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
                radius: markerSize(feature.properties.mag),
                fillColor: markerColor(feature.geometry.coordinates[2]),  // Use depth for color
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            }).bindPopup(`<h3>${feature.properties.place}</h3><hr><p>Magnitude: ${feature.properties.mag}<br>Depth: ${feature.geometry.coordinates[2]}</p>`);
        }
    });

    // Create overlay object
    let overlayMaps = {
        "Earthquakes": earthquakes
    };

    // Create the map, centering on a location and zoom level
    let myMap = L.map("map", {
        center: [35.00, -100.00],  // Example: United States
        zoom: 3,
        layers: [streetMap, earthquakes]  // Default layers on load
    });

    // Add layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Create a legend to display information about the map
    let legend = L.control({ position: 'bottomright' });

    legend.onAdd = function(map) {
        let div = L.DomUtil.create('div', 'info legend');
        let depths = [-10, 10, 30, 50, 70, 90];
        let labels = [];

        // Loop through depths and generate a label with a colored square for each depth range
        for (let i = 0; i < depths.length; i++) {
            div.innerHTML +=
                '<i style="background:' + markerColor(depths[i] + 1) + '"></i> ' +
                depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(myMap);  // Add legend to map
}
