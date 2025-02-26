import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { styles } from '@/styles/routeFinder.styles';
import { SearchResult } from './types';

interface SearchResultsProps {
  results: SearchResult[];
  onSelect: (result: SearchResult) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ results, onSelect }) => {
  return (
    <View style={styles.searchResults}>
      {results.map((result) => (
        <TouchableOpacity
          key={result.id}
          style={styles.searchResultItem}
          onPress={() => onSelect(result)}
        >
          <Text style={styles.searchResultText}>{result.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};