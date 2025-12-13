import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MapPin } from 'lucide-react-native';

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
    <View style={[styles.fallback, style]}>
      <MapPin size={48} color="#3b82f6" />
      <Text style={styles.fallbackText}>Map View</Text>
      <Text style={styles.fallbackSubtext}>
        {region ? `${region.latitude.toFixed(4)}, ${region.longitude.toFixed(4)}` : 'Location'}
      </Text>
      <Text style={styles.note}>Maps available in production build</Text>
    </View>
  );
}

export function SafeMarker(props: any) {
  return null;
}

export const PROVIDER_GOOGLE = null;

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
  note: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 16,
  },
});
