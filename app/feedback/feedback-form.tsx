"use client"

import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Platform
} from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

export default function FeedbackForm() {
  const router = useRouter()
  const { routeId } = useLocalSearchParams<{ routeId: string }>()
  
  const [rating, setRating] = useState(0)
  const [punctuality, setPunctuality] = useState('')
  const [busCondition, setBusCondition] = useState('')
  const [driverBehavior, setDriverBehavior] = useState('')
  const [comments, setComments] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  // Handle back navigation
  const handleBack = () => router.back()

  // Handle form submission
  const handleSubmit = async () => {
    if (!rating || !punctuality || !busCondition || !driverBehavior) {
      return // Don't submit if required fields are missing
    }

    try {
      setLoading(true)
      
      const feedbackData = {
        routeId,
        rating,
        punctuality,
        busCondition,
        driverBehavior,
        comments
      }
      
      console.log("Submitting feedback:", feedbackData)
      
      // Mock API call - replace with your actual API endpoint
      // await fetch('your-api-endpoint', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(feedbackData)
      // })
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSubmitted(true)
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setRating(0)
        setPunctuality('')
        setBusCondition('')
        setDriverBehavior('')
        setComments('')
        setSubmitted(false)
        router.back() // Return to previous screen
      }, 3000)
    } catch (error) {
      console.error("Error submitting feedback:", error)
    } finally {
      setLoading(false)
    }
  }

  // Custom radio button component
  const RadioButton = ({ 
    label, 
    selected, 
    onPress 
  }: { 
    label: string, 
    selected: boolean, 
    onPress: () => void 
  }) => (
    <TouchableOpacity 
      style={styles.radioOption} 
      onPress={onPress}
      activeOpacity={0.7}
      accessible={true}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
    >
      <View style={[styles.radioCircle, selected && styles.radioCircleSelected]}>
        {selected && <View style={styles.radioInnerCircle} />}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
  )

  if (submitted) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <Ionicons name="checkmark-circle" size={64} color={COLORS.success} />
          <Text style={styles.successTitle}>Thank You!</Text>
          <Text style={styles.successText}>Your feedback has been submitted successfully.</Text>
          <Text style={styles.successText}>Your feedback helps us improve our service.</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bus Route Feedback</Text>
        <View style={{ width: 24 }} /> {/* Empty view for balance */}
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          <Text style={styles.formDescription}>
            How was your experience with this bus route? Please rate and share any suggestions to help us improve!
          </Text>

          {/* Star Rating */}
          <View style={styles.fieldset}>
            <Text style={styles.label}>Rating (1-5 stars)</Text>
            <View style={styles.starContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`${star} star${star === 1 ? '' : 's'}`}
                  accessibilityState={{ selected: star <= rating }}
                >
                  <Ionicons
                    name={star <= rating ? "star" : "star-outline"}
                    size={32}
                    color={star <= rating ? COLORS.starActive : COLORS.starInactive}
                    style={styles.star}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Punctuality */}
          <View style={styles.fieldset}>
            <Text style={styles.label}>Bus Arrival</Text>
            <View style={styles.radioGroup}>
              {['On time', 'Early', 'Late'].map(option => (
                <RadioButton
                  key={option}
                  label={option}
                  selected={punctuality === option}
                  onPress={() => setPunctuality(option)}
                />
              ))}
            </View>
          </View>

          {/* Bus Condition */}
          <View style={styles.fieldset}>
            <Text style={styles.label}>Bus Condition</Text>
            <View style={styles.radioGroup}>
              {['Clean', 'Average', 'Needs Improvement'].map(option => (
                <RadioButton
                  key={option}
                  label={option}
                  selected={busCondition === option}
                  onPress={() => setBusCondition(option)}
                />
              ))}
            </View>
          </View>

          {/* Driver Behavior */}
          <View style={styles.fieldset}>
            <Text style={styles.label}>Comfort</Text>
            <View style={styles.radioGroup}>
              {['Good', 'Neutral', 'Can be better'].map(option => (
                <RadioButton
                  key={option}
                  label={option}
                  selected={driverBehavior === option}
                  onPress={() => setDriverBehavior(option)}
                />
              ))}
            </View>
          </View>

          {/* Additional Comments */}
          <View style={styles.fieldset}>
            <Text style={styles.label}>Additional Comments (optional)</Text>
            <TextInput
              style={styles.textArea}
              value={comments}
              onChangeText={setComments}
              placeholder="Share your suggestions or comments about your journey..."
              placeholderTextColor={COLORS.textLight}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!rating || !punctuality || !busCondition || !driverBehavior) && 
              styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!rating || !punctuality || !busCondition || !driverBehavior || loading}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Submit Feedback"
            accessibilityState={{ disabled: !rating || !punctuality || !busCondition || !driverBehavior || loading }}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.surface} size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Feedback</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

// Create a color palette for consistent styling
const COLORS = {
  primary: "#2663FF",
  primaryLight: "#E5EDFF",
  primaryDark: "#0039CB",
  secondary: "#FFC107",
  secondaryDark: "#FFA000",
  background: "#F8F9FC",
  surface: "#ffffff",
  text: "#333333",
  textSecondary: "#666666",
  textLight: "#8E8E93",
  error: "#FF3B30",
  success: "#4CD964",
  starActive: "#FFB400",
  starInactive: "#D1D1D6",
  shadowColor: "#000000",
  divider: "#E5E5EA",
}

// Extract window dimensions for responsive sizing
const { width, height } = Dimensions.get("window")

const styles = StyleSheet.create({
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
    paddingTop: Platform.OS === 'ios' ? 50 : 20, // Adjusted for iOS safe area
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

  // Form styling
  formContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  formDescription: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 20,
    fontWeight: '500',
  },

  fieldset: {
    marginBottom: 24,
  },

  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },

  // Star rating
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  star: {
    marginRight: 8,
  },

  // Radio buttons
  radioGroup: {
    marginTop: 8,
  },

  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 6,  // Added padding for better touch target
  },

  radioCircle: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  radioCircleSelected: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },

  radioInnerCircle: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },

  radioLabel: {
    fontSize: 16,
    color: COLORS.text,
  },

  // Text area
  textArea: {
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    minHeight: 100,
  },

  // Submit button
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  submitButtonDisabled: {
    backgroundColor: COLORS.primaryLight,
    opacity: 0.7,
  },

  submitButtonText: {
    color: COLORS.surface,
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Success screen
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: COLORS.surface,
    margin: 16,
    borderRadius: 16,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },

  successText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
})