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

export interface Bus {
  bus_number: string;
  capacity: number;
  current_passenger_count: number;
  features?: string[];
  accessible?: boolean;
}

export interface BusRoute {
  id: string;
  route_name: string;
  start_location: string;
  end_location: string;
  departure_time: string;
  arrival_time: string;
  status: 'On Time' | 'Delayed' | 'Cancelled';
  bus: Bus;
  stops?: string[];
  distance?: string;
  eta?: string;
  price?: string;
}
export interface SearchResults {
  start: SearchResult[];
  end: SearchResult[];
}