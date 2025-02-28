import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { createStyles } from '@/styles/routeFinder.styles';
import { BusRouteCard } from './BusRouteCard';
import { BusRoute } from './types';

interface BusRoutesListProps {
  routes: BusRoute[];
  onBack: () => void;
  theme?: 'light' | 'dark';
}

export const BusRoutesList: React.FC<BusRoutesListProps> = ({ routes, onBack, theme = 'light' }) => {
  const styles = createStyles(theme);
  
  return (
    <View style={styles.busRoutesContainer}>
      <View style={[styles.busRoutesHeader, { paddingVertical: 12 }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onBack}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.busRoutesTitle}>Available Buses</Text>
      </View>
      
      <FlatList
        data={routes}
        renderItem={({ item, index }) => <BusRouteCard route={item} theme={theme} index={index} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.busRoutesList, { paddingVertical: 8 }]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};