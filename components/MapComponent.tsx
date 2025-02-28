"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { View, StyleSheet, Text, TouchableOpacity, Platform } from "react-native"
import { WebView } from "react-native-webview"
import { decode } from "@mapbox/polyline"
import * as Location from "expo-location"

interface Stop {
  name: string
  latitude: number
  longitude: number
}

interface RouteDetails {
  stops: {
    stops: Stop[]
  }
  route_polyline: string
  bus: {
    current_latitude: number
    current_longitude: number
    id: string
  }
}

interface MapComponentProps {
  routeDetails: RouteDetails
  onMapTouchStart?: () => void
  onMapTouchEnd?: () => void
}

const MapComponent: React.FC<MapComponentProps> = ({ routeDetails, onMapTouchStart, onMapTouchEnd }) => {
  const busId = routeDetails.bus.id
  const [currentLatitude, setCurrentLatitude] = useState(routeDetails.bus.current_latitude)
  const [currentLongitude, setCurrentLongitude] = useState(routeDetails.bus.current_longitude)
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [distance, setDistance] = useState<number | null>(null)
  const [isMapReady, setIsMapReady] = useState(false)
  const webViewRef = useRef<WebView>(null)

  const fetchBusDetails = async (busId: string) => {
    try {
      const response = await fetch(`https://adcet-backend.onrender.com/api/v1/user/bus/${busId}`)
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      const data = await response.json()

      setCurrentLatitude(data.bus.current_latitude)
      setCurrentLongitude(data.bus.current_longitude)

      // Update bus marker on the map
      if (isMapReady && webViewRef.current) {
        const updateScript = `
          // Remove previous bus marker
          if (window.busMarker) {
            map.removeLayer(window.busMarker);
          }
          // Add new bus marker
          window.busMarker = L.marker([${data.bus.current_latitude}, ${data.bus.current_longitude}], {
            icon: busIcon
          }).addTo(map).bindPopup("Bus Current Location");
          true;
        `
        webViewRef.current.injectJavaScript(updateScript)
      }

      // Update distance calculation if user location is available
      if (userLocation) {
        const dist = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          data.bus.current_latitude,
          data.bus.current_longitude,
        )
        setDistance(dist)
      }
    } catch (error) {
      console.error("Error fetching bus details:", error)
    }
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (value: number) => (value * Math.PI) / 180
    const R = 6371 // Radius of the Earth in km
    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c // Distance in km
  }

  const updateUserMarker = () => {
    if (isMapReady && webViewRef.current && userLocation) {
      const updateScript = `
        // Remove previous user marker
        if (window.userMarker) {
          map.removeLayer(window.userMarker);
        }
        // Add new user marker
        window.userMarker = L.marker([${userLocation.latitude}, ${userLocation.longitude}], {
          icon: userIcon
        }).addTo(map).bindPopup("Your Location");
        true;
      `
      webViewRef.current.injectJavaScript(updateScript)

      // Update distance calculation if bus location is available
      if (currentLatitude && currentLongitude) {
        const dist = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          currentLatitude,
          currentLongitude
        )
        setDistance(dist)
      }
    }
  }

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        console.error("Permission to access location was denied")
        return
      }

      const location = await Location.getCurrentPositionAsync({})
      const { latitude, longitude } = location.coords
      setUserLocation({ latitude, longitude })
    } catch (error) {
      console.error("Error getting user location:", error)
    }
  }

  // Effect for initial location and setting up bus location interval
  useEffect(() => {
    // Initial location check
    getUserLocation()

    // Set up interval for bus location updates
    const interval = setInterval(() => {
      fetchBusDetails(busId)
    }, 4000)

    return () => clearInterval(interval)
  }, [busId])

  // Effect to update user marker whenever userLocation changes
  useEffect(() => {
    updateUserMarker()
  }, [userLocation, isMapReady])

  // Decode the polyline for the route
  const decodedCoords = decode(routeDetails.route_polyline).map((coord: [number, number]) => [coord[0], coord[1]])

  // Create the map HTML with improved interaction support
  const leafletMap = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
        <style>
          html, body {
            height: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden;
          }
          #map { 
            height: 100%;
            width: 100%;
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
          }
          /* Custom bus icon styles */
          .bus-icon {
            background: none;
            border: none;
          }
          /* Custom user icon styles */
          .user-icon {
            background: none;
            border: none;
          }
          /* Control styling */
          .leaflet-control-zoom {
            margin: 15px !important;
          }
          .leaflet-control-zoom a {
            width: 36px !important;
            height: 36px !important;
            line-height: 36px !important;
            font-size: 18px !important;
          }
          /* Control buttons for better mobile touch */
          .custom-control {
            background: white;
            border-radius: 4px;
            box-shadow: 0 1px 5px rgba(0,0,0,0.4);
            padding: 8px;
            margin: 10px;
            cursor: pointer;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          // Initialize map with better handling for mobile gestures
          var map = L.map('map', {
            zoomControl: true,
            dragging: true,
            tap: true,
            touchZoom: true,
            scrollWheelZoom: true,
            doubleClickZoom: true
          }).setView([${routeDetails.stops.stops[0].latitude}, ${routeDetails.stops.stops[0].longitude}], 12);
          
          // Add event listeners for touch events
          map.getContainer().addEventListener('touchstart', function() {
            window.ReactNativeWebView.postMessage('MAP_TOUCH_START');
          });
          
          map.getContainer().addEventListener('touchend', function() {
            window.ReactNativeWebView.postMessage('MAP_TOUCH_END');
          });
          
          map.getContainer().addEventListener('touchcancel', function() {
            window.ReactNativeWebView.postMessage('MAP_TOUCH_END');
          });
          
          // Add OpenStreetMap tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);
          
          // Create custom icons
          var busIcon = L.divIcon({
            className: 'bus-icon',
            html: '<div style="background-color: #FF4B4B; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>',
            iconSize: [22, 22],
            iconAnchor: [11, 11]
          });
          
          var userIcon = L.divIcon({
            className: 'user-icon',
            html: '<div style="background-color: #4CAF50; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>',
            iconSize: [22, 22],
            iconAnchor: [11, 11]
          });
          
          // Add stop markers
          var stopMarkers = [];
          ${routeDetails.stops.stops
      .map(
        (stop: any, index: number) => `
              stopMarkers.push(L.marker([${stop.latitude}, ${stop.longitude}])
                .addTo(map)
                .bindPopup("${stop.name}")
              );
            `,
      )
      .join("")}
          
          // Add initial bus marker
          window.busMarker = L.marker([${currentLatitude}, ${currentLongitude}], {
            icon: busIcon
          }).addTo(map).bindPopup("Bus Current Location");
          
          // Add route polyline
          var routePath = L.polyline(${JSON.stringify(decodedCoords)}, {
            color: '#1a73e8',
            weight: 5,
            opacity: 0.7,
            lineJoin: 'round'
          }).addTo(map);
          
          // Center and zoom the map to show the entire route
          map.fitBounds(routePath.getBounds(), { padding: [30, 30] });
          
          // Add custom control for centering on bus
          var centerControl = L.control({ position: 'topright' });
          centerControl.onAdd = function(map) {
            var div = L.DomUtil.create('div', 'custom-control');
            div.innerHTML = '📍 Center on Bus';
            div.style.fontSize = '10px';
            div.style.fontFamily = 'Arial, sans-serif';
            div.onclick = function() {
              map.setView([${currentLatitude}, ${currentLongitude}], 15);
            };
            return div;
          };
          centerControl.addTo(map);
          
          // Add custom control for centering on user (new)
          var userCenterControl = L.control({ position: 'topright' });
          userCenterControl.onAdd = function(map) {
            var div = L.DomUtil.create('div', 'custom-control');
            div.innerHTML = '📌 Center on Me';
            div.style.fontSize = '10px';
            div.style.fontFamily = 'Arial, sans-serif';
            div.style.marginTop = '10px';
            div.onclick = function() {
              if (window.userMarker) {
                var latlng = window.userMarker.getLatLng();
                map.setView([latlng.lat, latlng.lng], 15);
              }
            };
            return div;
          };
          userCenterControl.addTo(map);
          
          // Send message when map is fully loaded
          map.whenReady(function() {
            window.ReactNativeWebView.postMessage('MAP_READY');
          });
          
          // Improve touch event handling
          function disableViewportMeta() {
            var viewports = document.querySelectorAll('meta[name=viewport]');
            for (var i = 0; i < viewports.length; i++) {
              viewports[i].setAttribute('content', 
                'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
            }
          }
          
          // Call this to ensure proper viewport settings
          disableViewportMeta();
          
          // Handle touch events better
          document.addEventListener('touchstart', function(e) {
            if (e.touches.length > 1) {
              e.preventDefault(); // Allow multi-touch gestures to pass to the map
            }
          }, { passive: false });
        </script>
      </body>
    </html>
  `

  const handleWebViewMessage = (event: any) => {
    const { data } = event.nativeEvent
    if (data === "MAP_READY") {
      setIsMapReady(true)
    } else if (data === "MAP_TOUCH_START") {
      onMapTouchStart && onMapTouchStart()
    } else if (data === "MAP_TOUCH_END") {
      onMapTouchEnd && onMapTouchEnd()
    }
  }

  return (
    <View
      style={styles.container}
      onTouchStart={onMapTouchStart}
      onTouchEnd={onMapTouchEnd}
    >
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.locationButton} onPress={getUserLocation}>
          <Text style={styles.locationButtonText}>📍 Get Distance & Time</Text>
        </TouchableOpacity>
      </View>



      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html: leafletMap }}
        onMessage={handleWebViewMessage}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={false}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentMode="mobile"
        allowsFullscreenVideo={false}
        cacheEnabled={true}
        allowsBackForwardNavigationGestures={false}
        mixedContentMode="always"
        allowFileAccess={true}
        allowsInlineMediaPlayback={true}
        allowsLinkPreview={false}
        automaticallyAdjustContentInsets={false}
        mediaPlaybackRequiresUserAction={true}
        userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1"
      />

      <View style={styles.controlsContainer}>
        {distance !== null && 40 > 0 && (
          <View style={styles.distanceBadge}>
            <Text style={styles.distanceText}>
              {distance < 1
                ? `${Math.round(distance * 1000)} m to bus`
                : `${distance.toFixed(1)} km to bus`}
              {" • "}
              {40 > 0
                ? (distance / 40 >= 1
                  ? `${(distance / 40).toFixed(1)} hr`
                  : `${Math.round((distance / 40) * 60)} min to arrival`)
                : "Calculating..."}
            </Text>
          </View>
        )}
      </View>
    </View>


  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    width: "100%",
    position: "relative",
  },
  webview: {
    flex: 1,
    ...Platform.select({
      ios: {
        backgroundColor: "transparent",
      },
    }),
  },
  buttonContainer: {
    position: "fixed",
    top: 0,
    bottom: 20,
    left: 5,
    zIndex: 9,
  },
  controlsContainer: {
    position: "fixed",
    top: 5,
    bottom: 10,
    left: 10,
    right: 10,
    zIndex: 9,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  locationButton: {
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  locationButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  distanceBadge: {
    marginBottom: 10,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  distanceText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
})

export default MapComponent