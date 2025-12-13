import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MapPin } from 'lucide-react-native';

let MapView: any = null;
let Marker: any = null;
let PROVIDER_GOOGLE: any = null;

try {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
  PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
} catch (e) {
  // Maps not available in Expo Go
}

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
  if (!MapView) {
    return (
      <View style={[styles.fallback, style]}>
        <MapPin size={48} color="#3b82f6" />
        <Text style={styles.fallbackText}>Map View</Text>
        <Text style={styles.fallbackSubtext}>
          {region ? `${region.latitude.toFixed(4)}, ${region.longitude.toFixed(4)}` : 'Location'}
        </Text>
      </View>
    );
  }

  return (
    <MapView style={style} region={region} {...props}>
      {children}
    </MapView>
  );
}

export function SafeMarker(props: any) {
  if (!Marker) return null;
  return <Marker {...props} />;
}

export { PROVIDER_GOOGLE };

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
