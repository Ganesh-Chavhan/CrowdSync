import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { WebView } from "react-native-webview";
import { decode } from "@mapbox/polyline";

interface Stop {
  name: string;
  latitude: number;
  longitude: number;
}

interface RouteDetails {
  stops: {
    stops: Stop[];
  };
  route_polyline: string;
  bus: {
    current_latitude: number;
    current_longitude: number;
  };
}

interface MapComponentProps {
  routeDetails: RouteDetails;
}

const MapComponent: React.FC<MapComponentProps> = ({ routeDetails }) => {
  // Decode polyline to coordinates
  const decodedCoords = decode(routeDetails.route_polyline).map((coord: [number, number]) => [coord[0], coord[1]]);

  // Convert stops to markers
  const stopMarkers = routeDetails.stops.stops
    .map((stop) => `L.marker([${stop.latitude}, ${stop.longitude}]).addTo(map).bindPopup("${stop.name}");`)
    .join("");

  // Bus location marker
  const busMarker = `L.marker([${routeDetails.bus.current_latitude}, ${routeDetails.bus.current_longitude}])
    .addTo(map)
    .bindPopup("Bus Current Location")
    .openPopup();`;

  // Convert polyline to Leaflet path
  const polylinePath = `L.polyline(${JSON.stringify(decodedCoords)}, {color: 'blue'}).addTo(map);`;

  // Leaflet HTML inside WebView
  const leafletMap = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
        <style>
          #map { height: 100vh; width: 100vw; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map').setView([${routeDetails.stops.stops[0].latitude}, ${routeDetails.stops.stops[0].longitude}], 12);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);
          
          ${stopMarkers}
          ${busMarker}
          ${polylinePath}
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView originWhitelist={["*"]} source={{ html: leafletMap }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: Dimensions.get("window").height * 0.5,
    width: "100%",
  },
});

export default MapComponent;
