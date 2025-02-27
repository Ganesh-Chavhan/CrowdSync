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
    const fetchStopInfo = async () => {
      try {
        if (!stopName) {
          setError("Invalid Stop Name")
          setLoading(false)
          return
        }
        const response = await fetch("https://api.deepseek.com/v1/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer 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" // Use your API key
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [{ role: "user", content: `Show me the info of ${stopName} in 100 words.` }],
            max_tokens: 200
          })
        })
        const data = await response.json()
        // Ensure the correct field is accessed
        if (data.choices && data.choices.length > 0 && data.choices[0].message) {
          setStopInfo(data.choices[0].message.content)
        } else {
          setStopInfo("No information found for this location.")
        }
      } catch (err) {
        setError("Error fetching stop details. Please try again.")
        console.error("Error fetching stop details:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchStopInfo()
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
      <Text style={styles.title}>Information about {stopName}</Text>
      <Text style={styles.infoText}>{stopInfo}</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
    color: "#666",
  },
  errorText: {
    fontSize: 18,
    textAlign: "center",
    color: "red",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
    textAlign: "center",
  },
  infoText: {
    fontSize: 16,
    color: "#555",
    textAlign: "justify",
  },
  backButton: {
    backgroundColor: "#1a73e8",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
})