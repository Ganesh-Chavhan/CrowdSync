import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  },
  glassContainer: {
    width: width * 0.9,
    maxWidth: 500,
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 20,
  },
  searchButton: {
    backgroundColor: '#1a73e8',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  searchButtonDisabled: {
    backgroundColor: 'rgba(204, 204, 204, 0.8)',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  titleText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1a73e8',
  },
  inputContainer: {
    gap: 16,
  },
  searchResults: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    marginTop: -8,
    marginBottom: 8,
    padding: 8,
    maxHeight: 200,
  },
  searchResultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(240, 240, 240, 0.8)',
  },
  searchResultText: {
    fontSize: 14,
    color: '#000',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(230, 230, 230, 0.5)',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  clearButton: {
    fontSize: 20,
    color: 'rgba(102, 102, 102, 0.8)',
    padding: 4,
  },
  locationButton: {
    fontSize: 20,
    padding: 4,
  },
  busRoutesContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f0f2f5',
  },
  busRoutesHeader: {
    padding: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  busRoutesTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginLeft: 16,
  },
  busRoutesList: {
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#1a73e8',
  },
  busRouteContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  busHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  busNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  timeContainer: {
    marginBottom: 12,
  },
  timeText: {
    fontSize: 14,
    color: '#5f6368',
    marginBottom: 4,
  },
  routeInfo: {
    marginTop: 12,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  routeText: {
    fontSize: 14,
    color: '#5f6368',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#1a73e8',
    fontWeight: '500',
  },
  noRoutesText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 24,
  },
});