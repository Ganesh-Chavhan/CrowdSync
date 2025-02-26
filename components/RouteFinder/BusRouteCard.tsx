"use client"

import type React from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { useRouter } from "expo-router"
import { styles } from "@/styles/routeFinder.styles"
import type { BusRoute } from "./types"

interface BusRouteCardProps {
  route: any
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
    <View style={[styles.busRouteContainer, cardStyles.container]}>
      <View style={[styles.busHeader, cardStyles.header]}>
        <Text style={[styles.busNumber, cardStyles.routeName]}>{route.route_name}</Text>

        <TouchableOpacity onPress={handleViewDetails} style={cardStyles.viewButton}>
          <Text style={[styles.backButton, cardStyles.viewButtonText]}>View Details</Text>
        </TouchableOpacity>
      </View>

      <View>
        <Text style={cardStyles.routeName}>Bus: {route.bus.bus_number}</Text>
      </View>

      <View style={[styles.timeContainer, cardStyles.timeSection]}>
        <Text style={[styles.timeText, cardStyles.timeText]}>Departure Time: {route.departure_time}</Text>
      </View>

      <View style={[styles.routeInfo, cardStyles.infoSection]}>
        <View style={cardStyles.routeDetails}>
          <Text style={[styles.routeText, cardStyles.locationText]}>From: {route.start_location}</Text>
          <Text style={[styles.routeText, cardStyles.locationText]}>To: {route.end_location}</Text>
          <Text style={[styles.statusText, cardStyles.statusText]}>Status: {route.status}</Text>
        </View>
        <View style={cardStyles.crowdSection}>
          <Text style={cardStyles.crowdText}>
            Crowd: {(() => {
              const occupancyRate = (route.bus.current_passenger_count / route.bus.capacity) * 100;
              const percentage = occupancyRate.toFixed(0) + '%';
              if (occupancyRate >= 80) return <Text style={{color: '#FF0000'}}>{`High (${percentage})`}</Text>;
              if (occupancyRate >= 40) return <Text style={{color: '#FFA500'}}>{`Medium (${percentage})`}</Text>;
              return <Text style={{color: '#008000'}}>{`Low (${percentage})`}</Text>;
            })()}
          </Text>
        </View>
      </View>
    </View>
  )
}

const cardStyles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  viewButton: {
    padding: 8,
  },
  viewButtonText: {
    color: '#1a73e8',
    fontSize: 14,
    fontWeight: '500',
  },
  timeSection: {
    marginBottom: 12,
  },
  timeText: {
    fontSize: 14,
    color: '#666',
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  routeDetails: {
    flex: 1,
  },
  locationText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 4,
  },
  crowdSection: {
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 6,
    justifyContent: 'center',
  },
  crowdText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  }
})
