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
import { Calendar, MapPin, Clock, Camera, X, ChevronRight } from 'lucide-react-native';
import { snapnowApi, Booking } from '../../src/api/snapnowApi';
import { API_URL } from '../../src/api/client';

const PRIMARY_COLOR = '#2563eb';

export default function CustomerBookingsScreen() {
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['customer-bookings'],
    queryFn: () => snapnowApi.getBookings(),
  });

  const allBookings = bookings || [];
  
  const upcomingBookings = allBookings.filter(b => b.status === 'confirmed');
  const awaitingPhotos = allBookings.filter(b => b.status === 'photos_pending' || b.status === 'in_progress');
  const completedBookings = allBookings.filter(b => b.status === 'completed');
  const expiredBookings = allBookings.filter(b => b.status === 'expired' || b.status === 'declined' || b.status === 'cancelled');

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getImageUrl = (path?: string) => {
    if (!path) return 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200';
    if (path.startsWith('http')) return path;
    return `${API_URL}${path}`;
  };

  const renderBookingCard = (booking: Booking) => (
    <TouchableOpacity
      key={booking.id}
      style={styles.bookingCard}
      onPress={() => router.push(`/(customer)/booking/${booking.id}`)}
      testID={`card-booking-${booking.id}`}
    >
      <Image
        source={{ uri: getImageUrl(booking.photographerProfileImage) }}
        style={styles.photographerAvatar}
      />
      <View style={styles.bookingInfo}>
        <Text style={styles.photographerName}>{booking.photographerName || 'Photographer'}</Text>
        <Text style={styles.bookingDetails}>
          {formatDate(booking.scheduledDate)} · {booking.location}
        </Text>
        {booking.status === 'photos_pending' && (
          <View style={styles.statusRow}>
            <Clock size={12} color="#6b7280" />
            <Text style={styles.statusText}>Your photographer is uploading your photos...</Text>
          </View>
        )}
      </View>
      <View style={styles.priceSection}>
        <Text style={styles.bookingPrice}>£{booking.totalAmount}</Text>
        <ChevronRight size={16} color="#6b7280" />
      </View>
    </TouchableOpacity>
  );

  const renderSection = (title: string, icon: React.ReactNode, bookingsList: Booking[], emptyText?: string) => {
    if (bookingsList.length === 0 && !emptyText) return null;
    
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          {icon}
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {bookingsList.length === 0 ? (
          <View style={styles.emptySection}>
            <Text style={styles.emptySectionText}>{emptyText}</Text>
            {title === 'Upcoming Sessions' && (
              <TouchableOpacity onPress={() => router.push('/(customer)/photographers')}>
                <Text style={styles.findLink}>Find a photographer</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          bookingsList.map(renderBookingCard)
        )}
      </View>
    );
  };

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
            {renderSection(
              'Upcoming Sessions',
              <Calendar size={16} color="#fff" />,
              upcomingBookings,
              'No upcoming bookings'
            )}
            
            {renderSection(
              'Awaiting Photos',
              <Camera size={16} color="#fff" />,
              awaitingPhotos
            )}
            
            {renderSection(
              'Completed Sessions',
              <Camera size={16} color="#fff" />,
              completedBookings
            )}
            
            {expiredBookings.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <X size={16} color="#ef4444" />
                  <Text style={[styles.sectionTitle, { color: '#ef4444' }]}>Expired Requests</Text>
                </View>
                <Text style={styles.expiredNote}>
                  These requests expired before the photographer could respond. Your card was not charged.
                </Text>
                {expiredBookings.map(renderBookingCard)}
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
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  emptySection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptySectionText: {
    color: '#6b7280',
    fontSize: 14,
  },
  findLink: {
    color: PRIMARY_COLOR,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  bookingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 8,
  },
  photographerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1a1a1a',
    marginRight: 12,
  },
  bookingInfo: {
    flex: 1,
    gap: 2,
  },
  photographerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  bookingDetails: {
    fontSize: 13,
    color: '#6b7280',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  statusText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bookingPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  expiredNote: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 18,
  },
});
