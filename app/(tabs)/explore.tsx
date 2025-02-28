import { StyleSheet, Platform } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function ExploreScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="bus.fill" // Changed to a bus icon
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">🚀 Our Vision for the Future</ThemedText>
      </ThemedView>
      <ThemedText>
        We are constantly evolving to make public transportation smarter, more reliable, and user-friendly. 
        Here's what we plan to achieve in the near future:
      </ThemedText>

      <Collapsible title="📌 Real-time Bus Tracking with ETA Predictions">
        <ThemedText>
          Know exactly when your bus will arrive with our advanced ETA prediction system. 
          Our algorithm accounts for traffic patterns, weather conditions, and historical data 
          to provide the most accurate arrival times possible.
        </ThemedText>
        <ThemedText>
          With real-time GPS tracking, you'll be able to see your bus moving on the map as it 
          approaches your stop, giving you peace of mind and better control over your schedule.
        </ThemedText>
      </Collapsible>

      <Collapsible title="📌 User Feedback Integration for Route Improvements">
        <ThemedText>
          Your voice matters! Our upcoming feedback system will allow passengers to suggest 
          route improvements, report issues, and rate their travel experience directly within the app.
        </ThemedText>
        <ThemedText>
          This valuable data will help us optimize routes, adjust schedules, and address pain points 
          to create a transportation network that truly serves the community's needs.
        </ThemedText>
      </Collapsible>

      <Collapsible title="📌 AI-Based Crowd Density Estimation">
        <ThemedText>
          Plan your journey with confidence by knowing how crowded your bus will be before it arrives. 
          Our AI system will analyze historical ridership data, special events, and real-time 
          passenger counts to predict crowd levels throughout the day.
        </ThemedText>
        <ThemedText>
          This feature helps you choose the most comfortable travel time and allows us to 
          adjust capacity to meet demand more efficiently.
        </ThemedText>
      </Collapsible>

      <Collapsible title="📌 Smart Ticketing & Payment System">
        <ThemedText>
          Say goodbye to paper tickets and exact change requirements. Our upcoming smart ticketing 
          system will support contactless payments, mobile tickets, and subscription-based travel plans.
        </ThemedText>
        <ThemedText>
          With features like fare capping, multi-modal journey tickets, and family passes, 
          we're making public transport more affordable and accessible for everyone.
        </ThemedText>
      </Collapsible>

      <Collapsible title="📌 SOS & Emergency Assistance Feature">
        <ThemedText>
          Your safety is our priority. Soon, our app will include an SOS button that connects 
          passengers directly to emergency services or our support team in case of emergencies.
        </ThemedText>
        <ThemedText>
          This feature will transmit your exact location and relevant information to first responders, 
          ensuring fast assistance when you need it most.
        </ThemedText>
      </Collapsible>

      <ThemedView style={styles.feedbackContainer}>
        <ThemedText type="defaultSemiBold">Have suggestions? We'd love to hear them!</ThemedText>
        <ExternalLink href="mailto:feedback@smarttransit.app">
          <ThemedText type="link">Send us your ideas</ThemedText>
        </ExternalLink>
      </ThemedView>
      
      {Platform.select({
        ios: (
          <ThemedText style={styles.footerText}>
            Follow our development journey and be the first to test new features by joining our beta program.
          </ThemedText>
        ),
        default: (
          <ThemedText style={styles.footerText}>
            Making public transportation work better for everyone, one update at a time.
          </ThemedText>
        ),
      })}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  feedbackContainer: {
    marginTop: 20,
    marginBottom: 10,
    padding: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    alignItems: 'center',
  },
  footerText: {
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
    opacity: 0.8,
  }
});