import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Calendar, MapPin, Clock } from 'lucide-react-native';
import { snapnowApi } from '../../src/api/snapnowApi';

export default function CustomerBookingsScreen() {
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['customer-bookings'],
    queryFn: () => snapnowApi.getBookings(),
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#22c55e';
      case 'pending': return '#f59e0b';
      case 'completed': return '#6366f1';
      case 'cancelled':
      case 'declined':
      case 'expired': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#6366f1" style={styles.loader} />
        ) : !bookings?.length ? (
          <View style={styles.emptyState}>
            <Calendar size={48} color="#6b7280" />
            <Text style={styles.emptyTitle}>No bookings yet</Text>
            <Text style={styles.emptyText}>Find a photographer and book your first session!</Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => router.push('/(customer)')}
            >
              <Text style={styles.exploreButtonText}>Explore photographers</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.bookingsList}>
            {bookings.map((booking) => (
              <TouchableOpacity
                key={booking.id}
                style={styles.bookingCard}
                onPress={() => router.push(`/(customer)/booking/${booking.id}`)}
                testID={`card-booking-${booking.id}`}
              >
                <View style={styles.bookingHeader}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Text>
                  </View>
                  <Text style={styles.price}>£{booking.totalAmount}</Text>
                </View>

                <View style={styles.bookingDetails}>
                  <View style={styles.detailRow}>
                    <Calendar size={16} color="#9ca3af" />
                    <Text style={styles.detailText}>{formatDate(booking.scheduledDate)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Clock size={16} color="#9ca3af" />
                    <Text style={styles.detailText}>{booking.scheduledTime} ({booking.duration}h)</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MapPin size={16} color="#9ca3af" />
                    <Text style={styles.detailText} numberOfLines={1}>{booking.location}</Text>
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
  title: { fontSize: 28, fontWeight: '700', color: '#fff' },
  content: { flex: 1, padding: 20 },
  loader: { marginTop: 60 },
  emptyState: { alignItems: 'center', marginTop: 60, gap: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#fff' },
  emptyText: { fontSize: 14, color: '#9ca3af', textAlign: 'center' },
  exploreButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
  },
  exploreButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  bookingsList: { gap: 16 },
  bookingCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '600' },
  price: { fontSize: 18, fontWeight: '700', color: '#fff' },
  bookingDetails: { gap: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  detailText: { color: '#d1d5db', fontSize: 14, flex: 1 },
});
