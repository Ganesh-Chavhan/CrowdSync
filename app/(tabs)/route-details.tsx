"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Image,
  TouchableOpacity,
  Animated,
  Linking,
} from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { homeScreenService } from "@/service/homeScreen.service"
import MapComponent from "@/components/MapComponent"
import { Ionicons } from "@expo/vector-icons"

// Interface for ad data
interface Ad {
  id: string
  title: string
  description: string
  image_url: string
  link: string
  created_at: string
  updated_at: string
  stop_name: string
}

export default function RouteDetails() {
  const router = useRouter()
  const { routeId } = useLocalSearchParams<{ routeId: string }>()
  const [routeDetails, setRouteDetails] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [showMap, setShowMap] = useState<boolean>(true)
  const [isMapInteracting, setIsMapInteracting] = useState<boolean>(false)
  const [advertisements, setAdvertisements] = useState<Ad[]>([])
  const [adLoading, setAdLoading] = useState<boolean>(true)
  const scrollViewRef = useRef<ScrollView>(null)

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current

  // Fetch advertisements from the API
  const fetchAdvertisements = async () => {
    try {
      setAdLoading(true)
      const response = await fetch('https://adcet-backend.onrender.com/api/v1/user/ads')
      const data = await response.json()

      if (data.ads && Array.isArray(data.ads)) {
        setAdvertisements(data.ads)
      }
    } catch (err) {
      console.error("Error fetching advertisements:", err)
    } finally {
      setAdLoading(false)
    }
  }

  useEffect(() => {
    const fetchRouteDetails = async () => {
      try {
        if (!routeId) {
          setError("Invalid Route ID")
          return
        }
        const details = await homeScreenService.getBusDetails(routeId)
        setRouteDetails(details?.route || details)

        // Start animations when data is loaded
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          })
        ]).start()

      } catch (err) {
        setError("Error fetching route details. Please try again.")
        console.error("Error fetching route details:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchRouteDetails()
    fetchAdvertisements()
  }, [routeId, fadeAnim, slideAnim])

  // Open ad link
  const handleAdPress = (link: string) => {
    if (link) {
      Linking.openURL(link).catch(err => console.error("Couldn't open URL:", err))
    }
  }

  // Map interaction handlers
  const handleMapTouchStart = () => setIsMapInteracting(true)
  const handleMapTouchEnd = () => setTimeout(() => setIsMapInteracting(false), 100)

  // Handle back navigation
  const handleBack = () => router.back()
  
  // Handle feedback navigation
  const handleFeedback = () => {
    if (routeId) {
      router.push({
        pathname: "/feedback/feedback-form",
        params: { routeId: routeId }
      })
    }
  }

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
        <TouchableOpacity style={styles.retryButton} onPress={handleBack}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // Get a relevant ad based on first stop name, or default to first ad
  const getRelevantAd = () => {
    if (!advertisements.length) return null

    const firstStopName = routeDetails.stops?.stops?.[0]?.name
    if (firstStopName) {
      const relevantAd = advertisements.find(ad =>
        ad.stop_name && firstStopName.includes(ad.stop_name)
      )
      return relevantAd || advertisements[0]
    }
    return advertisements[0]
  }

  const relevantAd = getRelevantAd()

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={styles.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Route Details</Text>
        <View style={{ width: 24 }} /> {/* Empty view for balance */}
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={!isMapInteracting}
        showsVerticalScrollIndicator={false}
      >
        {/* Route Info Card */}
        <Animated.View
          style={[
            styles.card,
            styles.routeCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.routeNumberBadge}>
            <Text style={styles.routeNumberText}>{routeDetails.bus?.bus_number || "—"}</Text>
          </View>
          <Text style={styles.title}>{routeDetails.route_name}</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={20} color={styles.colors.primary} />
              <Text style={styles.infoLabel}>Departure</Text>
              <Text style={styles.infoValue}>{routeDetails.departure_time}</Text>
            </View>

            <View style={styles.infoSeparator} />

            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={20} color={styles.colors.primary} />
              <Text style={styles.infoLabel}>Stops</Text>
              <Text style={styles.infoValue}>{routeDetails.stops?.stops?.length || 0}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Map Container with Toggle */}
        <Animated.View
          style={[
            styles.mapWrapper,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.mapHeader}>
            <View style={styles.mapHeaderLeft}>
              <Ionicons name="map-outline" size={20} color={styles.colors.primary} />
              <Text style={styles.mapTitle}>Route Map</Text>
            </View>
            <TouchableOpacity
              style={[styles.mapToggleButton, !showMap && styles.mapToggleButtonHidden]}
              onPress={() => setShowMap(!showMap)}
            >
              <Text style={styles.mapToggleText}>
                {showMap ? "Hide Map" : "Show Map"}
              </Text>
              <Ionicons
                name={showMap ? "chevron-up" : "chevron-down"}
                size={16}
                color={showMap ? styles.colors.surface : styles.colors.primary}
              />
            </TouchableOpacity>
          </View>

          {showMap && (
            <View
              style={styles.mapContainer}
              onTouchStart={handleMapTouchStart}
              onTouchEnd={handleMapTouchEnd}
              onTouchCancel={handleMapTouchEnd}
            >
              {routeDetails && (
                <MapComponent
                  routeDetails={routeDetails}
                  onMapTouchStart={handleMapTouchStart}
                  onMapTouchEnd={handleMapTouchEnd}
                />
              )}
            </View>
          )}
        </Animated.View>

        {/* Stops Information */}
        {routeDetails.stops?.stops?.length > 0 && (
          <Animated.View
            style={[
              styles.card,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <View style={styles.sectionHeader}>
              <Ionicons name="location" size={20} color={styles.colors.primary} />
              <Text style={styles.subtitle}>Bus Stops</Text>
            </View>

            <View style={styles.stopsContainer}>
              {routeDetails.stops.stops.map((stop: any, index: number) => (
                <View key={index} style={styles.stopContainer}>
                  <View style={styles.stopNumberContainer}>
                    <Text style={styles.stopNumber}>{index + 1}</Text>
                  </View>
                  <View style={styles.stopLine} />
                  <View style={styles.stopDetails}>
                    <Text style={styles.stopName}>{stop.name}</Text>
                    <TouchableOpacity
                      style={styles.infoButton}
                      onPress={() =>
                        router.push({
                          pathname: "/stop-info/stopInfo",
                          params: { stopName: stop.name },
                        })
                      }
                    >
                      <Text style={styles.infoButtonText}>View Info</Text>
                      <Ionicons name="chevron-forward" size={16} color={styles.colors.surface} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Feedback Button */}
        <Animated.View
          style={[
            styles.feedbackButtonContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <TouchableOpacity 
            style={styles.feedbackButton}
            onPress={handleFeedback}
          >
            <Ionicons name="star-outline" size={20} color={styles.colors.surface} />
            <Text style={styles.feedbackButtonText}>Submit Feedback</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Advertisement Section */}
        {relevantAd && (
          <Animated.View
            style={[
              styles.adContainer,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <View style={styles.adBadge}>
              <Text style={styles.adBadgeText}>OFFER</Text>
            </View>
            <Text style={styles.adTitle}>{relevantAd.title}</Text>
            <Image
              source={{
                uri: relevantAd.image_url || "https://via.placeholder.com/400x200?text=Advertisement",
              }}
              style={styles.adImage}
              resizeMode="cover"
            />
            <Text style={styles.adText}>
              {relevantAd.description}
            </Text>
            <TouchableOpacity
              style={styles.adButton}
              onPress={() => handleAdPress(relevantAd.link)}
            >
              <Text style={styles.adButtonText}>View Offer</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {adLoading && (
          <View style={styles.adLoadingContainer}>
            <ActivityIndicator size="small" color={styles.colors.primary} />
            <Text style={styles.adLoadingText}>Loading offers...</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

// Create a color palette for consistent styling
const COLORS = {
  primary: "#2663FF", // Brighter blue
  primaryLight: "#E5EDFF",
  primaryDark: "#0039CB",
  secondary: "#FFC107",
  secondaryDark: "#FFA000",
  background: "#F8F9FC", // Lighter background
  surface: "#ffffff",
  text: "#333333",
  textSecondary: "#666666",
  textLight: "#8E8E93",
  error: "#FF3B30", // iOS-style error color
  success: "#4CD964", // iOS-style success color
  adBackground: "#FFF8E1",
  adAccent: "#FF9500", // Brighter orange
  shadowColor: "#000000",
  divider: "#E5E5EA",
}

// Extract window dimensions for responsive sizing
const { width, height } = Dimensions.get("window")

const styles = StyleSheet.create({
  // Color palette for easy reference
  colors: COLORS,

  // Base container
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContainer: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 32,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20, // Adjust based on safe area
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },

  backButton: {
    padding: 8,
  },

  // Route Card Styling
  routeCard: {
    marginTop: 16,
    position: 'relative',
    paddingTop: 25,
  },

  routeNumberBadge: {
    position: 'absolute',
    top: -16,
    left: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  routeNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.surface,
  },

  infoRow: {
    flexDirection: 'row',
    marginTop: 16,
    justifyContent: 'space-between',
  },

  infoItem: {
    flex: 1,
    alignItems: 'center',
  },

  infoSeparator: {
    width: 1,
    height: '80%',
    backgroundColor: COLORS.divider,
  },

  infoLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },

  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 4,
  },

  // Map styling
  mapWrapper: {
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: COLORS.surface,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  mapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },

  mapHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  mapTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginLeft: 8,
  },

  mapToggleButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },

  mapToggleButtonHidden: {
    backgroundColor: COLORS.primary,
  },

  mapToggleText: {
    color: COLORS.surface,
    fontWeight: "600",
    fontSize: 14,
    marginRight: 4,
  },

  mapContainer: {
    height: height * 0.6,
    width: "100%",
    minHeight: 250,
  },

  // Card styling
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 10,
    marginHorizontal: 16,
    marginVertical: 1,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  // Section headers
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  // Typography
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
  },

  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginLeft: 8,
  },

  // Stops styling
  stopsContainer: {
    marginTop: 8,
  },

  stopContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },

  stopNumberContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  stopNumber: {
    color: COLORS.surface,
    fontWeight: "bold",
    fontSize: 14,
  },

  stopLine: {
    width: 2,
    height: '85%',
    backgroundColor: COLORS.primaryLight,
    marginLeft: 13,
    position: 'absolute',
    top: 28,
    zIndex: -1,
  },

  stopDetails: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: 16,
    paddingVertical: 4,
  },

  stopName: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "500",
    flex: 1,
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
    marginBottom: 24,
  },

  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },

  retryButtonText: {
    color: COLORS.surface,
    fontWeight: "bold",
    fontSize: 16,
  },

  // Button styling
  infoButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: "row",
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
    fontWeight: "600",
    marginRight: 4,
  },

  // Feedback button styling
  feedbackButtonContainer: {
    marginHorizontal: 16,
    marginVertical: 12,
  },

  feedbackButton: {
    backgroundColor: COLORS.success,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  feedbackButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },

  // Advertisement styling
  adContainer: {
    backgroundColor: "snow",
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 12,
    marginBottom: 24,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    position: "relative",
    overflow: "hidden",
  },

  adBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: COLORS.adAccent,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomLeftRadius: 12,
  },

  adBadgeText: {
    color: COLORS.surface,
    fontWeight: "bold",
    fontSize: 12,
  },

  adTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: COLORS.text,
    textAlign: "center",
  },

  adImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginBottom: 16,
  },

  adText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },

  adButton: {
    backgroundColor: COLORS.adAccent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    elevation: 2,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  adButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.surface,
  },

  // Ad loading state
  adLoadingContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  adLoadingText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
})