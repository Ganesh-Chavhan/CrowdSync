import React, { useEffect, useState } from "react";
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
  routeDetails: any;
}

const MapComponent: React.FC<MapComponentProps> = ({ routeDetails }) => {
  const busId = routeDetails.bus.id;
  const [current_latitude, setCurrentLatitude] = useState(routeDetails.bus.current_latitude);
  const [current_longitude, setCurrentLongitude] = useState(routeDetails.bus.current_longitude);
  
  const fetchBusDetails = async (busId: string) => {
    try {
      const response = await fetch(`https://adcet-hackathon-backend.onrender.com/api/v1/user/bus/${busId}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log(data);
      
      setCurrentLatitude(data.bus.current_latitude);
      setCurrentLongitude(data.bus.current_longitude);
      console.log(data.bus.current_latitude);
      console.log(data.bus.current_longitude);
      
    } catch (error) {
      console.error("Error fetching bus details:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchBusDetails(busId);
    }, 4000); // Fetch bus details every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [busId]);

  // Decode polyline to coordinates
  const decodedCoords = decode(routeDetails.route_polyline).map((coord: [number, number]) => [coord[0], coord[1]]);

  // Convert stops to markers
  const stopMarkers = routeDetails.stops.stops
    .map((stop: any) => `L.marker([${stop.latitude}, ${stop.longitude}]).addTo(map).bindPopup("${stop.name}");`)
    .join("");

  // Bus location marker with custom icon
  const busMarker = `
    var busIcon = L.divIcon({
      className: 'bus-icon',
      html: '<div style="background-color: #FF4B4B; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
    L.marker([${current_latitude}, ${current_longitude}], {icon: busIcon})
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
