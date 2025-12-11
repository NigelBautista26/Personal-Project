import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Calendar, Clock, Camera, X, ChevronRight, Star, Eye } from 'lucide-react-native';
import { snapnowApi, Booking } from '../../src/api/snapnowApi';
import { API_URL } from '../../src/api/client';

const PRIMARY_COLOR = '#2563eb';

export default function CustomerBookingsScreen() {
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['customer-bookings'],
    queryFn: () => snapnowApi.getBookings(),
  });

  const allBookings = Array.isArray(bookings) ? bookings : [];
  
  const hasSessionEnded = (booking: Booking) => {
    const sessionDate = new Date(booking.scheduledDate);
    const scheduledTime = booking.scheduledTime || '';
    const timeMatch = scheduledTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      const isPM = timeMatch[3]?.toUpperCase() === 'PM';
      if (isPM && hours !== 12) hours += 12;
      if (!isPM && hours === 12) hours = 0;
      sessionDate.setHours(hours, minutes, 0, 0);
    }
    const sessionEndTime = new Date(sessionDate.getTime() + (booking.duration || 1) * 60 * 60 * 1000);
    return new Date() > sessionEndTime;
  };

  const upcomingBookings = allBookings.filter(b => 
    b.status === 'pending' || (b.status === 'confirmed' && !hasSessionEnded(b))
  );
  const awaitingPhotos = allBookings.filter(b => 
    (b.status === 'confirmed' && hasSessionEnded(b)) || 
    b.status === 'photos_pending' || 
    b.status === 'in_progress'
  );
  const completedBookings = allBookings.filter(b => b.status === 'completed');
  const expiredBookings = allBookings.filter(b => 
    b.status === 'expired' || b.status === 'declined' || b.status === 'cancelled'
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getImageUrl = (path?: string) => {
    if (!path) return 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200';
    if (path.startsWith('http')) return path;
    return `${API_URL}${path}`;
  };

  const getPhotographerName = (booking: Booking) => {
    return (booking as any).photographerName || 
           booking.photographer?.user?.fullName || 
           booking.photographer?.fullName || 
           'Photographer';
  };

  const getPhotographerImage = (booking: Booking) => {
    return (booking as any).photographerProfileImage || 
           booking.photographer?.profileImageUrl || 
           booking.photographer?.profilePicture;
  };

  const renderUpcomingCard = (booking: Booking) => (
    <TouchableOpacity
      key={booking.id}
      style={styles.bookingCard}
      onPress={() => router.push(`/(customer)/booking/${booking.id}`)}
      testID={`card-booking-${booking.id}`}
    >
      <Image
        source={{ uri: getImageUrl(getPhotographerImage(booking)) }}
        style={styles.avatar}
      />
      <View style={styles.bookingInfo}>
        <Text style={styles.photographerName}>{getPhotographerName(booking)}</Text>
        <Text style={styles.bookingDetails}>
          {formatDate(booking.scheduledDate)} · {booking.location}
        </Text>
      </View>
      <View style={styles.priceSection}>
        <Text style={styles.bookingPrice}>£{booking.totalAmount}</Text>
        <ChevronRight size={16} color="#6b7280" />
      </View>
    </TouchableOpacity>
  );

  const renderAwaitingPhotosCard = (booking: Booking) => (
    <View key={booking.id} style={styles.awaitingCard}>
      <View style={styles.progressBar} />
      <View style={styles.cardPadding}>
        <View style={styles.cardHeader}>
          <Image
            source={{ uri: getImageUrl(getPhotographerImage(booking)) }}
            style={[styles.avatar, styles.avatarRing]}
          />
          <View style={styles.bookingInfo}>
            <Text style={styles.photographerName}>{getPhotographerName(booking)}</Text>
            <Text style={styles.bookingDetails}>
              {formatDate(booking.scheduledDate)} - {booking.location}
            </Text>
          </View>
          <Text style={styles.bookingPrice}>£{booking.totalAmount}</Text>
        </View>
        
        <View style={styles.photoPreviewGrid}>
          {['#3b82f6', '#f59e0b', '#10b981', '#6366f1'].map((color, i) => (
            <View key={i} style={[styles.photoPlaceholder, { backgroundColor: color + '40' }]} />
          ))}
        </View>
        
        <View style={styles.uploadingRow}>
          <Clock size={14} color="#6b7280" />
          <Text style={styles.uploadingText}>Your photographer is uploading your photos...</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCompletedCard = (booking: Booking) => {
    const hasReview = (booking as any).hasReview || (booking as any).reviewRating;
    const reviewRating = (booking as any).reviewRating || 5;
    
    return (
      <TouchableOpacity
        key={booking.id}
        style={styles.completedCard}
        onPress={() => router.push(`/(customer)/booking/${booking.id}`)}
        testID={`card-completed-${booking.id}`}
      >
        <View style={styles.cardHeader}>
          <Image
            source={{ uri: getImageUrl(getPhotographerImage(booking)) }}
            style={styles.avatar}
          />
          <View style={styles.bookingInfo}>
            <Text style={styles.photographerName}>{getPhotographerName(booking)}</Text>
            <Text style={styles.bookingDetails}>
              {formatDate(booking.scheduledDate)} · {booking.location}
            </Text>
          </View>
          <Text style={styles.bookingPrice}>£{booking.totalAmount}</Text>
        </View>
        
        <View style={styles.completedActions}>
          <TouchableOpacity style={styles.viewPhotosButton}>
            <Eye size={14} color={PRIMARY_COLOR} />
            <Text style={styles.viewPhotosText}>View Photos</Text>
          </TouchableOpacity>
          
          {hasReview ? (
            <View style={styles.reviewedBadge}>
              <Star size={12} color="#eab308" fill="#eab308" />
              <Text style={styles.reviewedText}>Reviewed</Text>
              <Text style={styles.reviewRating}>{reviewRating.toFixed(1)}</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.leaveReviewButton}>
              <Text style={styles.leaveReviewText}>Leave Review</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderExpiredCard = (booking: Booking) => (
    <View key={booking.id} style={styles.expiredCard}>
      <View style={styles.cardHeader}>
        <Image
          source={{ uri: getImageUrl(getPhotographerImage(booking)) }}
          style={[styles.avatar, styles.avatarGray]}
        />
        <View style={styles.bookingInfo}>
          <Text style={styles.photographerName}>{getPhotographerName(booking)}</Text>
          <Text style={styles.bookingDetails}>
            {formatDate(booking.scheduledDate)} · {booking.location}
          </Text>
        </View>
        <TouchableOpacity style={styles.dismissButton}>
          <X size={16} color="#6b7280" />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.bookAgainButton}>
        <Text style={styles.bookAgainText}>Book Again</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
        <Text style={styles.subtitle}>View and manage your photo sessions</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator size="large" color={PRIMARY_COLOR} style={styles.loader} />
        ) : allBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar size={48} color="#6b7280" />
            <Text style={styles.emptyTitle}>No bookings yet</Text>
            <Text style={styles.emptyText}>Find a photographer and book your first session!</Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => router.push('/(customer)/photographers')}
            >
              <Text style={styles.exploreButtonText}>Explore photographers</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Upcoming Sessions */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Calendar size={16} color="#fff" />
                <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
              </View>
              {upcomingBookings.length === 0 ? (
                <View style={styles.emptySection}>
                  <Calendar size={32} color="#6b7280" style={{ marginBottom: 8 }} />
                  <Text style={styles.emptySectionText}>No upcoming bookings</Text>
                  <TouchableOpacity onPress={() => router.push('/(customer)/photographers')}>
                    <Text style={styles.findLink}>Find a photographer</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                upcomingBookings.map(renderUpcomingCard)
              )}
            </View>
            
            {/* Awaiting Photos */}
            {awaitingPhotos.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.cameraIconWrapper}>
                    <Camera size={16} color="#3b82f6" />
                    <View style={styles.pulseDot} />
                  </View>
                  <Text style={styles.sectionTitle}>Awaiting Photos</Text>
                </View>
                {awaitingPhotos.map(renderAwaitingPhotosCard)}
              </View>
            )}
            
            {/* Completed Sessions */}
            {completedBookings.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Camera size={16} color="#fff" />
                  <Text style={styles.sectionTitle}>Completed Sessions</Text>
                </View>
                {completedBookings.map(renderCompletedCard)}
              </View>
            )}
            
            {/* Expired Requests */}
            {expiredBookings.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <X size={16} color="#ef4444" />
                  <Text style={[styles.sectionTitle, { color: '#ef4444' }]}>Expired Requests</Text>
                </View>
                <Text style={styles.expiredNote}>
                  These requests expired before the photographer could respond. Your card was not charged.
                </Text>
                {expiredBookings.map(renderExpiredCard)}
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
  content: { flex: 1, paddingHorizontal: 20 },
  loader: { marginTop: 60 },
  emptyState: { alignItems: 'center', marginTop: 60, gap: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#fff' },
  emptyText: { fontSize: 14, color: '#9ca3af', textAlign: 'center' },
  exploreButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
  },
  exploreButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  section: { marginTop: 24 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#fff' },
  emptySection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
  },
  emptySectionText: { color: '#6b7280', fontSize: 14, marginBottom: 4 },
  findLink: { color: PRIMARY_COLOR, fontSize: 14, fontWeight: '500' },
  
  bookingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1a1a1a',
    marginRight: 12,
  },
  avatarRing: {
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  avatarGray: {
    opacity: 0.6,
  },
  bookingInfo: { flex: 1, gap: 2 },
  photographerName: { fontSize: 15, fontWeight: '600', color: '#fff' },
  bookingDetails: { fontSize: 13, color: '#6b7280' },
  priceSection: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bookingPrice: { fontSize: 15, fontWeight: '700', color: '#fff' },
  
  awaitingCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: 3,
    backgroundColor: '#3b82f6',
  },
  cardPadding: { padding: 14 },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  photoPreviewGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  photoPlaceholder: {
    flex: 1,
    height: 48,
    borderRadius: 8,
  },
  uploadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  uploadingText: { fontSize: 13, color: '#6b7280', fontStyle: 'italic' },
  
  completedCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    marginBottom: 8,
  },
  completedActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  viewPhotosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    borderRadius: 8,
  },
  viewPhotosText: { color: PRIMARY_COLOR, fontSize: 13, fontWeight: '600' },
  reviewedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    borderRadius: 8,
  },
  reviewedText: { color: '#eab308', fontSize: 12, fontWeight: '500' },
  reviewRating: { color: '#fff', fontSize: 12, fontWeight: '600', marginLeft: 2 },
  leaveReviewButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
  },
  leaveReviewText: { color: '#fff', fontSize: 13, fontWeight: '500' },
  
  expiredCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    marginBottom: 8,
  },
  dismissButton: {
    padding: 8,
  },
  bookAgainButton: {
    marginTop: 12,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
  },
  bookAgainText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  expiredNote: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 18,
  },
  
  cameraIconWrapper: {
    position: 'relative',
  },
  pulseDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3b82f6',
  },
});
