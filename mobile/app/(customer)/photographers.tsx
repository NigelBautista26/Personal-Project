import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Search, MapPin, Star, ChevronDown } from 'lucide-react-native';
import { snapnowApi, PhotographerProfile } from '../../src/api/snapnowApi';
import { API_URL } from '../../src/api/client';

const PRIMARY_COLOR = '#2563eb';

interface City {
  name: string;
  lat: number;
  lng: number;
}

const CITIES: City[] = [
  { name: "London", lat: 51.5074, lng: -0.1278 },
  { name: "Paris", lat: 48.8566, lng: 2.3522 },
  { name: "New York", lat: 40.7128, lng: -74.0060 },
  { name: "Tokyo", lat: 35.6762, lng: 139.6503 },
  { name: "Dubai", lat: 25.2048, lng: 55.2708 },
  { name: "Barcelona", lat: 41.3851, lng: 2.1734 },
  { name: "Rome", lat: 41.9028, lng: 12.4964 },
  { name: "Sydney", lat: -33.8688, lng: 151.2093 },
  { name: "Amsterdam", lat: 52.3676, lng: 4.9041 },
  { name: "Singapore", lat: 1.3521, lng: 103.8198 },
  { name: "Los Angeles", lat: 34.0522, lng: -118.2437 },
  { name: "Berlin", lat: 52.5200, lng: 13.4050 },
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

export default function PhotographersListScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<City>(CITIES[0]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const { data: photographers, isLoading } = useQuery({
    queryKey: ['photographers'],
    queryFn: () => snapnowApi.getPhotographers(),
  });

  const filteredPhotographers = useMemo(() => {
    if (!photographers) return [];
    
    console.log('Selected city:', selectedCity.name, selectedCity.lat, selectedCity.lng);
    console.log('Total photographers:', photographers.length);
    
    const result = photographers.filter((p) => {
      const pLat = parseFloat(String(p.latitude));
      const pLng = parseFloat(String(p.longitude));
      
      console.log(`Photographer ${p.fullName}: lat=${p.latitude} (${pLat}), lng=${p.longitude} (${pLng})`);
      
      if (Number.isNaN(pLat) || Number.isNaN(pLng)) {
        console.log(`  -> SKIPPED: Invalid coordinates`);
        return false;
      }
      
      const distance = getDistanceKm(selectedCity.lat, selectedCity.lng, pLat, pLng);
      console.log(`  -> Distance from ${selectedCity.name}: ${distance.toFixed(1)} km`);
      
      const isNearCity = distance <= 50;
      
      if (!isNearCity) {
        console.log(`  -> FILTERED OUT: Too far`);
        return false;
      }
      
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          p.fullName?.toLowerCase().includes(query) ||
          p.bio?.toLowerCase().includes(query)
        );
      }
      
      console.log(`  -> INCLUDED`);
      return true;
    });
    
    console.log('Filtered result:', result.length, 'photographers');
    return result;
  }, [photographers, selectedCity, searchQuery]);

  const getImageUrl = (photographer: PhotographerProfile) => {
    const path = photographer.profileImageUrl || photographer.profilePicture;
    if (!path) return 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200';
    if (path.startsWith('http')) return path;
    return `${API_URL}${path}`;
  };
  
  const getStatusColor = (photographer: PhotographerProfile) => {
    if (photographer.sessionState === 'in_session') return '#eab308';
    if (photographer.sessionState === 'available') return '#22c55e';
    return '#6b7280';
  };

  const getStatusText = (photographer: PhotographerProfile) => {
    if (photographer.sessionState === 'in_session') return 'In Session';
    if (photographer.sessionState === 'available') return 'Available Now';
    return 'Offline';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Find Photographers</Text>
        <Text style={styles.subtitle}>Professional photographers near you</Text>
      </View>

      <View style={styles.searchRow}>
        <TouchableOpacity 
          style={styles.cityButton} 
          onPress={() => setShowCityDropdown(!showCityDropdown)}
          testID="button-change-city"
        >
          <MapPin size={14} color="#22c55e" />
          <Text style={styles.cityText}>{selectedCity.name}</Text>
          <ChevronDown size={14} color="#9ca3af" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Search size={16} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search photographers..."
            placeholderTextColor="#6b7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
            testID="input-search"
          />
        </View>
      </View>

      {showCityDropdown && (
        <View style={styles.dropdown}>
          <ScrollView style={{ maxHeight: 300 }} nestedScrollEnabled>
            {CITIES.map((city) => (
              <TouchableOpacity
                key={city.name}
                style={[styles.dropdownItem, selectedCity.name === city.name && styles.dropdownItemActive]}
                onPress={() => {
                  setSelectedCity(city);
                  setShowCityDropdown(false);
                }}
              >
                <Text style={[styles.dropdownText, selectedCity.name === city.name && styles.dropdownTextActive]}>
                  {city.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator size="large" color={PRIMARY_COLOR} style={styles.loader} />
        ) : (
          <>
            <Text style={styles.resultCount}>
              {filteredPhotographers.length} photographer{filteredPhotographers.length !== 1 ? 's' : ''} in {selectedCity.name}
            </Text>

            {filteredPhotographers.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Search size={32} color="#6b7280" />
                </View>
                <Text style={styles.emptyTitle}>No photographers found</Text>
                <Text style={styles.emptyText}>
                  {searchQuery ? 'Try a different search term' : `No photographers available in ${selectedCity.name} yet`}
                </Text>
              </View>
            ) : (
              <View style={styles.list}>
                {filteredPhotographers.map((photographer) => (
                  <TouchableOpacity
                    key={photographer.id}
                    style={styles.card}
                    onPress={() => router.push(`/(customer)/photographer/${photographer.id}`)}
                    testID={`card-photographer-${photographer.id}`}
                    activeOpacity={0.7}
                  >
                    <View style={styles.avatarContainer}>
                      <Image
                        source={{ uri: getImageUrl(photographer) }}
                        style={styles.avatar}
                      />
                      <View style={[styles.statusDot, { backgroundColor: getStatusColor(photographer) }]} />
                    </View>
                    
                    <View style={styles.cardContent}>
                      <Text style={styles.name} numberOfLines={1}>
                        {photographer.fullName || 'Photographer'}
                      </Text>
                      <View style={styles.locationRow}>
                        <MapPin size={12} color="#6b7280" />
                        <Text style={styles.locationText} numberOfLines={1}>
                          {photographer.location || selectedCity.name}
                        </Text>
                      </View>
                      <View style={styles.ratingRow}>
                        <Star size={12} color="#eab308" fill="#eab308" />
                        <Text style={styles.ratingValue}>
                          {photographer.rating != null ? Number(photographer.rating).toFixed(1) : 'New'}
                        </Text>
                        <Text style={styles.reviewCount}>
                          ({photographer.reviewCount || 0})
                        </Text>
                      </View>
                    </View>

                    <View style={styles.priceSection}>
                      <Text style={styles.price}>£{photographer.hourlyRate}</Text>
                      <Text style={styles.priceLabel}>HOURLY</Text>
                      <Text style={[styles.availableText, { color: getStatusColor(photographer) }]}>
                        {getStatusText(photographer)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { 
    paddingHorizontal: 20, 
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: { fontSize: 26, fontWeight: '700', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6b7280' },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  cityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'transparent',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cityText: { color: '#fff', fontWeight: '500', fontSize: 14 },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'transparent',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
  },
  dropdown: {
    position: 'absolute',
    top: 130,
    left: 20,
    right: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    zIndex: 100,
  },
  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  dropdownItemActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
  },
  dropdownText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  dropdownTextActive: {
    color: PRIMARY_COLOR,
    fontWeight: '600',
  },
  content: { flex: 1, paddingHorizontal: 20 },
  loader: { marginTop: 60 },
  resultCount: { 
    color: '#6b7280', 
    fontSize: 13, 
    marginTop: 8,
    marginBottom: 12,
  },
  emptyState: { 
    alignItems: 'center', 
    marginTop: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  emptyText: { color: '#6b7280', fontSize: 14, textAlign: 'center' },
  list: { gap: 8 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1a1a1a',
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#0a0a0a',
  },
  cardContent: { 
    flex: 1,
    gap: 3,
  },
  name: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#fff',
  },
  locationRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4,
  },
  locationText: { color: '#6b7280', fontSize: 13 },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingValue: { fontSize: 13, fontWeight: '600', color: '#fff' },
  reviewCount: { fontSize: 13, color: '#6b7280' },
  priceSection: { 
    alignItems: 'flex-end',
  },
  price: { fontSize: 16, fontWeight: '700', color: '#fff' },
  priceLabel: { 
    fontSize: 10, 
    color: '#6b7280', 
    letterSpacing: 0.5,
  },
  availableText: { 
    fontSize: 11, 
    fontWeight: '500', 
    marginTop: 4,
  },
});
