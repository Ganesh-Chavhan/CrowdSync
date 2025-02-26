import React, { useState, useEffect } from 'react';
import { View, Alert, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import { debounce } from 'lodash';
import { styles } from '@/styles/routeFinder.styles';
import { LocationInput } from '@/components/RouteFinder/LocationInput';
import { SearchResults } from '@/components/RouteFinder/SearchResults';
import { BusRoutesList } from '@/components/RouteFinder/BusRoutesList';
import { homeScreenService } from '@/service/homeScreen.service';
import { SearchResult, SearchResults as SearchResultsType } from '@/components/RouteFinder/types';

const OPENROUTE_API_KEY = '5b3ce3597851110001cf6248cc2cc635fd0541ca815568c81427907d';

export default function RouteFinderScreen() {
  const [showBusRoutes, setShowBusRoutes] = useState(false);
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [activeInput, setActiveInput] = useState<'start' | 'end' | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResultsType>({ start: [], end: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [availableBuses, setAvailableBuses] = useState<any[]>([]);

  const searchPlaces = async (query: string, isStart: boolean) => {
    if (!query.trim()) {
      setSearchResults(prev => ({
        ...prev,
        [isStart ? 'start' : 'end']: []
      }));
      return;
    }

    try {
      const response = await fetch(
        `https://api.openrouteservice.org/geocode/search?api_key=${OPENROUTE_API_KEY}&text=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      if (data.features) {
        const results = data.features.map((feature: any) => ({
          id: feature.properties.id || String(Math.random()),
          label: feature.properties.label,
          coordinates: feature.geometry.coordinates
        }));
        setSearchResults(prev => ({
          ...prev,
          [isStart ? 'start' : 'end']: results
        }));
      }
    } catch (error) {
      console.error('Error searching places:', error);
    }
  };

  const debouncedSearch = debounce(searchPlaces, 300);

  const handleUseCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const response = await fetch(
        `https://api.openrouteservice.org/geocode/reverse?api_key=${OPENROUTE_API_KEY}&point.lon=${location.coords.longitude}&point.lat=${location.coords.latitude}`
      );
      const data = await response.json();
      
      if (data.features?.[0]) {
        setStartLocation(data.features[0].properties.label);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get current location');
    }
  };

  const handleLocationSelect = (result: SearchResult, isStart: boolean) => {
    if (isStart) {
      setStartLocation(result.label);
      setSearchResults(prev => ({ ...prev, start: [] }));
    } else {
      setEndLocation(result.label);
      setSearchResults(prev => ({ ...prev, end: [] }));
    }
    setActiveInput(null);
  };

  const handleSearch = async () => {
    if (!startLocation || !endLocation) {
      Alert.alert('Missing Information', 'Please enter both start and end locations');
      return;
    }

    setIsLoading(true);
    try {
      // Get filtered routes from service
      const routes = await homeScreenService.getFilterRoutes(startLocation, endLocation);
      // console.log('Fetched routes:', routes);
      
      // Set available buses and show routes view
      setAvailableBuses(routes.routes);
      setShowBusRoutes(true);
      console.log('Available buses:', availableBuses);
      
      // console.log(showBusRoutes);
      
    } catch (error) {
      console.error('Error calculating route:', error);
      Alert.alert('Error', 'Failed to find available buses. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <View style={styles.container}>
      {!showBusRoutes ? (
        <View style={styles.glassContainer}>
          {/* Route Finder UI */}
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>Route Finder</Text>
          </View>

          <View style={styles.inputContainer}>
            <LocationInput
              placeholder="Enter start location"
              value={startLocation}
              onChangeText={(text) => {
                setStartLocation(text);
                debouncedSearch(text, true);
              }}
              onFocus={() => setActiveInput('start')}
              showLocationButton
              onLocationPress={handleUseCurrentLocation}
              onClearPress={() => setStartLocation('')}
            />

            {activeInput === 'start' && searchResults.start.length > 0 && (
              <SearchResults
                results={searchResults.start}
                onSelect={(result) => handleLocationSelect(result, true)}
              />
            )}

            <LocationInput
              placeholder="Enter destination"
              value={endLocation}
              onChangeText={(text) => {
                setEndLocation(text);
                debouncedSearch(text, false);
              }}
              onFocus={() => setActiveInput('end')}
              onClearPress={() => setEndLocation('')}
            />

            {activeInput === 'end' && searchResults.end.length > 0 && (
              <SearchResults
                results={searchResults.end}
                onSelect={(result) => handleLocationSelect(result, false)}
              />
            )}

            <TouchableOpacity
              style={[
                styles.searchButton,
                (!startLocation || !endLocation) && styles.searchButtonDisabled
              ]}
              onPress={handleSearch}
              disabled={!startLocation || !endLocation || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.searchButtonText}>Find Route</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <BusRoutesList
        routes={availableBuses}
        onBack={() => {
          setShowBusRoutes(false);
          setAvailableBuses([]); // Clear the routes when going back
        }}
        />
      )}
    </View>
  );
}