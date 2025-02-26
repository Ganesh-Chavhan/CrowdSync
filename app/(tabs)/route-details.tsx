"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { homeScreenService } from "@/service/homeScreen.service"
import MapComponent from "@/components/MapComponent" // Make sure path is correct

export default function RouteDetails() {
  const router = useRouter()
  const { routeId } = useLocalSearchParams<{ routeId: string }>()
  const [routeDetails, setRouteDetails] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRouteDetails = async () => {
      try {
        if (!routeId) {
          setError("Invalid Route ID")
          return
        }
        const details = await homeScreenService.getBusDetails(routeId)
        console.log(details);

        setRouteDetails(details?.route || details) // Adjust based on your API response
      } catch (err) {
        setError("Error fetching route details. Please try again.")
        console.error("Error fetching route details:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchRouteDetails()
  }, [routeId])

  // Set up interval for updating bus location (if applicable)
  // useEffect(() => {
  //   if (!routeDetails || routeDetails.status !== "IN_TRANSIT") {
  //     return;
  //   }

  //   // const updateBusLocation = async () => {
  //   //   try {
  //   //     // Adjust this based on your actual API method
  //   //     const updatedBusInfo = await homeScreenService.getBusLocation(routeDetails.busId);
  //   //     if (tRouteDetails(prev => ({
  //   //         ...prev,
  //   //         bus: {
  //   //           ...prev.bus,
  //   //           current_latitude: updatedBusInfo.current_latitude,
  //   //           current_longitude: updatedBusInfo.current_longitude
  //   //       updatedBusInfo) {
  //   //       se  }
  //   //       }));
  //   //     }
  //   //   } catch (err) {
  //   //     console.error("Error updating bus location:", err);
  //   //   }
  //   // };

  //   // Update bus location every 10 seconds if the bus is in transit
  //   // const intervalId = setInterval(updateBusLocation, 10000);

  //   return () => clearInterval(intervalId);
  // }, [routeDetails]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1a73e8" />
        <Text style={styles.loadingText}>Loading route details...</Text>
      </View>
    )
  }

  if (error || !routeDetails) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || "Error: Route details not found"}</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      {/* Map Component */}
      <View style={styles.mapContainer}>
        {routeDetails && <MapComponent routeDetails={routeDetails} />}
      </View>

      {/* Route Details Card */}
      <View style={styles.card}>
        <Text style={styles.title}>Route: {routeDetails.route_name}</Text>
        <Text style={styles.info}>From: {routeDetails.start_location}</Text>
        <Text style={styles.info}>To: {routeDetails.end_location}</Text>
        <Text style={styles.info}>Departure Time: {routeDetails.departure_time}</Text>
        <Text style={{
          ...styles.statusInfo,
          color: routeDetails.status === 'active' ? '#4CAF50' :
            routeDetails.status === 'IN_TRANSIT' ? '#FF9800' : '#757575'
        }}>
          Status: {routeDetails.status.charAt(0).toUpperCase() + routeDetails.status.slice(1)}
        </Text>
        {routeDetails.bus && (
          <Text style={styles.info}>Bus Number: {routeDetails.bus.bus_number}</Text>
        )}
      </View>

      {/* Stops Card */}
      {routeDetails.stops && routeDetails.stops.stops && routeDetails.stops.stops.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.subtitle}>Stops</Text>
          {routeDetails.stops.stops.map((stop: any, index: number) => (
            <View key={index} style={styles.stopContainer}>
              <View style={styles.stopDot}></View>
              <Text style={styles.stopInfo}>
                {stop.name}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  mapContainer: {
    height: Dimensions.get('window').height * 0.4,
    margin: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  info: {
    fontSize: 16,
    marginBottom: 8,
    color: "#555",
  },
  statusInfo: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
  },
  stopContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stopDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFC107',
    marginRight: 12,
  },
  stopInfo: {
    fontSize: 16,
    color: "#555",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 18,
    textAlign: "center",
    color: "red",
  },
})