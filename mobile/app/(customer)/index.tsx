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
import { useAuth } from '../../src/context/AuthContext';

export default function CustomerHomeScreen() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: photographers, isLoading } = useQuery({
    queryKey: ['photographers'],
    queryFn: () => snapnowApi.getPhotographers(),
  });

  const filteredPhotographers = photographers?.filter(
    (p) =>
      p.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.bio?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getImageUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_URL}${path}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hi, {user?.fullName?.split(' ')[0] || 'there'}!</Text>
        <Text style={styles.title}>Find photographers</Text>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#6b7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by city or keyword..."
          placeholderTextColor="#6b7280"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#6366f1" style={styles.loader} />
        ) : filteredPhotographers?.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No photographers found</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredPhotographers?.map((photographer) => (
              <TouchableOpacity
                key={photographer.id}
                style={styles.card}
                onPress={() => router.push(`/(customer)/photographer/${photographer.id}`)}
                testID={`card-photographer-${photographer.id}`}
              >
                <Image
                  source={{ uri: getImageUrl(photographer.profilePicture) || 'https://via.placeholder.com/150' }}
                  style={styles.cardImage}
                />
                <View style={styles.cardContent}>
                  <Text style={styles.cardName} numberOfLines={1}>Photographer</Text>
                  <View style={styles.cardLocation}>
                    <MapPin size={14} color="#9ca3af" />
                    <Text style={styles.cardCity} numberOfLines={1}>{photographer.city}</Text>
                  </View>
                  <View style={styles.cardFooter}>
                    <View style={styles.ratingContainer}>
                      <Star size={14} color="#fbbf24" fill="#fbbf24" />
                      <Text style={styles.rating}>
                        {photographer.rating != null ? Number(photographer.rating).toFixed(1) : 'New'}
                      </Text>
                    </View>
                    <Text style={styles.price}>£{photographer.hourlyRate}/hr</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { padding: 20, paddingBottom: 0 },
  greeting: { fontSize: 14, color: '#9ca3af', marginBottom: 4 },
  title: { fontSize: 28, fontWeight: '700', color: '#fff' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    margin: 20,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  searchIcon: { marginRight: 12 },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 16,
  },
  content: { flex: 1, paddingHorizontal: 20 },
  loader: { marginTop: 60 },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#9ca3af', fontSize: 16 },
  grid: { gap: 16, paddingBottom: 20 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#1a1a1a',
  },
  cardContent: { padding: 16 },
  cardName: { fontSize: 18, fontWeight: '600', color: '#fff', marginBottom: 8 },
  cardLocation: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
  cardCity: { color: '#9ca3af', fontSize: 14 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rating: { color: '#fff', fontSize: 14, fontWeight: '500' },
  price: { color: '#6366f1', fontSize: 16, fontWeight: '600' },
});
