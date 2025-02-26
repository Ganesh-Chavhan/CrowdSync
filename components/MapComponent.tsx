import React, { useEffect, useState } from "react";
import { View, StyleSheet, Dimensions, Button, Text } from "react-native";
import { WebView } from "react-native-webview";
import { decode } from "@mapbox/polyline";
import * as Location from 'expo-location';

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
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  
  const fetchBusDetails = async (busId: string) => {
    try {
      const response = await fetch(`https://adcet-hackathon-backend.onrender.com/api/v1/user/bus/${busId}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      
      setCurrentLatitude(data.bus.current_latitude);
      setCurrentLongitude(data.bus.current_longitude);
      
    } catch (error) {
      console.error("Error fetching bus details:", error);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; // Radius of the Earth in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const getUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.error("Permission to access location was denied");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;
    setUserLocation({ latitude, longitude });
    
    if (routeDetails.bus.current_latitude && routeDetails.bus.current_longitude) {
      const dist = calculateDistance(latitude, longitude, routeDetails.bus.current_latitude, routeDetails.bus.current_longitude);
      setDistance(dist);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchBusDetails(busId);
    }, 4000);

    return () => clearInterval(interval);
  }, [busId]);

  const decodedCoords = decode(routeDetails.route_polyline).map((coord: [number, number]) => [coord[0], coord[1]]);

  const stopMarkers = routeDetails.stops.stops
    .map((stop: any) => `L.marker([${stop.latitude}, ${stop.longitude}]).addTo(map).bindPopup("${stop.name}");`)
    .join("");

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

  const userMarker = `
    var userIcon = L.divIcon({
      className: 'user-icon',
      html: '<div style="background-color: green; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
    L.marker([${userLocation?.latitude || 0}, ${userLocation?.longitude || 0}], {icon: userIcon})
      .addTo(map)
      .bindPopup("Your Location")
      .openPopup();`;

  const polylinePath = `L.polyline(${JSON.stringify(decodedCoords)}, {color: 'blue'}).addTo(map);`;

  const leafletMap = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
        <style>
          #map { height: 90vh; width: 100vw; } /* Increased height for better visibility */
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
          ${userLocation ? userMarker : ''}
          ${polylinePath}
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <Button title="Get My Location" onPress={getUserLocation} />
      {distance !== null && (
        <Text>Distance to Bus: {distance.toFixed(2)} km</Text>
      )}
      <WebView originWhitelist={["*"]} source={{ html: leafletMap }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: Dimensions.get("window").height * 1,
    width: "100%",
  },
});

export default MapComponent;
