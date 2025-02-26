import * as Location from 'expo-location';

export interface LocationPoint {
  latitude: number;
  longitude: number;
}

export interface SearchResult {
  id: string;
  label: string;
  coordinates: [number, number];
}

export interface RouteInfo {
  distance: number;
  duration: number;
}

export interface BusRoute {
  id: string;
  route_name: string;
  departure_time: string;
  created_at: string;
  start_location: string;
  end_location: string;
  status: string;
  stops: {
    latitude: number;
    longitude: number;
    name: string;
  }[];
}

export interface SearchResults {
  start: SearchResult[];
  end: SearchResult[];
}