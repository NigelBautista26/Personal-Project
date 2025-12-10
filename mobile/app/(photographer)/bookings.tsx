import React, { useState } from 'react';
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
import { Calendar, MapPin, Clock, User } from 'lucide-react-native';
import { snapnowApi } from '../../src/api/snapnowApi';

type Tab = 'pending' | 'upcoming' | 'completed';

export default function PhotographerBookingsScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('pending');

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['photographer-bookings'],
    queryFn: () => snapnowApi.getBookings(),
  });

  const pendingBookings = bookings?.filter(b => b.status === 'pending') || [];
  const upcomingBookings = bookings?.filter(b => b.status === 'confirmed') || [];
  const completedBookings = bookings?.filter(b => b.status === 'completed') || [];

  const getBookingsForTab = () => {
    switch (activeTab) {
      case 'pending': return pendingBookings;
      case 'upcoming': return upcomingBookings;
      case 'completed': return completedBookings;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bookings</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.tabActive]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
            Pending ({pendingBookings.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
            Upcoming ({upcomingBookings.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.tabActive]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>
            Completed ({completedBookings.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#6366f1" style={styles.loader} />
        ) : getBookingsForTab().length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar size={48} color="#6b7280" />
            <Text style={styles.emptyTitle}>No {activeTab} bookings</Text>
          </View>
        ) : (
          <View style={styles.bookingsList}>
            {getBookingsForTab().map((booking) => (
              <TouchableOpacity
                key={booking.id}
                style={styles.bookingCard}
                onPress={() => router.push(`/(photographer)/booking/${booking.id}`)}
                testID={`card-booking-${booking.id}`}
              >
                <View style={styles.bookingHeader}>
                  <View style={styles.customerInfo}>
                    <View style={styles.customerAvatar}>
                      <User size={20} color="#9ca3af" />
                    </View>
                    <Text style={styles.customerName}>
                      {booking.customer?.fullName || 'Customer'}
                    </Text>
                  </View>
                  <Text style={styles.earnings}>£{booking.photographerEarnings}</Text>
                </View>

                <View style={styles.bookingDetails}>
                  <View style={styles.detailRow}>
                    <Calendar size={16} color="#9ca3af" />
                    <Text style={styles.detailText}>{formatDate(booking.sessionDate)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Clock size={16} color="#9ca3af" />
                    <Text style={styles.detailText}>{booking.sessionTime} ({booking.duration}h)</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MapPin size={16} color="#9ca3af" />
                    <Text style={styles.detailText} numberOfLines={1}>{booking.location}</Text>
                  </View>
                </View>

                {activeTab === 'pending' && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.declineButton}>
                      <Text style={styles.declineButtonText}>Decline</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.acceptButton}>
                      <Text style={styles.acceptButtonText}>Accept</Text>
                    </TouchableOpacity>
                  </View>
                )}
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
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  tabActive: { backgroundColor: '#6366f1' },
  tabText: { fontSize: 12, fontWeight: '500', color: '#9ca3af' },
  tabTextActive: { color: '#fff' },
  content: { flex: 1, padding: 20 },
  loader: { marginTop: 60 },
  emptyState: { alignItems: 'center', marginTop: 60, gap: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#9ca3af' },
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
  customerInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  customerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerName: { fontSize: 16, fontWeight: '600', color: '#fff' },
  earnings: { fontSize: 20, fontWeight: '700', color: '#22c55e' },
  bookingDetails: { gap: 10 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  detailText: { color: '#d1d5db', fontSize: 14, flex: 1 },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  declineButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  declineButtonText: { color: '#ef4444', fontSize: 14, fontWeight: '600' },
  acceptButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#22c55e',
  },
  acceptButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
