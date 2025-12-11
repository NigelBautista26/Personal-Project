import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Calendar, DollarSign, Star, TrendingUp, Camera, Clock } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { snapnowApi } from '../../src/api/snapnowApi';

export default function PhotographerDashboardScreen() {
  const { user, photographerProfile } = useAuth();

  const { data: bookings } = useQuery({
    queryKey: ['photographer-bookings'],
    queryFn: () => snapnowApi.getBookings(),
  });

  const { data: earnings } = useQuery({
    queryKey: ['photographer-earnings'],
    queryFn: () => snapnowApi.getEarnings(),
  });

  const pendingBookings = bookings?.filter(b => b.status === 'pending') || [];
  const confirmedBookings = bookings?.filter(b => b.status === 'confirmed') || [];
  const completedBookings = bookings?.filter(b => b.status === 'completed') || [];

  const totalEarnings = (earnings || []).reduce((sum, e) => sum + e.amount, 0);
  const availableEarnings = (earnings || []).filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{user?.fullName?.split(' ')[0] || 'Photographer'}!</Text>
        </View>

        {pendingBookings.length > 0 && (
          <TouchableOpacity
            style={styles.alertCard}
            onPress={() => router.push('/(photographer)/bookings')}
          >
            <View style={styles.alertIcon}>
              <Clock size={24} color="#f59e0b" />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>
                {pendingBookings.length} pending request{pendingBookings.length > 1 ? 's' : ''}
              </Text>
              <Text style={styles.alertText}>Respond before they expire</Text>
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(99,102,241,0.2)' }]}>
              <DollarSign size={20} color="#6366f1" />
            </View>
            <Text style={styles.statValue}>£{totalEarnings}</Text>
            <Text style={styles.statLabel}>Total Earned</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(34,197,94,0.2)' }]}>
              <TrendingUp size={20} color="#22c55e" />
            </View>
            <Text style={styles.statValue}>£{availableEarnings}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(251,191,36,0.2)' }]}>
              <Star size={20} color="#fbbf24" />
            </View>
            <Text style={styles.statValue}>
              {photographerProfile?.rating != null ? Number(photographerProfile.rating).toFixed(1) : 'N/A'}
            </Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(236,72,153,0.2)' }]}>
              <Camera size={20} color="#ec4899" />
            </View>
            <Text style={styles.statValue}>{completedBookings.length}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
            <TouchableOpacity onPress={() => router.push('/(photographer)/bookings')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          {confirmedBookings.length === 0 ? (
            <View style={styles.emptyCard}>
              <Calendar size={32} color="#6b7280" />
              <Text style={styles.emptyText}>No upcoming sessions</Text>
            </View>
          ) : (
            confirmedBookings.slice(0, 3).map((booking) => (
              <TouchableOpacity
                key={booking.id}
                style={styles.bookingCard}
                onPress={() => router.push(`/(photographer)/booking/${booking.id}`)}
              >
                <View style={styles.bookingDate}>
                  <Text style={styles.bookingDay}>
                    {new Date(booking.scheduledDate).getDate()}
                  </Text>
                  <Text style={styles.bookingMonth}>
                    {new Date(booking.scheduledDate).toLocaleDateString('en-GB', { month: 'short' })}
                  </Text>
                </View>
                <View style={styles.bookingInfo}>
                  <Text style={styles.bookingTime}>{booking.scheduledTime}</Text>
                  <Text style={styles.bookingLocation} numberOfLines={1}>
                    {booking.location}
                  </Text>
                </View>
                <Text style={styles.bookingPrice}>£{booking.photographerEarnings}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  content: { flex: 1 },
  header: { padding: 20 },
  greeting: { fontSize: 16, color: '#9ca3af' },
  name: { fontSize: 28, fontWeight: '700', color: '#fff' },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245,158,11,0.1)',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
  },
  alertIcon: { marginRight: 16 },
  alertContent: { flex: 1 },
  alertTitle: { fontSize: 16, fontWeight: '600', color: '#f59e0b' },
  alertText: { fontSize: 14, color: '#fbbf24', marginTop: 2 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: { fontSize: 24, fontWeight: '700', color: '#fff' },
  statLabel: { fontSize: 14, color: '#9ca3af', marginTop: 4 },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#fff' },
  seeAll: { fontSize: 14, color: '#6366f1' },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  emptyText: { fontSize: 14, color: '#9ca3af', marginTop: 12 },
  bookingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  bookingDate: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(99,102,241,0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  bookingDay: { fontSize: 20, fontWeight: '700', color: '#6366f1' },
  bookingMonth: { fontSize: 12, color: '#6366f1' },
  bookingInfo: { flex: 1 },
  bookingTime: { fontSize: 16, fontWeight: '600', color: '#fff' },
  bookingLocation: { fontSize: 14, color: '#9ca3af', marginTop: 2 },
  bookingPrice: { fontSize: 18, fontWeight: '700', color: '#22c55e' },
});
