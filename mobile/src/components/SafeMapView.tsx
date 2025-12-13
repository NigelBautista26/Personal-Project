import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MapPin } from 'lucide-react-native';
import MapView, { Marker, PROVIDER_GOOGLE as RNMapsProvider } from 'react-native-maps';

interface SafeMapViewProps {
  children?: React.ReactNode;
  style?: any;
  region?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  onRegionChangeComplete?: (region: any) => void;
  mapType?: string;
  showsUserLocation?: boolean;
  [key: string]: any;
}

export function SafeMapView({ children, style, region, ...props }: SafeMapViewProps) {
  return (
    <MapView style={style} region={region} {...props}>
      {children}
    </MapView>
  );
}

export function SafeMarker(props: any) {
  return <Marker {...props} />;
}

export const PROVIDER_GOOGLE = RNMapsProvider;

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
  fallbackSubtext: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 4,
  },
});
