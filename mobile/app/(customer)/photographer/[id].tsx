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
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Star, Clock, Calendar, Instagram, Globe, MessageSquare, Heart } from 'lucide-react-native';
import { snapnowApi } from '../../../src/api/snapnowApi';
import { API_URL } from '../../../src/api/client';

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

const PRIMARY_COLOR = '#2563eb';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PORTFOLIO_IMAGE_SIZE = (SCREEN_WIDTH - 48) / 3;

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  customer: {
    fullName: string;
    profileImageUrl: string | null;
  };
}

export default function PhotographerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [selectedDuration, setSelectedDuration] = useState(1);

  const { data: photographer, isLoading, error } = useQuery({
    queryKey: ['photographer', id],
    queryFn: () => snapnowApi.getPhotographer(id!),
    enabled: !!id,
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['photographer-reviews', id],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/photographers/${id}/reviews`);
      if (!res.ok) return { reviews: [], averageRating: 0, reviewCount: 0 };
      return res.json();
    },
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

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            color="#fbbf24"
            fill={star <= rating ? "#fbbf24" : "transparent"}
          />
        ))}
      </View>
    );
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
  const reviews: Review[] = reviewsData?.reviews || [];
  const displayRating = reviewsData?.averageRating || photographer.rating;
  const reviewCount = reviewsData?.reviewCount || photographer.reviewCount || 0;
  const portfolioImages = photographer.portfolio || photographer.portfolioImages || [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: getImageUrl(portfolioImages[0]) || getImageUrl(photographer.profilePicture) || 'https://via.placeholder.com/400' }}
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay} />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            testID="button-back"
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.heartButton} testID="button-favorite">
            <Heart size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: getImageUrl(photographer.profilePicture) || 'https://via.placeholder.com/100' }}
              style={styles.profileImage}
            />
          </View>
          <View style={styles.ratingBadge}>
            <Star size={14} color="#fbbf24" fill="#fbbf24" />
            <Text style={styles.ratingText}>
              {displayRating != null ? Number(displayRating).toFixed(1) : 'New'}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.headerSection}>
            <Text style={styles.name}>{photographer.fullName || 'Photographer'}</Text>
            <View style={styles.locationRow}>
              <MapPin size={16} color="#9ca3af" />
              <Text style={styles.location}>{photographer.city || photographer.location}</Text>
            </View>
          </View>

          {photographer.bio && (
            <Text style={styles.bioText}>{photographer.bio}</Text>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Portfolio</Text>
            <View style={styles.portfolioGrid}>
              {portfolioImages.slice(0, 6).map((image: string, index: number) => (
                <TouchableOpacity key={index} style={styles.portfolioImageContainer}>
                  <Image
                    source={{ uri: getImageUrl(image) || 'https://via.placeholder.com/150' }}
                    style={styles.portfolioImage}
                  />
                  {index === 5 && portfolioImages.length > 6 && (
                    <View style={styles.portfolioOverlay}>
                      <Text style={styles.portfolioOverlayText}>+{portfolioImages.length - 6}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {reviews.length > 0 && (
            <View style={styles.section}>
              <View style={styles.reviewsHeader}>
                <MessageSquare size={20} color="#fff" />
                <Text style={styles.sectionTitle}>Reviews</Text>
                <View style={styles.reviewsBadge}>
                  <Star size={12} color="#fbbf24" fill="#fbbf24" />
                  <Text style={styles.reviewsBadgeText}>{Number(displayRating).toFixed(1)} ({reviewCount})</Text>
                </View>
              </View>
              {reviews.slice(0, 3).map((review) => (
                <View key={review.id} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <Image
                      source={{ uri: getImageUrl(review.customer.profileImageUrl) || 'https://via.placeholder.com/40' }}
                      style={styles.reviewerImage}
                    />
                    <View style={styles.reviewerInfo}>
                      <Text style={styles.reviewerName}>{review.customer.fullName}</Text>
                      <Text style={styles.reviewDate}>
                        {formatDate(review.createdAt)}
                      </Text>
                    </View>
                    {renderStars(review.rating)}
                  </View>
                  {review.comment && (
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                  )}
                </View>
              ))}
            </View>
          )}

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

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Starting from</Text>
          <Text style={styles.totalPrice}>£{photographer.hourlyRate}<Text style={styles.priceUnit}>/hour</Text></Text>
        </View>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleBookNow}
          testID="button-book"
        >
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
  
  heroContainer: { position: 'relative', height: 280 },
  heroImage: { width: '100%', height: '100%', backgroundColor: '#1a1a1a' },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  profileSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: -40,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  profileImageContainer: {
    width: 88,
    height: 88,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#0a0a0a',
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  profileImage: { width: '100%', height: '100%' },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    marginBottom: 16,
  },
  ratingText: { fontSize: 14, fontWeight: '600', color: '#fff' },

  content: { paddingHorizontal: 20 },
  headerSection: { marginBottom: 12 },
  name: { fontSize: 26, fontWeight: '700', color: '#fff', marginBottom: 6 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  location: { fontSize: 15, color: '#9ca3af' },
  bioText: { fontSize: 14, color: '#d1d5db', lineHeight: 22, marginBottom: 20 },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: '#fff', marginBottom: 12 },
  
  portfolioGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 4,
  },
  portfolioImageContainer: {
    width: PORTFOLIO_IMAGE_SIZE,
    height: PORTFOLIO_IMAGE_SIZE,
    borderRadius: 8,
    overflow: 'hidden',
  },
  portfolioImage: { 
    width: '100%', 
    height: '100%', 
    backgroundColor: '#1a1a1a',
  },
  portfolioOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  portfolioOverlayText: { fontSize: 18, fontWeight: '600', color: '#fff' },

  reviewsHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8,
    marginBottom: 16,
  },
  reviewsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginLeft: 'auto',
  },
  reviewsBadgeText: { fontSize: 12, color: '#fbbf24', fontWeight: '500' },
  
  reviewItem: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  reviewerImage: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#1a1a1a',
  },
  reviewerInfo: { flex: 1, marginLeft: 10 },
  reviewerName: { fontSize: 14, fontWeight: '600', color: '#fff' },
  reviewDate: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  starsContainer: { flexDirection: 'row', gap: 2 },
  reviewComment: { fontSize: 13, color: '#d1d5db', lineHeight: 20 },

  linksContainer: { gap: 12 },
  linkItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  linkText: { fontSize: 14, color: '#d1d5db' },
  
  durationOptions: { flexDirection: 'row', gap: 10 },
  durationOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  durationOptionActive: {
    backgroundColor: 'rgba(37,99,235,0.2)',
    borderColor: PRIMARY_COLOR,
  },
  durationText: { fontSize: 17, fontWeight: '600', color: '#9ca3af' },
  durationTextActive: { color: '#fff' },
  durationPrice: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  durationPriceActive: { color: PRIMARY_COLOR },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#0a0a0a',
  },
  priceContainer: {},
  priceLabel: { fontSize: 12, color: '#9ca3af', marginBottom: 2 },
  totalPrice: { fontSize: 22, fontWeight: '700', color: '#fff' },
  priceUnit: { fontSize: 14, fontWeight: '400', color: '#9ca3af' },
  bookButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  bookButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
});
