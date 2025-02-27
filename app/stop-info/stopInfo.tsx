"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"

export default function StopInfoScreen() {
  const router = useRouter()
  const { stopName } = useLocalSearchParams<{ stopName: string }>()
  const [stopInfo, setStopInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simulate a brief loading time for better UX
    const timer = setTimeout(() => {
      if (!stopName) {
        setError("Invalid Stop Name")
        setLoading(false)
        return
      }

      // Determine stop information based on stopName
      let info = ""
      
      if (stopName === "Sangli, MH, India") {
        info = "Sangli is a city in Maharashtra, India, known for its turmeric trade. It features the historic Ganapati Temple, Irwin Bridge, and scenic spots along the Krishna River. The city hosts vibrant markets and is famous for its traditional Maharashtrian cuisine. Sangli Bus Stand is a major transportation hub connecting to nearby cities and villages."
      } 
      else if (stopName === "Ashta, MH, India") {
        info = "Ashta is a small town in Maharashtra's Sangli district, known for agricultural activities and sugar production. It has several temples including the Siddheshwar Temple. The town's bus stand is centrally located, providing connections to Sangli, Kolhapur, and other nearby towns. Local markets offer fresh produce from surrounding farms."
      } 
      else if (stopName === "Islāmpur, MH, India") {
        info = "Islāmpur is a town in Sangli district, Maharashtra, located near the Krishna River. It's an important commercial center for the region with a growing industrial sector. The bus station serves as a key transit point for travelers heading to Kolhapur, Pune, and Sangli. The town is known for its educational institutions and weekly market."
      } 
      else if (stopName === "Karad, MH, India") {
        info = "Karad is a historic city in Satara district, Maharashtra, situated at the confluence of the Krishna and Koyna rivers. It has significant historical importance with sites like Prithviraj Chauhan's tomb. The Karad Bus Stand is a major transport hub in western Maharashtra. The city is known for its educational institutions and is surrounded by lush agricultural land."
      } 
      else if (stopName === "Jaysingpur, MH, India") {
        info = "Jaysingpur is a city in Kolhapur district, Maharashtra, known for its sugar factories and agricultural market. It's an important commercial hub for the surrounding rural areas. The city has several educational institutions and a vibrant local culture. The bus stand connects travelers to major cities like Kolhapur, Sangli, and Belgaum."
      } 
      else if (stopName === "Shirol, MH, India") {
        info = "Shirol is a historic town in Kolhapur district, Maharashtra, located near the Krishna River. It's known for the ancient Shirol Fort and temples. The town is surrounded by fertile agricultural land and is a center for sugar production. The bus stand provides connections to nearby cities and rural areas."
      } 
      else if (stopName === "Kurundwad PHC, MH, India") {
        info = "Kurundwad is a small town divided by the Panchganga River in Kolhapur district, Maharashtra. It has historical significance with the Kurundwad Palace and was formerly a princely state. The Primary Health Center (PHC) provides essential healthcare services to the town and surrounding villages. The bus stop is a vital connection point for healthcare access in the region."
      } 

      else {
        info = "No detailed information is available for this location. This stop is part of the regular bus route network in Maharashtra."
      }

      setStopInfo(info)
      setLoading(false)
    }, 800) // 800ms delay to simulate loading

    return () => clearTimeout(timer)
  }, [stopName])

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1a73e8" />
        <Text style={styles.loadingText}>Fetching stop details...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
      
      <View style={styles.contentCard}>
        <Text style={styles.title}>{stopName}</Text>
        <Text style={styles.infoText}>{stopInfo}</Text>
        
        <View style={styles.facilitiesContainer}>
          <Text style={styles.facilitiesTitle}>Available Facilities:</Text>
          <View style={styles.facilitiesList}>
            <View style={styles.facilityItem}>
              <View style={styles.facilityDot}></View>
              <Text style={styles.facilityText}>Waiting Area</Text>
            </View>
            <View style={styles.facilityItem}>
              <View style={styles.facilityDot}></View>
              <Text style={styles.facilityText}>Restrooms</Text>
            </View>
            <View style={styles.facilityItem}>
              <View style={styles.facilityDot}></View>
              <Text style={styles.facilityText}>Food Stalls</Text>
            </View>
            <View style={styles.facilityItem}>
              <View style={styles.facilityDot}></View>
              <Text style={styles.facilityText}>Ticket Counter</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

// Define a color palette for consistent styling
const COLORS = {
  primary: "#1a73e8",
  primaryDark: "#0d47a1",
  background: "#f5f5f5",
  surface: "#ffffff",
  text: "#333333",
  textSecondary: "#555555",
  accent: "#4CAF50",
  error: "#d32f2f",
  shadow: "#000000",
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
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
    color: COLORS.textSecondary,
  },
  errorText: {
    fontSize: 18,
    textAlign: "center",
    color: COLORS.error,
  },
  contentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    color: COLORS.text,
  },
  infoText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    alignSelf: "flex-start",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  backButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: "bold",
  },
  facilitiesContainer: {
    marginTop: 8,
  },
  facilitiesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: COLORS.text,
  },
  facilitiesList: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 16,
  },
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  facilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
    marginRight: 12,
  },
  facilityText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});