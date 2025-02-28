"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import axios from "axios"

export default function StopInfoScreen() {
  const router = useRouter()
  const { stopName } = useLocalSearchParams<{ stopName: string }>()
  const [stopInfo, setStopInfo] = useState<any | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStopDetails = async () => {
      if (!stopName) {
        setError("Invalid Stop Name")
        setLoading(false)
        return
      }

      try {
        const response = await axios.get(`https://adcet-backend.onrender.com/api/v1/user/stop-details/${stopName}`)
        setStopInfo(response.data.stops || { name: "Unknown Stop", description: "No information available." })
      } catch (err) {
        console.error("Error fetching stop details:", err)
        setError("Failed to load stop information. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(() => {
      fetchStopDetails()
    }, 500)

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
        <TouchableOpacity style={styles.retryButton} onPress={() => setLoading(true)}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
      
      <View style={styles.contentCard}>
        <Text style={styles.title}>{stopInfo.name}</Text>
        <Text style={styles.infoText}>{stopInfo.description}</Text>
      </View>
    </ScrollView>
  )
}

const COLORS = {
  primary: "#1a73e8",
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
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: "500",
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
})
