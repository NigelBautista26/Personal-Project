import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Star, Clock, Calendar, Instagram, Globe } from 'lucide-react-native';
import { snapnowApi } from '../../../src/api/snapnowApi';
import { API_URL } from '../../../src/api/client';

const PRIMARY_COLOR = '#2563eb';

export default function PhotographerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [selectedDuration, setSelectedDuration] = useState(1);

  const { data: photographer, isLoading, error } = useQuery({
    queryKey: ['photographer', id],
    queryFn: () => snapnowApi.getPhotographer(Number(id)),
    enabled: !!id,
  });

  const getImageUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_URL}${path}`;
  };

  const handleBookNow = () => {
    router.push({
      pathname: '/(customer)/book/[id]',
      params: { id: id!, duration: selectedDuration.toString() },
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} style={styles.loader} />
      </SafeAreaView>
    );
  }

  if (error || !photographer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.errorState}>
          <Text style={styles.errorText}>Photographer not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalPrice = (photographer.hourlyRate || 0) * selectedDuration;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: getImageUrl(photographer.profilePicture) || 'https://via.placeholder.com/400' }}
            style={styles.heroImage}
          />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            testID="button-back"
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.headerSection}>
            <Text style={styles.name}>Photographer</Text>
            <View style={styles.locationRow}>
              <MapPin size={16} color="#9ca3af" />
              <Text style={styles.location}>{photographer.city}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Star size={18} color="#fbbf24" fill="#fbbf24" />
              <Text style={styles.statValue}>
                {photographer.rating?.toFixed(1) || 'New'}
              </Text>
              <Text style={styles.statLabel}>
                ({photographer.reviewCount || 0} reviews)
              </Text>
            </View>
            <View style={styles.stat}>
              <Clock size={18} color="#6366f1" />
              <Text style={styles.statValue}>£{photographer.hourlyRate}</Text>
              <Text style={styles.statLabel}>/hour</Text>
            </View>
          </View>

          {photographer.bio && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.bioText}>{photographer.bio}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Session Duration</Text>
            <View style={styles.durationOptions}>
              {[1, 2, 3, 4].map((hours) => (
                <TouchableOpacity
                  key={hours}
                  style={[
                    styles.durationOption,
                    selectedDuration === hours && styles.durationOptionActive,
                  ]}
                  onPress={() => setSelectedDuration(hours)}
                  testID={`button-duration-${hours}`}
                >
                  <Text
                    style={[
                      styles.durationText,
                      selectedDuration === hours && styles.durationTextActive,
                    ]}
                  >
                    {hours}h
                  </Text>
                  <Text
                    style={[
                      styles.durationPrice,
                      selectedDuration === hours && styles.durationPriceActive,
                    ]}
                  >
                    £{(photographer.hourlyRate || 0) * hours}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {(photographer.instagramUrl || photographer.websiteUrl) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Links</Text>
              <View style={styles.linksContainer}>
                {photographer.instagramUrl && (
                  <View style={styles.linkItem}>
                    <Instagram size={18} color="#e1306c" />
                    <Text style={styles.linkText}>
                      {photographer.instagramUrl.replace('https://instagram.com/', '@')}
                    </Text>
                  </View>
                )}
                {photographer.websiteUrl && (
                  <View style={styles.linkItem}>
                    <Globe size={18} color="#6366f1" />
                    <Text style={styles.linkText}>
                      {photographer.websiteUrl.replace('https://', '')}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {photographer.portfolio && photographer.portfolio.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Portfolio</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.portfolioGrid}>
                  {photographer.portfolio.slice(0, 6).map((image, index) => (
                    <Image
                      key={index}
                      source={{ uri: getImageUrl(image) || 'https://via.placeholder.com/150' }}
                      style={styles.portfolioImage}
                    />
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Total</Text>
          <Text style={styles.totalPrice}>£{totalPrice}</Text>
        </View>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleBookNow}
          testID="button-book"
        >
          <Calendar size={20} color="#fff" />
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  scrollView: { flex: 1 },
  loader: { marginTop: 100 },
  errorState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#9ca3af', fontSize: 16 },
  imageContainer: { position: 'relative' },
  heroImage: { width: '100%', height: 300, backgroundColor: '#1a1a1a' },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { padding: 20 },
  headerSection: { marginBottom: 16 },
  name: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  location: { fontSize: 16, color: '#9ca3af' },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statValue: { fontSize: 16, fontWeight: '600', color: '#fff' },
  statLabel: { fontSize: 14, color: '#9ca3af' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#fff', marginBottom: 12 },
  bioText: { fontSize: 14, color: '#d1d5db', lineHeight: 22 },
  durationOptions: { flexDirection: 'row', gap: 12 },
  durationOption: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  durationOptionActive: {
    backgroundColor: 'rgba(37,99,235,0.2)',
    borderColor: PRIMARY_COLOR,
  },
  durationText: { fontSize: 18, fontWeight: '600', color: '#9ca3af' },
  durationTextActive: { color: '#fff' },
  durationPrice: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  durationPriceActive: { color: PRIMARY_COLOR },
  linksContainer: { gap: 12 },
  linkItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  linkText: { fontSize: 14, color: '#d1d5db' },
  portfolioGrid: { flexDirection: 'row', gap: 12 },
  portfolioImage: { width: 120, height: 120, borderRadius: 12, backgroundColor: '#1a1a1a' },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#0a0a0a',
  },
  priceContainer: {},
  priceLabel: { fontSize: 12, color: '#9ca3af' },
  totalPrice: { fontSize: 24, fontWeight: '700', color: '#fff' },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  bookButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
