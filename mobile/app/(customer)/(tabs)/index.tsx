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
import { SafeMapView, SafeMarker, PROVIDER_GOOGLE } from '../../../src/components/SafeMapView';
import MapView, { Region, MapType } from 'react-native-maps';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import { snapnowApi, PhotographerProfile, Booking } from '../../../src/api/snapnowApi';
import { API_URL } from '../../../src/api/client';
import { useAuth } from '../../../src/context/AuthContext';
import { useCity, City, POPULAR_CITIES } from '../../../src/context/CityContext';

// Detect if running in Expo Go on iOS (causes crashes with custom marker children)
const isExpoGoOnIOS = Platform.OS === 'ios' && Constants.executionEnvironment === 'storeClient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PRIMARY_COLOR = '#2563eb';

const PHOTO_SPOTS: { [city: string]: { id: number; name: string; latitude: number; longitude: number; image: string }[] } = {
  London: [
    { id: 1, name: 'Tower Bridge', latitude: 51.5055, longitude: -0.0754, image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=100' },
    { id: 2, name: 'Big Ben', latitude: 51.5007, longitude: -0.1246, image: 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=100' },
    { id: 3, name: 'London Eye', latitude: 51.5033, longitude: -0.1195, image: 'https://images.unsplash.com/photo-1520986606214-8b456906c813?w=100' },
    { id: 4, name: 'Buckingham Palace', latitude: 51.5014, longitude: -0.1419, image: 'https://images.unsplash.com/photo-1533856493584-0c6ca8ca9ce3?w=100' },
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
  Tokyo: [
    { id: 1, name: 'Tokyo Tower', latitude: 35.6586, longitude: 139.7454, image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=100' },
    { id: 2, name: 'Senso-ji Temple', latitude: 35.7148, longitude: 139.7967, image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=100' },
    { id: 3, name: 'Shibuya Crossing', latitude: 35.6595, longitude: 139.7004, image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=100' },
  ],
  Dubai: [
    { id: 1, name: 'Burj Khalifa', latitude: 25.1972, longitude: 55.2744, image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=100' },
    { id: 2, name: 'Palm Jumeirah', latitude: 25.1124, longitude: 55.1390, image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=100' },
    { id: 3, name: 'Dubai Marina', latitude: 25.0805, longitude: 55.1403, image: 'https://images.unsplash.com/photo-1533395427226-788cee25cc7b?w=100' },
  ],
  Barcelona: [
    { id: 1, name: 'Sagrada Familia', latitude: 41.4036, longitude: 2.1744, image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=100' },
    { id: 2, name: 'Park Guell', latitude: 41.4145, longitude: 2.1527, image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=100' },
    { id: 3, name: 'La Barceloneta Beach', latitude: 41.3784, longitude: 2.1925, image: 'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=100' },
  ],
  Rome: [
    { id: 1, name: 'Colosseum', latitude: 41.8902, longitude: 12.4922, image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=100' },
    { id: 2, name: 'Trevi Fountain', latitude: 41.9009, longitude: 12.4833, image: 'https://images.unsplash.com/photo-1525874684015-58379d421a52?w=100' },
    { id: 3, name: 'Vatican City', latitude: 41.9029, longitude: 12.4534, image: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=100' },
  ],
  Sydney: [
    { id: 1, name: 'Sydney Opera House', latitude: -33.8568, longitude: 151.2153, image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=100' },
    { id: 2, name: 'Harbour Bridge', latitude: -33.8523, longitude: 151.2108, image: 'https://images.unsplash.com/photo-1524293581917-878a6d017c71?w=100' },
    { id: 3, name: 'Bondi Beach', latitude: -33.8908, longitude: 151.2743, image: 'https://images.unsplash.com/photo-1523428096881-5bd79d043006?w=100' },
  ],
  Amsterdam: [
    { id: 1, name: 'Canal Ring', latitude: 52.3676, longitude: 4.9041, image: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=100' },
    { id: 2, name: 'Rijksmuseum', latitude: 52.3600, longitude: 4.8852, image: 'https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?w=100' },
    { id: 3, name: 'Anne Frank House', latitude: 52.3752, longitude: 4.8840, image: 'https://images.unsplash.com/photo-1576924542622-772281b13aa8?w=100' },
  ],
  Singapore: [
    { id: 1, name: 'Marina Bay Sands', latitude: 1.2834, longitude: 103.8607, image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=100' },
    { id: 2, name: 'Gardens by the Bay', latitude: 1.2816, longitude: 103.8636, image: 'https://images.unsplash.com/photo-1508964942454-1a56651d54ac?w=100' },
    { id: 3, name: 'Merlion Park', latitude: 1.2868, longitude: 103.8545, image: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=100' },
  ],
  'Los Angeles': [
    { id: 1, name: 'Hollywood Sign', latitude: 34.1341, longitude: -118.3215, image: 'https://images.unsplash.com/photo-1515896769750-31548aa180ed?w=100' },
    { id: 2, name: 'Santa Monica Pier', latitude: 34.0083, longitude: -118.4987, image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=100' },
    { id: 3, name: 'Griffith Observatory', latitude: 34.1184, longitude: -118.3004, image: 'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=100' },
  ],
  Berlin: [
    { id: 1, name: 'Brandenburg Gate', latitude: 52.5163, longitude: 13.3777, image: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=100' },
    { id: 2, name: 'Berlin Wall', latitude: 52.5076, longitude: 13.3904, image: 'https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?w=100' },
    { id: 3, name: 'Museum Island', latitude: 52.5169, longitude: 13.4019, image: 'https://images.unsplash.com/photo-1566404791232-af9fe5c0bbb5?w=100' },
  ],
};

const getOffsetCoordinates = (photographers: PhotographerProfile[], index: number) => {
  const p = photographers[index];
  const lat = Number(p.latitude);
  const lng = Number(p.longitude);
  if (isNaN(lat) || isNaN(lng)) return { lat, lng };
  
  const OFFSET = 0.002;
  let sameLocationCount = 0;
  
  for (let i = 0; i < index; i++) {
    const other = photographers[i];
    const otherLat = Number(other.latitude);
    const otherLng = Number(other.longitude);
    if (Math.abs(otherLat - lat) < 0.001 && Math.abs(otherLng - lng) < 0.001) {
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
  const { user } = useAuth();
  const { selectedCity, setSelectedCity } = useCity();
  const mapRef = useRef<MapView>(null);
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapType, setMapType] = useState<MapType>('standard');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [markersReady, setMarkersReady] = useState(false);
  const [photographerLiveLocation, setPhotographerLiveLocation] = useState<{ lat: number; lng: number; bookingId: string } | null>(null);

  const { data: photographers, isLoading } = useQuery({
    queryKey: ['photographers'],
    queryFn: () => snapnowApi.getPhotographers(),
  });

  // Fetch customer's bookings to find active sessions
  const { data: bookings } = useQuery({
    queryKey: ['customer-bookings'],
    queryFn: () => snapnowApi.getBookings(),
    enabled: !!user,
  });

  // Find active session (confirmed booking within session window)
  const activeSession = useMemo(() => {
    if (!bookings) return null;
    const now = new Date();
    return bookings.find((booking: Booking) => {
      if (booking.status !== 'confirmed') return false;
      
      // Parse session start time
      const sessionDate = new Date(booking.scheduledDate);
      const timeParts = booking.scheduledTime.replace(/[AP]M/i, '').trim().split(':');
      const hours = parseInt(timeParts[0]);
      const minutes = parseInt(timeParts[1]) || 0;
      const isPM = booking.scheduledTime.toLowerCase().includes('pm');
      sessionDate.setHours(isPM && hours !== 12 ? hours + 12 : hours === 12 && !isPM ? 0 : hours, minutes);
      
      // Session end time
      const duration = booking.duration || 1;
      const sessionEnd = new Date(sessionDate.getTime() + duration * 60 * 60 * 1000);
      
      // Check if within 10 min before to session end
      const minutesUntilStart = (sessionDate.getTime() - now.getTime()) / (1000 * 60);
      return minutesUntilStart <= 10 && now < sessionEnd;
    });
  }, [bookings]);

  // Fetch photographer's live location for active session
  const { data: photographerLocation } = useQuery({
    queryKey: ['photographer-live-location', activeSession?.id],
    queryFn: () => snapnowApi.getOtherPartyLocation(activeSession!.id, 'customer'),
    enabled: !!activeSession,
    refetchInterval: 5000,
  });

  // Update photographer live location state
  useEffect(() => {
    if (photographerLocation && activeSession) {
      setPhotographerLiveLocation({
        lat: parseFloat(photographerLocation.latitude),
        lng: parseFloat(photographerLocation.longitude),
        bookingId: activeSession.id,
      });
    } else {
      setPhotographerLiveLocation(null);
    }
  }, [photographerLocation, activeSession]);

  // Location is now only requested when user taps the locate button
  // This avoids crash with new architecture in Expo Go on iOS simulator

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

  // Force markers to render after data loads
  useEffect(() => {
    if (photographers && photographers.length > 0 && !markersReady) {
      const timer = setTimeout(() => {
        setMarkersReady(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [photographers, markersReady]);

  const getImageUrl = (photographer: PhotographerProfile) => {
    const path = photographer.profileImageUrl || photographer.profilePicture;
    if (!path) return 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200';
    if (path.startsWith('http')) return path;
    return `${API_URL}${path}`;
  };

  const filteredPhotographers = useMemo(() => {
    if (!photographers || photographers.length === 0) return [];
    
    return photographers.filter((p) => {
      const pLat = parseFloat(String(p.latitude));
      const pLng = parseFloat(String(p.longitude));
      if (Number.isNaN(pLat) || Number.isNaN(pLng)) return false;
      const distance = getDistanceKm(selectedCity.lat, selectedCity.lng, pLat, pLng);
      return distance <= 50;
    });
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

  const centerOnUser = async () => {
    // If we already have location, just center on it
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        ...userLocation,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 500);
      return;
    }
    
    // Otherwise, request location when user taps the button
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location services to use this feature.');
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      
      setUserLocation(newLocation);
      
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          ...newLocation,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }, 500);
      }
    } catch (error) {
      console.log('Location error:', error);
      Alert.alert('Error', 'Could not get your location. Please try again.');
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
      <SafeMapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={region}
        mapType={Platform.OS === 'ios' ? (mapType === 'satellite' ? 'satellite' : 'mutedStandard') : mapType}
        customMapStyle={Platform.OS === 'android' && mapType === 'standard' ? darkMapStyle : undefined}
        showsUserLocation={false}
        showsMyLocationButton={false}
        userInterfaceStyle="dark"
        testID="map-view"
      >
        {/* Photographer Markers */}
        {filteredPhotographers.map((photographer, index) => {
          const lat = Number(photographer.latitude);
          const lng = Number(photographer.longitude);
          if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
          
          const coords = getOffsetCoordinates(filteredPhotographers, index);
          const isAvailable = photographer.sessionState === 'available';
          
          // Use simple markers without children in Expo Go on iOS to avoid crash
          if (isExpoGoOnIOS) {
            return (
              <SafeMarker
                key={`photographer-${photographer.id}-${markersReady}`}
                coordinate={{
                  latitude: coords.lat,
                  longitude: coords.lng,
                }}
                onPress={() => handlePhotographerPress(photographer)}
                title={photographer.fullName || 'Photographer'}
                description={`£${photographer.hourlyRate}/hr`}
                pinColor={isAvailable ? '#22c55e' : '#3b82f6'}
                testID={`marker-photographer-${photographer.id}`}
              />
            );
          }
          
          return (
            <SafeMarker
              key={`photographer-${photographer.id}-${markersReady}`}
              coordinate={{
                latitude: coords.lat,
                longitude: coords.lng,
              }}
              onPress={() => handlePhotographerPress(photographer)}
              testID={`marker-photographer-${photographer.id}`}
              tracksViewChanges={!markersReady}
            >
              <View style={styles.photographerMarker}>
                <Image
                  source={{ uri: getImageUrl(photographer) }}
                  style={[styles.photographerMarkerImage, isAvailable && { borderColor: '#22c55e' }]}
                />
                <View style={styles.photographerMarkerPrice}>
                  <Text style={styles.photographerMarkerPriceText}>£{photographer.hourlyRate}</Text>
                </View>
              </View>
            </SafeMarker>
          );
        })}

        {/* Photo Spot Markers - skip in Expo Go on iOS to avoid crash */}
        {!isExpoGoOnIOS && photoSpots.map((spot) => (
          <SafeMarker
            key={`spot-${spot.id}-${markersReady}`}
            coordinate={{
              latitude: spot.latitude,
              longitude: spot.longitude,
            }}
            testID={`marker-spot-${spot.id}`}
            tracksViewChanges={!markersReady}
          >
            <View style={styles.spotMarker}>
              <Image
                source={{ uri: spot.image }}
                style={styles.spotImage}
              />
            </View>
          </SafeMarker>
        ))}

        {/* Photographer Live Location Marker */}
        {photographerLiveLocation && (
          <SafeMarker
            key="photographer-live"
            coordinate={{
              latitude: photographerLiveLocation.lat,
              longitude: photographerLiveLocation.lng,
            }}
            title="Photographer's Location"
            onPress={() => router.push(`/(customer)/booking/${photographerLiveLocation.bookingId}`)}
            pinColor="#22c55e"
            testID="marker-photographer-live"
          />
        )}

        {/* User Location Marker */}
        {userLocation && (
          <SafeMarker
            key="user-location"
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="Your Location"
            pinColor="#2563eb"
            testID="marker-user-location"
          />
        )}
      </SafeMapView>

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
  liveLocationMarker: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveLocationPulse: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
  },
  liveLocationDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#22c55e',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  userLocationMarker: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userLocationPulse: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(37, 99, 235, 0.3)',
  },
  userLocationDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
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
