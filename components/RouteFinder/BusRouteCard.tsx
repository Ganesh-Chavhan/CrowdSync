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
  
  if (occupancyRate >= 80) {
    crowdStatus = 'High'
    crowdColor = currentColors.danger
    crowdStyle = styles.crowdIndicatorHigh
  } else if (occupancyRate >= 40) {
    crowdStatus = 'Medium'
    crowdColor = currentColors.warning
    crowdStyle = styles.crowdIndicatorMedium
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
            { scale: scaleAnim },
            { scale: pressAnim }
          ],
          // Optimized for mobile - lighter shadows, rounded corners
          shadowColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.6,
          shadowRadius: 4,
          elevation: 3,
          borderRadius: 16,
          marginHorizontal: 10,
          marginBottom: 12,
          backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF'
        }
      ]}
    >
      {/* Status badge optimized for mobile */}
      <View style={[
        styles.statusChip, 
        { 
          backgroundColor: route.status === 'On Time' 
            ? theme === 'dark' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)' 
            : theme === 'dark' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(251, 191, 36, 0.1)',
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 1,
          borderRadius: 20,
          paddingHorizontal: 8,
          paddingVertical: 3
        }
      ]}>
        <Feather 
          name={route.status === 'On Time' ? "check-circle" : "alert-circle"} 
          size={12} 
          color={route.status === 'On Time' ? currentColors.success : currentColors.warning} 
          style={{ marginRight: 4 }} 
        />
        <Text 
          style={[
            styles.statusText, 
            { 
              color: route.status === 'On Time' ? currentColors.success : currentColors.warning,
              fontSize: 12,
              fontWeight: '600'
            }
          ]}
        >
          {route.status}
        </Text>
      </View>

      <View style={[styles.busHeader, { paddingTop: 14, paddingHorizontal: 14 }]}>
        <View style={styles.row}>
          <View style={[
            { 
              backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
              borderRadius: 10,
              width: 40,
              height: 40,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12
            }
          ]}>
            <Feather name="navigation" size={18} color={theme === 'dark' ? currentColors.accent : currentColors.primary} />
          </View>
          <View>
            <Text style={[styles.busNumber, { fontSize: 18, fontWeight: '700' }]}>{route.route_name}</Text>
            <Text style={[styles.routeText, { fontSize: 13, marginTop: 2, opacity: 0.7 }]}>
              Bus: {route.bus.bus_number}
            </Text>
          </View>
        </View>
      </View>

      {/* Custom separator optimized for mobile */}
      <View style={{ 
        height: 1, 
        backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)', 
        marginVertical: 12, 
        marginHorizontal: 14 
      }} />

      <View style={[styles.timeContainer, { paddingHorizontal: 14 }]}>
        <View style={[styles.row, { justifyContent: 'space-between', flexWrap: 'wrap' }]}>
          <View style={[styles.row, { 
            backgroundColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
            borderRadius: 8,
            paddingHorizontal: 8,
            paddingVertical: 4,
            marginBottom: 4
          }]}>
            <Feather name="clock" size={12} color={theme === 'dark' ? currentColors.success : currentColors.primary} style={{ marginRight: 4 }} />
            <Text style={[styles.timeText, { fontSize: 12, fontWeight: '600' }]}>
              Departure: {route.departure_time}
            </Text>
          </View>
          
          <View style={[styles.row, { 
            backgroundColor: theme === 'dark' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)',
            borderRadius: 8,
            paddingHorizontal: 8,
            paddingVertical: 4,
            marginBottom: 4
          }]}>
            <Feather name="map-pin" size={12} color={theme === 'dark' ? '#a78bfa' : '#8b5cf6'} style={{ marginRight: 4 }} />
            <Text style={[styles.timeText, { fontSize: 12, fontWeight: '600', color: theme === 'dark' ? '#a78bfa' : '#8b5cf6' }]}>
              {etaText}
            </Text>
          </View>
        </View>
      </View>

      {/* Occupancy section - optimized for mobile */}
      <View style={[styles.routeInfo, { marginTop: 12, paddingHorizontal: 14 }]}>
        <View style={[styles.row, styles.spaceBetween, { marginBottom: 8 }]}>
          <Text style={[styles.sectionTitle, { fontSize: 14, fontWeight: '600' }]}>Current Occupancy</Text>
          <Text style={[styles.badge, { 
            backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)',
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 4,
            fontSize: 12
          }]}>
            <Text style={{ color: crowdColor, fontWeight: '700' }}>{percentage}</Text>
          </Text>
        </View>
        
        {/* Custom progress container optimized for mobile */}
        <View style={{ 
          height: 6, 
          backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          borderRadius: 3,
          marginBottom: 10,
          overflow: 'hidden'
        }}>
          <Animated.View 
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%']
              }),
              backgroundColor: crowdColor,
              borderRadius: 3
            }} 
          />
        </View>
        
        <View style={[styles.crowdIndicator, crowdStyle, styles.row, {
          alignSelf: 'flex-start',
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 6,
          backgroundColor: theme === 'dark' ? `${crowdColor}20` : `${crowdColor}10`
        }]}>
          <Feather 
            name={occupancyRate >= 80 ? "users" : occupancyRate >= 40 ? "user-plus" : "user"} 
            size={12} 
            color={crowdColor} 
            style={{ marginRight: 4 }} 
          />
          <Text style={{ color: crowdColor, fontWeight: '600', fontSize: 12 }}>
            {crowdStatus} Crowd Level
          </Text>
        </View>
      </View>
      
      {/* View details button - optimized for mobile */}
      <Animated.View style={{ 
        transform: [{ scale: pressAnim }],
        width: '100%',
        paddingHorizontal: 14,
        paddingBottom: 14,
        paddingTop: 2,
        marginTop: 12
      }}>
        <TouchableOpacity
          onPress={handleViewDetails}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[styles.detailsButton, { 
            backgroundColor: theme === 'dark' ? currentColors.accent : currentColors.primary,
            borderRadius: 10,
            paddingVertical: 10,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: theme === 'dark' ? currentColors.accent : currentColors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 3,
            elevation: 2
          }]}
          activeOpacity={0.8}
        >
          <View style={[styles.buttonWithIcon, { justifyContent: 'center' }]}>
            <Text style={[styles.detailsButtonText, { fontSize: 14, fontWeight: '600', marginRight: 6 }]}>View Details</Text>
            <Feather name="arrow-right" size={14} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  )
}