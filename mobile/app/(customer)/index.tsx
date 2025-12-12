import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  Platform,
  Modal,
  FlatList,
  TextInput,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { MapPin, Users, ChevronRight, Layers, Navigation, X, Search, Check, Crosshair } from 'lucide-react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region, MapType } from 'react-native-maps';
import * as Location from 'expo-location';
import { snapnowApi, PhotographerProfile } from '../../src/api/snapnowApi';
import { API_URL } from '../../src/api/client';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PRIMARY_COLOR = '#2563eb';

interface City {
  name: string;
  country: string;
  lat: number;
  lng: number;
}

const POPULAR_CITIES: City[] = [
  { name: "London", country: "United Kingdom", lat: 51.5074, lng: -0.1278 },
  { name: "Paris", country: "France", lat: 48.8566, lng: 2.3522 },
  { name: "New York", country: "United States", lat: 40.7128, lng: -74.0060 },
  { name: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503 },
  { name: "Dubai", country: "UAE", lat: 25.2048, lng: 55.2708 },
  { name: "Barcelona", country: "Spain", lat: 41.3851, lng: 2.1734 },
  { name: "Rome", country: "Italy", lat: 41.9028, lng: 12.4964 },
  { name: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093 },
  { name: "Amsterdam", country: "Netherlands", lat: 52.3676, lng: 4.9041 },
  { name: "Singapore", country: "Singapore", lat: 1.3521, lng: 103.8198 },
  { name: "Los Angeles", country: "United States", lat: 34.0522, lng: -118.2437 },
  { name: "Berlin", country: "Germany", lat: 52.5200, lng: 13.4050 },
];

const DEFAULT_CITY = POPULAR_CITIES[0];

const PHOTO_SPOTS: { [city: string]: { id: number; name: string; latitude: number; longitude: number; image: string }[] } = {
  London: [
    { id: 1, name: 'Tower Bridge', latitude: 51.5055, longitude: -0.0754, image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=100' },
    { id: 2, name: 'Big Ben', latitude: 51.5007, longitude: -0.1246, image: 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=100' },
    { id: 3, name: 'London Eye', latitude: 51.5033, longitude: -0.1195, image: 'https://images.unsplash.com/photo-1520986606214-8b456906c813?w=100' },
    { id: 4, name: 'Buckingham Palace', latitude: 51.5014, longitude: -0.1419, image: 'https://images.unsplash.com/photo-1587056753321-c3fef73bfc71?w=100' },
  ],
  Paris: [
    { id: 1, name: 'Eiffel Tower', latitude: 48.8584, longitude: 2.2945, image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=100' },
    { id: 2, name: 'Louvre Museum', latitude: 48.8606, longitude: 2.3376, image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=100' },
    { id: 3, name: 'Notre Dame', latitude: 48.8530, longitude: 2.3499, image: 'https://images.unsplash.com/photo-1478391679764-b2d8b3cd1e94?w=100' },
  ],
  'New York': [
    { id: 1, name: 'Statue of Liberty', latitude: 40.6892, longitude: -74.0445, image: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=100' },
    { id: 2, name: 'Central Park', latitude: 40.7829, longitude: -73.9654, image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=100' },
    { id: 3, name: 'Brooklyn Bridge', latitude: 40.7061, longitude: -73.9969, image: 'https://images.unsplash.com/photo-1496588152823-86ff7695e68f?w=100' },
  ],
};

const getOffsetCoordinates = (photographers: Array<{ latitude: number; longitude: number }>, index: number) => {
  const p = photographers[index];
  const lat = p.latitude;
  const lng = p.longitude;
  if (isNaN(lat) || isNaN(lng)) return { lat: 0, lng: 0 };
  
  const OFFSET = 0.002;
  let sameLocationCount = 0;
  
  for (let i = 0; i < index; i++) {
    const other = photographers[i];
    if (Math.abs(other.latitude - lat) < 0.001 && Math.abs(other.longitude - lng) < 0.001) {
      sameLocationCount++;
    }
  }
  
  if (sameLocationCount === 0) return { lat, lng };
  
  const angle = (sameLocationCount * 60) * (Math.PI / 180);
  return {
    lat: lat + OFFSET * Math.cos(angle),
    lng: lng + OFFSET * Math.sin(angle),
  };
};

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0d1117' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8b949e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0d1117' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.country', elementType: 'labels', stylers: [{ visibility: 'on' }] },
  { featureType: 'administrative.locality', elementType: 'labels', stylers: [{ visibility: 'on' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a1f2e' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1f2937' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#1f2937' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#1a1f2e' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0c1929' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4f5b66' }] },
];

const getDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export default function CustomerMapScreen() {
  const mapRef = useRef<MapView>(null);
  const [selectedCity, setSelectedCity] = useState<City>(DEFAULT_CITY);
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapType, setMapType] = useState<MapType>('standard');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const { data: photographersRaw, isLoading } = useQuery({
    queryKey: ['photographers'],
    queryFn: () => snapnowApi.getPhotographers(),
  });

  // Normalize coordinates to numbers to prevent NaN issues in map rendering
  const photographers = useMemo(() => {
    if (!photographersRaw) return [];
    return photographersRaw.map(p => ({
      ...p,
      latitude: parseFloat(String(p.latitude)) || 0,
      longitude: parseFloat(String(p.longitude)) || 0,
      hourlyRate: parseFloat(String(p.hourlyRate)) || 0,
    }));
  }, [photographersRaw]);

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

  useEffect(() => {
    if (mapRef.current && selectedCity) {
      mapRef.current.animateToRegion({
        latitude: selectedCity.lat,
        longitude: selectedCity.lng,
        latitudeDelta: 0.12,
        longitudeDelta: 0.12,
      }, 500);
    }
  }, [selectedCity]);

  const getImageUrl = (photographer: PhotographerProfile) => {
    const path = photographer.profileImageUrl || photographer.profilePicture;
    if (!path) return 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200';
    if (path.startsWith('http')) return path;
    return `${API_URL}${path}`;
  };

  const filteredPhotographers = useMemo(() => {
    if (!photographers || photographers.length === 0) {
      console.log('[DEBUG] No photographers data');
      return [];
    }
    
    console.log('[DEBUG] Total photographers:', photographers.length);
    console.log('[DEBUG] Sample photographer:', JSON.stringify(photographers[0], null, 2));
    
    const filtered = photographers.filter((p) => {
      if (isNaN(p.latitude) || isNaN(p.longitude) || p.latitude === 0 || p.longitude === 0) {
        console.log('[DEBUG] Filtered out (invalid coords):', p.id, p.latitude, p.longitude);
        return false;
      }
      const distance = getDistanceKm(selectedCity.lat, selectedCity.lng, p.latitude, p.longitude);
      console.log('[DEBUG] Photographer', p.id, 'distance:', distance, 'km');
      return distance <= 50;
    });
    
    console.log('[DEBUG] Filtered photographers count:', filtered.length);
    return filtered;
  }, [photographers, selectedCity]);

  const photoSpots = useMemo(() => {
    return PHOTO_SPOTS[selectedCity.name] || [];
  }, [selectedCity.name]);

  const availablePhotographers = filteredPhotographers.filter(
    (p) => p.sessionState === 'available'
  );

  const filteredCities = searchQuery.trim()
    ? POPULAR_CITIES.filter(
        (city) =>
          city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          city.country.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : POPULAR_CITIES;

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    setShowCitySelector(false);
    setSearchQuery('');
  };

  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        ...userLocation,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 500);
    } else {
      Alert.alert('Location', 'Unable to get your location. Please enable location services.');
    }
  };

  const toggleMapType = () => {
    setMapType(prev => prev === 'standard' ? 'satellite' : 'standard');
  };

  const handlePhotographerPress = (photographer: PhotographerProfile) => {
    router.push(`/(customer)/photographer/${photographer.id}`);
  };

  const region: Region = {
    latitude: selectedCity.lat,
    longitude: selectedCity.lng,
    latitudeDelta: 0.12,
    longitudeDelta: 0.12,
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={region}
        mapType={Platform.OS === 'ios' ? (mapType === 'satellite' ? 'satellite' : 'mutedStandard') : mapType}
        customMapStyle={Platform.OS === 'android' && mapType === 'standard' ? darkMapStyle : undefined}
        showsUserLocation={true}
        showsMyLocationButton={false}
        userInterfaceStyle="dark"
        testID="map-view"
      >
        {/* Photographer Markers */}
        {filteredPhotographers.map((photographer) => {
          const isAvailable = photographer.sessionState === 'available';
          
          console.log('[MARKER] Rendering marker at:', photographer.latitude, photographer.longitude);
          
          return (
            <Marker
              key={`photographer-${photographer.id}`}
              coordinate={{
                latitude: photographer.latitude,
                longitude: photographer.longitude,
              }}
              onPress={() => handlePhotographerPress(photographer)}
              testID={`marker-photographer-${photographer.id}`}
              pinColor={isAvailable ? '#22c55e' : '#3b82f6'}
              title={photographer.displayName || `${photographer.firstName} ${photographer.lastName}`}
              description={`£${photographer.hourlyRate}/hr`}
            />
          );
        })}

        {/* Photo Spot Markers */}
        {photoSpots.map((spot) => (
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

      {/* Location Header - Two separate buttons like web */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.locationButton} 
          onPress={() => setShowCitySelector(true)}
          testID="button-change-location"
        >
          <MapPin size={18} color="#fff" />
          <Text style={styles.locationText}>{selectedCity.name}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.changeButton}
          onPress={() => setShowCitySelector(true)}
          testID="button-change-city"
        >
          <Text style={styles.changeButtonText}>Change</Text>
        </TouchableOpacity>
      </View>

      {/* Map Controls */}
      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.controlButton, mapType === 'satellite' && styles.controlButtonActive]} 
          onPress={toggleMapType} 
          testID="button-layers"
        >
          <Layers size={20} color={mapType === 'satellite' ? PRIMARY_COLOR : '#fff'} />
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
          <Text style={styles.cardSubtitle}>Browse photographers in {selectedCity.name}</Text>
        </View>
        <ChevronRight size={20} color="#6b7280" />
      </TouchableOpacity>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        </View>
      )}

      {/* City Selector Modal */}
      <Modal
        visible={showCitySelector}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCitySelector(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select City</Text>
            <TouchableOpacity 
              onPress={() => setShowCitySelector(false)} 
              style={styles.closeButton}
              testID="button-close-city-selector"
            >
              <X size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <Search size={18} color="#6b7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search cities..."
              placeholderTextColor="#6b7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={false}
              testID="input-search-city"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={18} color="#6b7280" />
              </TouchableOpacity>
            )}
          </View>

          {/* Use Current Location */}
          <TouchableOpacity 
            style={styles.currentLocationButton}
            onPress={() => {
              if (userLocation) {
                const nearestCity = POPULAR_CITIES.reduce((prev, curr) => {
                  const prevDist = getDistanceKm(userLocation.latitude, userLocation.longitude, prev.lat, prev.lng);
                  const currDist = getDistanceKm(userLocation.latitude, userLocation.longitude, curr.lat, curr.lng);
                  return currDist < prevDist ? curr : prev;
                });
                handleCitySelect(nearestCity);
              } else {
                Alert.alert('Location', 'Unable to get your location.');
              }
            }}
          >
            <Crosshair size={20} color={PRIMARY_COLOR} />
            <Text style={styles.currentLocationText}>Use Current Location</Text>
          </TouchableOpacity>

          {/* Popular Cities Section */}
          <Text style={styles.sectionTitle}>Popular Destinations</Text>

          {/* City List */}
          <FlatList
            data={filteredCities}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.cityItem}
                onPress={() => handleCitySelect(item)}
                testID={`button-city-${item.name.toLowerCase().replace(' ', '-')}`}
              >
                <MapPin size={18} color="#6b7280" />
                <View style={styles.cityInfo}>
                  <Text style={styles.cityName}>{item.name}</Text>
                  <Text style={styles.cityCountry}>{item.country}</Text>
                </View>
                {selectedCity.name === item.name && (
                  <Check size={20} color={PRIMARY_COLOR} />
                )}
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        </SafeAreaView>
      </Modal>
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
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  locationText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  changeButton: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  changeButtonText: {
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
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  controlButtonActive: {
    borderColor: PRIMARY_COLOR,
    backgroundColor: 'rgba(37,99,235,0.2)',
  },
  bottomCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15,15,15,0.95)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(37,99,235,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  cardSubtitle: {
    color: '#6b7280',
    fontSize: 13,
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
  markerArrowAvailable: {
    borderTopColor: PRIMARY_COLOR,
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
  photographerMarker: {
    width: 50,
    height: 56,
    alignItems: 'center',
  },
  photographerMarkerAvailable: {
    // Green glow effect handled by border
  },
  photographerMarkerImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#3b82f6',
    backgroundColor: '#1a1a1a',
  },
  photographerMarkerImageContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#3b82f6',
    backgroundColor: '#1a1a1a',
    overflow: 'hidden',
  },
  photographerMarkerImageInner: {
    width: '100%',
    height: '100%',
  },
  photographerMarkerPrice: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: -8,
    borderWidth: 1,
    borderColor: '#333',
  },
  photographerMarkerPriceText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    paddingVertical: 14,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    backgroundColor: 'rgba(37,99,235,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(37,99,235,0.2)',
  },
  currentLocationText: {
    color: PRIMARY_COLOR,
    fontSize: 15,
    fontWeight: '600',
  },
  sectionTitle: {
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '600',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  cityInfo: {
    flex: 1,
  },
  cityName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  cityCountry: {
    fontSize: 13,
    color: '#6b7280',
  },
});
