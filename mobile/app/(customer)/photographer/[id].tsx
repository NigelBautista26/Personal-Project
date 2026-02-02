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
  Modal,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Star, Heart, Share2, MessageSquare, X, User } from 'lucide-react-native';
import { snapnowApi } from '../../../src/api/snapnowApi';
import { API_URL } from '../../../src/api/client';

const PRIMARY_COLOR = '#2563eb';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PORTFOLIO_IMAGE_SIZE = (SCREEN_WIDTH - 6) / 2;

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  photographerResponse: string | null;
  customer: {
    fullName: string;
    profileImageUrl: string | null;
  };
}

export default function PhotographerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showAllReviews, setShowAllReviews] = useState(false);

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
      params: { id: id! },
    });
  };

  const renderStars = (rating: number, size: number = 12) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
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
        <View style={styles.errorState}>
          <Text style={styles.errorText}>Photographer not found</Text>
          <TouchableOpacity style={styles.goBackButton} onPress={() => router.back()}>
            <Text style={styles.goBackText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const reviews: Review[] = reviewsData?.reviews || [];
  const displayRating = reviewsData?.averageRating || photographer.rating;
  const reviewCount = reviewsData?.reviewCount || photographer.reviewCount || 0;
  const portfolioImages = photographer.portfolio || photographer.portfolioImages || [];
  const profileImage = photographer.profilePicture || photographer.profileImageUrl;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: getImageUrl(portfolioImages[0]) || getImageUrl(profileImage) || 'https://via.placeholder.com/400' }}
            style={styles.heroImage}
          />
          <View style={styles.heroGradient} />
          
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.back()}
              testID="button-back"
            >
              <ArrowLeft size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} testID="button-share">
              <Share2 size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Info Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileRow}>
            <View style={styles.profileImageWrapper}>
              <Image
                source={{ uri: getImageUrl(profileImage) || 'https://via.placeholder.com/100' }}
                style={styles.profileImage}
              />
            </View>
            <TouchableOpacity style={styles.favoriteButton} testID="button-favorite">
              <Heart size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.nameRow}>
              <View style={styles.nameContainer}>
                <Text style={styles.name}>{photographer.fullName || 'Photographer'}</Text>
                <View style={styles.locationRow}>
                  <MapPin size={14} color="#9ca3af" />
                  <Text style={styles.location}>{photographer.city || photographer.location}</Text>
                </View>
              </View>
              <View style={styles.ratingContainer}>
                <View style={styles.ratingRow}>
                  <Star size={14} color="#fbbf24" fill="#fbbf24" />
                  <Text style={styles.ratingText}>
                    {displayRating != null && reviewCount > 0 
                      ? Number(displayRating).toFixed(1) 
                      : parseFloat(photographer.rating || "5.0")}
                  </Text>
                </View>
                <Text style={styles.reviewCountText}>{reviewCount} reviews</Text>
              </View>
            </View>

            {photographer.bio && (
              <Text style={styles.bioText}>{photographer.bio}</Text>
            )}
          </View>
        </View>

        {/* Portfolio Grid */}
        {portfolioImages.length > 0 && (
          <View style={styles.portfolioSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Portfolio</Text>
            </View>
            <View style={styles.portfolioGrid}>
              {portfolioImages.map((image: string, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={styles.portfolioImageWrapper}
                  onPress={() => setSelectedImage(getImageUrl(image))}
                  testID={`img-portfolio-${index}`}
                >
                  <Image
                    source={{ uri: getImageUrl(image) || 'https://via.placeholder.com/150' }}
                    style={styles.portfolioImage}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <View style={styles.reviewsTitleRow}>
                <MessageSquare size={18} color={PRIMARY_COLOR} />
                <Text style={styles.sectionTitle}>Reviews</Text>
              </View>
              <View style={styles.reviewsRating}>
                <Star size={14} color="#fbbf24" fill="#fbbf24" />
                <Text style={styles.reviewsRatingText}>{Number(displayRating).toFixed(1)}</Text>
                <Text style={styles.reviewsCount}>({reviewCount})</Text>
              </View>
            </View>
            
            {(showAllReviews ? reviews : reviews.slice(0, 3)).map((review) => (
              <View key={review.id} style={styles.reviewCard} testID={`review-${review.id}`}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewerAvatar}>
                    {review.customer.profileImageUrl ? (
                      <Image
                        source={{ uri: getImageUrl(review.customer.profileImageUrl) }}
                        style={styles.reviewerImage}
                      />
                    ) : (
                      <User size={18} color={PRIMARY_COLOR} />
                    )}
                  </View>
                  <View style={styles.reviewerInfo}>
                    <View style={styles.reviewerNameRow}>
                      <Text style={styles.reviewerName}>{review.customer.fullName}</Text>
                      <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
                    </View>
                    {renderStars(review.rating)}
                  </View>
                </View>
                
                {review.comment && (
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                )}
                
                {review.photographerResponse && (
                  <View style={styles.photographerResponse}>
                    <Text style={styles.responseLabel}>Photographer's response</Text>
                    <Text style={styles.responseText}>{review.photographerResponse}</Text>
                  </View>
                )}
              </View>
            ))}

            {reviews.length > 3 && (
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => setShowAllReviews(!showAllReviews)}
                testID="button-toggle-reviews"
              >
                <Text style={styles.viewAllText}>
                  {showAllReviews ? 'Show less' : `View all ${reviews.length} reviews`}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Fixed Footer */}
      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>STARTING FROM</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>£{parseFloat(photographer.hourlyRate || "0")}</Text>
            <Text style={styles.priceUnit}> / hour</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleBookNow}
          testID="button-book-now"
        >
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>

      {/* Lightbox Modal */}
      <Modal
        visible={!!selectedImage}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.lightbox}>
          <TouchableOpacity
            style={styles.lightboxClose}
            onPress={() => setSelectedImage(null)}
          >
            <X size={28} color="#fff" />
          </TouchableOpacity>
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={styles.lightboxImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  scrollView: { flex: 1 },
  loader: { marginTop: 100 },
  errorState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { color: '#fff', fontSize: 16, marginBottom: 16 },
  goBackButton: { paddingHorizontal: 20, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 8 },
  goBackText: { color: '#fff', fontSize: 14 },

  heroContainer: { position: 'relative', height: 280 },
  heroImage: { width: '100%', height: '100%', opacity: 0.6 },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  headerButtons: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileSection: { paddingHorizontal: 24, marginTop: -48 },
  profileRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 },
  profileImageWrapper: {
    width: 96,
    height: 96,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#0a0a0a',
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  profileImage: { width: '100%', height: '100%' },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  infoSection: { marginBottom: 24 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  nameContainer: { flex: 1 },
  name: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  location: { fontSize: 14, color: '#9ca3af' },
  ratingContainer: { alignItems: 'flex-end' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  ratingText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  reviewCountText: { fontSize: 12, color: '#9ca3af', textDecorationLine: 'underline' },
  bioText: { fontSize: 14, color: '#9ca3af', lineHeight: 22 },

  portfolioSection: { marginBottom: 24 },
  sectionHeader: { paddingHorizontal: 24, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  portfolioGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
  portfolioImageWrapper: {
    width: PORTFOLIO_IMAGE_SIZE,
    backgroundColor: '#1a1a1a',
  },
  portfolioImage: { width: '100%', aspectRatio: 1 },

  reviewsSection: { paddingHorizontal: 24, marginBottom: 24 },
  reviewsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  reviewsTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reviewsRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reviewsRatingText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  reviewsCount: { fontSize: 14, color: '#9ca3af' },

  reviewCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  reviewHeader: { flexDirection: 'row', marginBottom: 12 },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  reviewerImage: { width: '100%', height: '100%' },
  reviewerInfo: { flex: 1, marginLeft: 12 },
  reviewerNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  reviewerName: { fontSize: 14, fontWeight: '600', color: '#fff' },
  reviewDate: { fontSize: 12, color: '#9ca3af' },
  starsContainer: { flexDirection: 'row', gap: 2 },
  reviewComment: { fontSize: 14, color: '#9ca3af', lineHeight: 20 },
  photographerResponse: {
    marginTop: 12,
    paddingLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(37, 99, 235, 0.3)',
  },
  responseLabel: { fontSize: 12, color: PRIMARY_COLOR, fontWeight: '600', marginBottom: 4 },
  responseText: { fontSize: 14, color: '#9ca3af' },
  viewAllButton: { alignItems: 'center', marginTop: 8 },
  viewAllText: { fontSize: 14, color: PRIMARY_COLOR, fontWeight: '500' },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#0a0a0a',
  },
  priceContainer: {},
  priceLabel: { fontSize: 10, color: '#9ca3af', letterSpacing: 1, marginBottom: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline' },
  price: { fontSize: 24, fontWeight: '700', color: '#fff' },
  priceUnit: { fontSize: 14, color: '#9ca3af' },
  bookButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  bookButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  lightbox: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxClose: {
    position: 'absolute',
    top: 60,
    right: 24,
    padding: 8,
    zIndex: 10,
  },
  lightboxImage: {
    width: SCREEN_WIDTH - 32,
    height: '80%',
  },
});
