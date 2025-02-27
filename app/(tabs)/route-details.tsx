"use client"

// import { useRouter } from "expo-router"
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions, Image, TouchableOpacity } from "react-native"
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

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={styles.colors.primary} />
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
      <View style={styles.card}>
        <Text style={styles.title}>Route: {routeDetails.route_name}</Text>
        <Text style={styles.info}>Departure Time: {routeDetails.departure_time}</Text>
        {routeDetails.bus && (
          <Text style={styles.info}>Bus Number: {routeDetails.bus.bus_number}</Text>
        )}
      </View>
      
      <View style={styles.mapContainer}>
        {routeDetails && <MapComponent routeDetails={routeDetails} />}
      </View>

      {routeDetails.stops?.stops?.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.subtitle}>Stops</Text>
          {routeDetails.stops.stops.map((stop: any, index: number) => (
            <View key={index} style={styles.stopContainer}>
              <View style={styles.stopDot}></View>
              <Text style={[styles.stopInfo, { flex: 1 }]}>{stop.name}</Text>
              <TouchableOpacity 
                style={styles.infoButton} 
                onPress={() => router.push({ 
                  pathname: "/stop-info/stopInfo", 
                  params: { stopName: stop.name } 
                })}
              >
                <Text style={styles.infoButtonText}>View Info</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Advertisement Section */}
      <View style={styles.adContainer}>
        <Text style={styles.adTitle}>Hungry? Grab a Bite at Sharma Snacks!</Text>
        <Image
          source={{ uri: "https://www.shutterstock.com/shutterstock/photos/1805776183/display_1500/stock-vector-delicious-homemade-burger-with-splashing-cola-french-fries-and-fresh-ingredients-food-ad-in-d-1805776183.jpg" }}
          style={styles.adImage}
        />
        <Text style={styles.adText}>Delicious samosas, piping hot chai, and more! Visit us near {routeDetails.stops?.stops?.[0]?.name || "your stop"}.</Text>
        <TouchableOpacity style={styles.adButton}>
          <Text style={styles.adButtonText}>Show this ad for a 10% discount!</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

// Create a color palette for consistent styling
const COLORS = {
  primary: "#1a73e8",
  primaryDark: "#0d47a1",
  secondary: "#FFC107",
  secondaryDark: "#FFA000",
  background: "#f5f5f5",
  surface: "#ffffff",
  text: "#333333",
  textSecondary: "#555555",
  error: "#d32f2f",
  adBackground: "#FFF8E1",
  adAccent: "#FF9800",
  shadowColor: "#000000"
}

// Extract window dimensions for responsive sizing
const { width, height } = Dimensions.get('window')

const styles = StyleSheet.create({
  // Color palette for easy reference
  colors: COLORS,
  
  // Base container
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  // Map styling
  mapContainer: {
    height: height * 0.4,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  
  // Card styling
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 12,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  
  // Typography
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: COLORS.text,
  },
  info: {
    fontSize: 16,
    marginBottom: 12,
    color: COLORS.textSecondary,
  },
  
  // Stop items
  stopContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  stopDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.secondary,
    marginRight: 16,
  },
  stopInfo: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  
  // Loading and error states
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  errorText: {
    fontSize: 18,
    textAlign: "center",
    color: COLORS.error,
    marginTop: 8,
  },
  
  // Button styling
  infoButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  infoButtonText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: "bold",
  },
  
  // Advertisement styling
  adContainer: {
    backgroundColor: COLORS.adBackground,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 12,
    marginBottom: 24,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  adTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: COLORS.text,
  },
  adImage: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    marginBottom: 12,
  },
  adText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
    color: COLORS.textSecondary,
  },
  adButton: {
    backgroundColor: COLORS.adAccent,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  adButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.surface,
  },
});