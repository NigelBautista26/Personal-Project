import React, { useState } from 'react';
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
import { Search, MapPin, Star } from 'lucide-react-native';
import { snapnowApi, PhotographerProfile } from '../../src/api/snapnowApi';
import { API_URL } from '../../src/api/client';

const PRIMARY_COLOR = '#2563eb';

export default function PhotographersListScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity] = useState('London');

  const { data: photographers, isLoading } = useQuery({
    queryKey: ['photographers'],
    queryFn: () => snapnowApi.getPhotographers(),
  });

  const filteredPhotographers = photographers?.filter(
    (p) =>
      p.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getImageUrl = (photographer: PhotographerProfile) => {
    const path = photographer.profileImageUrl || photographer.profilePicture;
    if (!path) return 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200';
    if (path.startsWith('http')) return path;
    return `${API_URL}${path}`;
  };
  
  const getStatusInfo = (photographer: PhotographerProfile) => {
    if (photographer.sessionState === 'in_session') {
      return { color: '#eab308', text: 'In Session' };
    } else if (photographer.sessionState === 'available') {
      return { color: '#22c55e', text: 'Available Now' };
    }
    return { color: '#6b7280', text: 'Offline' };
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Photographers</Text>
        <Text style={styles.subtitle}>Professional photographers near you</Text>
      </View>

      <View style={styles.searchRow}>
        <TouchableOpacity style={styles.cityButton} testID="button-change-city">
          <MapPin size={16} color={PRIMARY_COLOR} />
          <Text style={styles.cityText}>{selectedCity}</Text>
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Search size={16} color="#6b7280" style={styles.searchIcon} />
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator size="large" color={PRIMARY_COLOR} style={styles.loader} />
        ) : (
          <>
            <Text style={styles.resultCount}>
              {filteredPhotographers?.length || 0} photographer{filteredPhotographers?.length !== 1 ? 's' : ''} in {selectedCity}
            </Text>

            {filteredPhotographers?.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Search size={32} color="#6b7280" />
                </View>
                <Text style={styles.emptyTitle}>No photographers found</Text>
                <Text style={styles.emptyText}>
                  {searchQuery ? 'Try a different search term' : 'Try selecting a different city'}
                </Text>
              </View>
            ) : (
              <View style={styles.list}>
                {filteredPhotographers?.map((photographer) => (
                  <TouchableOpacity
                    key={photographer.id}
                    style={styles.card}
                    onPress={() => router.push(`/(customer)/photographer/${photographer.id}`)}
                    testID={`card-photographer-${photographer.id}`}
                    activeOpacity={0.7}
                  >
                    <View style={styles.cardImageContainer}>
                      <Image
                        source={{ uri: getImageUrl(photographer) }}
                        style={styles.cardImage}
                      />
                      <View style={[
                        styles.statusDot,
                        { backgroundColor: getStatusInfo(photographer).color }
                      ]} />
                    </View>
                    
                    <View style={styles.cardContent}>
                      <View style={styles.cardHeader}>
                        <View style={styles.cardInfo}>
                          <Text style={styles.cardName} numberOfLines={1}>
                            {photographer.fullName || 'Photographer'}
                          </Text>
                          <View style={styles.locationRow}>
                            <MapPin size={12} color="#6b7280" />
                            <Text style={styles.locationText} numberOfLines={1}>
                              {photographer.city || 'Unknown location'}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.priceContainer}>
                          <Text style={styles.price}>£{photographer.hourlyRate}</Text>
                          <Text style={styles.priceLabel}>HOURLY</Text>
                        </View>
                      </View>

                      <View style={styles.cardFooter}>
                        <View style={styles.ratingContainer}>
                          <Star size={12} color="#eab308" fill="#eab308" />
                          <Text style={styles.ratingValue}>
                            {photographer.rating != null ? Number(photographer.rating).toFixed(1) : '5.0'}
                          </Text>
                          <Text style={styles.reviewCount}>
                            ({photographer.reviewCount || 0})
                          </Text>
                        </View>
                        <Text style={[
                          styles.availableText, 
                          { color: getStatusInfo(photographer).color }
                        ]}>
                          {getStatusInfo(photographer).text}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { 
    padding: 20, 
    paddingTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  title: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6b7280' },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  cityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 48,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cityText: { color: '#fff', fontWeight: '500', fontSize: 14 },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
  },
  content: { flex: 1, paddingHorizontal: 20 },
  loader: { marginTop: 60 },
  resultCount: { 
    color: '#6b7280', 
    fontSize: 14, 
    marginTop: 8,
    marginBottom: 16,
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
  list: { gap: 12, paddingBottom: 100 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardImageContainer: {
    position: 'relative',
  },
  cardImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
  },
  statusDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#0a0a0a',
  },
  cardContent: { flex: 1 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardInfo: { flex: 1, marginRight: 12 },
  cardName: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#fff',
    marginBottom: 4,
  },
  locationRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4,
  },
  locationText: { color: '#6b7280', fontSize: 12 },
  priceContainer: { alignItems: 'flex-end' },
  price: { fontSize: 16, fontWeight: '700', color: '#fff' },
  priceLabel: { 
    fontSize: 10, 
    color: '#6b7280', 
    letterSpacing: 1,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingValue: { fontSize: 12, fontWeight: '700', color: '#fff' },
  reviewCount: { fontSize: 12, color: '#6b7280' },
  availableText: { 
    fontSize: 10, 
    fontWeight: '500', 
    color: '#22c55e',
  },
});
