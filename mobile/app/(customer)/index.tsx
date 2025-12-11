import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { MapPin, Users, ChevronRight, Layers, Navigation } from 'lucide-react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { snapnowApi, PhotographerProfile } from '../../src/api/snapnowApi';
import { API_URL } from '../../src/api/client';

const { width, height } = Dimensions.get('window');
const PRIMARY_COLOR = '#2563eb';

const LONDON_REGION: Region = {
  latitude: 51.5074,
  longitude: -0.1278,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

const PHOTO_SPOTS = [
  { id: 1, name: 'Tower Bridge', latitude: 51.5055, longitude: -0.0754, image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=100' },
  { id: 2, name: 'Big Ben', latitude: 51.5007, longitude: -0.1246, image: 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=100' },
  { id: 3, name: 'London Eye', latitude: 51.5033, longitude: -0.1195, image: 'https://images.unsplash.com/photo-1520986606214-8b456906c813?w=100' },
  { id: 4, name: 'Buckingham Palace', latitude: 51.5014, longitude: -0.1419, image: 'https://images.unsplash.com/photo-1587056753321-c3fef73bfc71?w=100' },
  { id: 5, name: 'St Pauls Cathedral', latitude: 51.5138, longitude: -0.0984, image: 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=100' },
  { id: 6, name: 'Trafalgar Square', latitude: 51.5080, longitude: -0.1281, image: 'https://images.unsplash.com/photo-1533929736562-4937a4a16203?w=100' },
];

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0d1117' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8b949e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0d1117' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#161b22' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#21262d' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#21262d' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d1117' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4f5b66' }] },
];

export default function CustomerMapScreen() {
  const mapRef = useRef<MapView>(null);
  const [selectedCity] = useState('London');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [region, setRegion] = useState<Region>(LONDON_REGION);

  const { data: photographers, isLoading } = useQuery({
    queryKey: ['photographers'],
    queryFn: () => snapnowApi.getPhotographers(),
  });

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    })();
  }, []);

  const getImageUrl = (photographer: PhotographerProfile) => {
    const path = photographer.profileImageUrl || photographer.profilePicture;
    if (!path) return 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200';
    if (path.startsWith('http')) return path;
    return `${API_URL}${path}`;
  };

  const availablePhotographers = photographers?.filter(
    (p) => p.sessionState === 'available'
  ) || [];

  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        ...userLocation,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 500);
    }
  };

  const handlePhotographerPress = (photographer: PhotographerProfile) => {
    router.push(`/(customer)/photographer/${photographer.id}`);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={LONDON_REGION}
        onRegionChangeComplete={setRegion}
        customMapStyle={darkMapStyle}
        showsUserLocation={true}
        showsMyLocationButton={false}
        testID="map-view"
      >
        {photographers?.map((photographer) => {
          if (!photographer.latitude || !photographer.longitude) return null;
          return (
            <Marker
              key={photographer.id}
              coordinate={{
                latitude: Number(photographer.latitude),
                longitude: Number(photographer.longitude),
              }}
              onPress={() => handlePhotographerPress(photographer)}
              testID={`marker-photographer-${photographer.id}`}
            >
              <View style={styles.markerContainer}>
                <View style={[
                  styles.markerBubble,
                  photographer.sessionState === 'available' && styles.markerAvailable
                ]}>
                  <Image
                    source={{ uri: getImageUrl(photographer) }}
                    style={styles.markerImage}
                  />
                  <View style={styles.markerPrice}>
                    <Text style={styles.markerPriceText}>£{photographer.hourlyRate}</Text>
                  </View>
                </View>
                <View style={styles.markerArrow} />
              </View>
            </Marker>
          );
        })}
        {PHOTO_SPOTS.map((spot) => (
          <Marker
            key={`spot-${spot.id}`}
            coordinate={{
              latitude: spot.latitude,
              longitude: spot.longitude,
            }}
            testID={`marker-spot-${spot.id}`}
          >
            <View style={styles.spotMarker}>
              <Image
                source={{ uri: spot.image }}
                style={styles.spotImage}
              />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Location Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.locationButton} testID="button-change-location">
          <MapPin size={16} color="#fff" />
          <Text style={styles.locationText}>{selectedCity}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.changeButton} testID="button-change-city">
          <Text style={styles.changeText}>Change</Text>
        </TouchableOpacity>
      </View>

      {/* Map Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} testID="button-layers">
          <Layers size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={centerOnUser} testID="button-locate">
          <Navigation size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Bottom Card */}
      <TouchableOpacity
        style={styles.bottomCard}
        onPress={() => router.push('/(customer)/photographers')}
        activeOpacity={0.9}
        testID="button-browse-photographers"
      >
        <View style={styles.cardIcon}>
          <Users size={24} color={PRIMARY_COLOR} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>
            {isLoading ? 'Loading...' : `${availablePhotographers.length} Photographers Available`}
          </Text>
          <Text style={styles.cardSubtitle}>Browse photographers in {selectedCity}</Text>
        </View>
        <ChevronRight size={20} color="#6b7280" />
      </TouchableOpacity>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  locationText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  changeButton: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  changeText: {
    color: PRIMARY_COLOR,
    fontWeight: '600',
    fontSize: 14,
  },
  controls: {
    position: 'absolute',
    right: 16,
    bottom: 120,
    gap: 12,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  bottomCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20,20,20,0.95)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(37,99,235,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 1,
  },
  cardSubtitle: {
    color: '#6b7280',
    fontSize: 12,
  },
  spotMarker: {
    width: 44,
    height: 44,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#f59e0b',
    backgroundColor: '#1a1a1a',
  },
  spotImage: {
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerBubble: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#374151',
    overflow: 'hidden',
  },
  markerAvailable: {
    borderColor: PRIMARY_COLOR,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  markerImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  markerPrice: {
    position: 'absolute',
    bottom: -4,
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#0a0a0a',
  },
  markerPriceText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  markerArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#374151',
    marginTop: -1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
