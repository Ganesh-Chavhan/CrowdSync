import React, { useState, useEffect, useRef } from "react"
import { View, Text, TouchableOpacity, Animated, Platform, Pressable } from "react-native"
import { useRouter } from "expo-router"
import { createStyles, colors } from "@/styles/routeFinder.styles"
import { Feather } from '@expo/vector-icons'
import type { BusRoute } from "./types"
import * as Haptics from 'expo-haptics'

interface BusRouteCardProps {
  route: any;
  theme: 'light' | 'dark';
  index?: number;
}

export const BusRouteCard: React.FC<BusRouteCardProps> = ({ route, theme = 'light', index = 0 }) => {
  const router = useRouter()
  const styles = createStyles(theme)
  const currentColors = colors[theme]
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.95)).current
  const pressAnim = useRef(new Animated.Value(1)).current

  // Progress animation
  const progressAnim = useRef(new Animated.Value(0)).current
  
  useEffect(() => {
    // Staggered animation based on index
    const delay = index * 100
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 450,
        delay,
        useNativeDriver: true
      })
    ]).start()
    
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: occupancyRate / 100,
      duration: 800,
      delay: delay + 300,
      useNativeDriver: false
    }).start()
  }, [])

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 0.98,
      friction: 8,
      tension: 300,
      useNativeDriver: true
    }).start()
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
  }

  const handlePressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      friction: 8,
      tension: 300,
      useNativeDriver: true
    }).start()
  }

  const handleViewDetails = () => {
    // Add haptic feedback on press
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    }
    
    router.push({
      pathname: "/route-details",
      params: { routeId: route.id },
    })
  }

  // Calculate occupancy data
  const occupancyRate = (route.bus.current_passenger_count / route.bus.capacity) * 100
  const percentage = occupancyRate.toFixed(0) + '%'
  
  let crowdStatus = 'Low'
  let crowdColor = currentColors.success
  let crowdStyle = styles.crowdIndicatorLow
  let progressStyle = styles.progressFillLow
  
  if (occupancyRate >= 80) {
    crowdStatus = 'High'
    crowdColor = currentColors.danger
    crowdStyle = styles.crowdIndicatorHigh
    progressStyle = styles.progressFillHigh
  } else if (occupancyRate >= 40) {
    crowdStatus = 'Medium'
    crowdColor = currentColors.warning
    crowdStyle = styles.crowdIndicatorMedium
    progressStyle = styles.progressFillMedium
  }

  // Calculate ETA
  const etaText = route.eta ? `${route.eta} min` : 'On schedule'

  return (
    <Animated.View 
      style={[
        styles.busRouteContainer, 
        { 
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim }
          ]
        }
      ]}
    >
      {/* Status badge - new */}
      <View style={[
        styles.statusChip, 
        { 
          backgroundColor: route.status === 'On Time' 
            ? theme === 'dark' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)' 
            : theme === 'dark' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(251, 191, 36, 0.1)' 
        }
      ]}>
        <Feather 
          name={route.status === 'On Time' ? "check-circle" : "alert-circle"} 
          size={14} 
          color={route.status === 'On Time' ? currentColors.success : currentColors.warning} 
          style={{ marginRight: 6 }} 
        />
        <Text 
          style={[
            styles.statusText, 
            { color: route.status === 'On Time' ? currentColors.success : currentColors.warning }
          ]}
        >
          {route.status}
        </Text>
      </View>

      <View style={styles.busHeader}>
        <View style={styles.row}>
          <View style={{ marginLeft: 12 }}>
            <Text style={[styles.busNumber]}>{route.route_name}</Text>
            <Text style={[styles.routeText, { marginTop: 2, marginBottom: 0 }]}>
              Bus: {route.bus.bus_number}
            </Text>
          </View>
        </View>
      </View>

      

      <View style={styles.timeContainer}>
        <View style={[styles.row, { justifyContent: 'space-between' }]}>
          <View style={styles.row}>
            <Feather name="clock" size={14} color={theme === 'dark' ? currentColors.success : currentColors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.timeText}>Departure Time : {route.departure_time}</Text>
          </View>
          
          
        </View>
      </View>

      {/* Occupancy section - improved */}
      <View style={[styles.routeInfo, { marginTop: 12 }]}>
        <View style={[styles.row, styles.spaceBetween]}>
          <Text style={[styles.sectionTitle]}>Current Occupancy</Text>
          <Text style={[styles.badge, { backgroundColor: 'transparent' }]}>
            <Text style={{ color: crowdColor, fontWeight: '600' }}>{percentage}</Text>
          </Text>
        </View>
        
        
        
        <View style={[styles.crowdIndicator, crowdStyle, styles.row]}>
          <Feather 
            name={occupancyRate >= 80 ? "users" : occupancyRate >= 40 ? "user-plus" : "user"} 
            size={14} 
            color={crowdColor} 
            style={{ marginRight: 6 }} 
          />
          <Text style={{ color: crowdColor, fontWeight: '500' }}>
            {crowdStatus} Crowd Level
          </Text>
        </View>
      </View>
      
      {/* View details button - new style */}
      <TouchableOpacity
        onPress={handleViewDetails}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.detailsButton, { marginTop: 16, alignSelf: 'center' }]}
        activeOpacity={0.7}
      >
        <View style={styles.buttonWithIcon}>
          <Text style={styles.detailsButtonText}>View Details</Text>
          <Feather name="arrow-right" size={14} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}