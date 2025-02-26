import React from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { styles } from '@/styles/routeFinder.styles';
import { SearchResult } from './types';

interface LocationInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onFocus: () => void;
  showLocationButton?: boolean;
  onLocationPress?: () => void;
  onClearPress: () => void;
}

export const LocationInput: React.FC<LocationInputProps> = ({
  placeholder,
  value,
  onChangeText,
  onFocus,
  showLocationButton,
  onLocationPress,
  onClearPress,
}) => {
  return (
    <View style={styles.inputWrapper}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        placeholderTextColor="rgba(102, 102, 102, 0.8)"
      />
      {value ? (
        <TouchableOpacity onPress={onClearPress}>
          <Text style={styles.clearButton}>✕</Text>
        </TouchableOpacity>
      ) : (
        showLocationButton && (
          <TouchableOpacity onPress={onLocationPress}>
            <Text style={styles.locationButton}>📍</Text>
          </TouchableOpacity>
        )
      )}
    </View>
  );
};