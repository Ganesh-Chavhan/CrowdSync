import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { styles } from '@/styles/routeFinder.styles';
import { BusRouteCard } from './BusRouteCard';
import { BusRoute } from './types';

interface BusRoutesListProps {
  routes: BusRoute[];
  onBack: () => void;
}

export const BusRoutesList: React.FC<BusRoutesListProps> = ({ routes, onBack }) => {
  return (
    <View style={styles.busRoutesContainer}>
      <View style={styles.busRoutesHeader}>
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
        renderItem={({ item }) => <BusRouteCard route={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.busRoutesList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};