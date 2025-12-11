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
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { MapPin, Users, ChevronRight, Layers, Navigation, X, Search, Check } from 'lucide-react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
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

const lightMapStyle: any[] = [];

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
  const [mapStyle, setMapStyle] = useState<'dark' | 'light'>('dark');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

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

  useEffect(() => {
    if (mapRef.current && selectedCity) {
      mapRef.current.animateToRegion({
        latitude: selectedCity.lat,
        longitude: selectedCity.lng,
        latitudeDelta: 0.15,
        longitudeDelta: 0.15,
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
    if (!photographers) return [];
    return photographers.filter((p) => {
      const pLat = parseFloat(String(p.latitude));
      const pLng = parseFloat(String(p.longitude));
      if (isNaN(pLat) || isNaN(pLng)) return false;
      const distance = getDistanceKm(selectedCity.lat, selectedCity.lng, pLat, pLng);
      return distance <= 50;
    });
  }, [photographers, selectedCity]);

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
    }
  };

  const toggleMapStyle = () => {
    setMapStyle(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handlePhotographerPress = (photographer: PhotographerProfile) => {
    router.push(`/(customer)/photographer/${photographer.id}`);
  };

  const region: Region = {
    latitude: selectedCity.lat,
    longitude: selectedCity.lng,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={region}
        customMapStyle={mapStyle === 'dark' ? darkMapStyle : lightMapStyle}
        showsUserLocation={true}
        showsMyLocationButton={false}
        testID="map-view"
      >
        {filteredPhotographers.map((photographer) => {
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
      </MapView>

      {/* Location Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.locationButton} 
          onPress={() => setShowCitySelector(true)}
          testID="button-change-location"
        >
          <MapPin size={16} color="#fff" />
          <Text style={styles.locationText}>{selectedCity.name}</Text>
          <Text style={styles.changeText}>Change</Text>
        </TouchableOpacity>
      </View>

      {/* Map Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={toggleMapStyle} testID="button-layers">
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
        transparent={true}
        onRequestClose={() => setShowCitySelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <SafeAreaView style={styles.modalSafeArea}>
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
                  testID="input-search-city"
                />
              </View>

              {/* City List */}
              <FlatList
                data={filteredCities}
                keyExtractor={(item) => item.name}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.cityItem}
                    onPress={() => handleCitySelect(item)}
                    testID={`button-city-${item.name.toLowerCase()}`}
                  >
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
              />
            </SafeAreaView>
          </View>
        </View>
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
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  locationText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
    flex: 1,
  },
  changeText: {
    color: PRIMARY_COLOR,
    fontWeight: '600',
    fontSize: 13,
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
    backgroundColor: 'rgba(0,0,0,0.8)',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#111',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalSafeArea: {
    flex: 1,
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
    margin: 16,
    marginTop: 8,
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
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
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
