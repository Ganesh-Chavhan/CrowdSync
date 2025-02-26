"use client"

import type React from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { useRouter } from "expo-router"
import { styles } from "@/styles/routeFinder.styles"
import type { BusRoute } from "./types"

interface BusRouteCardProps {
  route: BusRoute
}

export const BusRouteCard: React.FC<BusRouteCardProps> = ({ route }) => {
  const router = useRouter()

  const handleViewDetails = () => {
    router.push({
      pathname: "/route-details",
      params: { routeId: route.id },
    })
  }

  return (
    <View style={styles.busRouteContainer}>
      <View style={styles.busHeader}>
        <Text style={styles.busNumber}>Route: {route.route_name}</Text>
        <TouchableOpacity onPress={handleViewDetails}>
          <Text style={[styles.backButton, { color: "#1a73e8" }]}>View Details</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>Departure Time: {route.departure_time}</Text>
        <Text style={styles.timeText}>Created: {new Date(route.created_at).toLocaleDateString()}</Text>
      </View>

      <View style={styles.routeInfo}>
        <Text style={styles.routeText}>From: {route.start_location}</Text>
        <Text style={styles.routeText}>To: {route.end_location}</Text>
        <Text style={styles.statusText}>Status: {route.status}</Text>
      </View>
    </View>
  )
}

