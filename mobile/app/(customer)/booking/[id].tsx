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
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Clock, MapPin, User, MessageSquare } from 'lucide-react-native';
import { snapnowApi } from '../../../src/api/snapnowApi';
import { LiveLocationSharing } from '../../../src/components/LiveLocationSharing';

const PRIMARY_COLOR = '#2563eb';

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => snapnowApi.getBooking(id!),
    enabled: !!id,
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
    return date.toLocaleDateString('en-GB', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} style={styles.loader} />
      </SafeAreaView>
    );
  }

  if (error || !booking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Booking Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorState}>
          <Text style={styles.errorText}>Booking not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} testID="button-back">
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Booking Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statusCard}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Text>
          </View>
          <Text style={styles.bookingId}>Booking #{booking.id}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session Details</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Calendar size={20} color={PRIMARY_COLOR} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>{formatDate(booking.scheduledDate)}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Clock size={20} color={PRIMARY_COLOR} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Time & Duration</Text>
                <Text style={styles.detailValue}>{booking.scheduledTime} ({booking.duration} hour{booking.duration > 1 ? 's' : ''})</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <MapPin size={20} color={PRIMARY_COLOR} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{booking.location}</Text>
              </View>
            </View>
          </View>
        </View>

        {booking.photographer && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photographer</Text>
            <View style={styles.photographerCard}>
              <View style={styles.photographerAvatar}>
                <User size={24} color="#9ca3af" />
              </View>
              <View style={styles.photographerInfo}>
                <Text style={styles.photographerName}>
                  {booking.photographer.user?.fullName || 'Photographer'}
                </Text>
                <TouchableOpacity style={styles.messageButton}>
                  <MessageSquare size={16} color={PRIMARY_COLOR} />
                  <Text style={styles.messageButtonText}>Message</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {booking.status === 'confirmed' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Live Location</Text>
            <LiveLocationSharing
              bookingId={booking.id}
              scheduledDate={booking.scheduledDate}
              scheduledTime={booking.scheduledTime}
              userType="customer"
            />
          </View>
        )}

        {booking.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{booking.notes}</Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment</Text>
          <View style={styles.paymentCard}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Session Fee</Text>
              <Text style={styles.paymentValue}>£{booking.totalAmount}</Text>
            </View>
            <View style={[styles.paymentRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Paid</Text>
              <Text style={styles.totalValue}>£{booking.totalAmount}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  loader: { marginTop: 100 },
  errorState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#9ca3af', fontSize: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: { padding: 4 },
  title: { fontSize: 18, fontWeight: '600', color: '#fff' },
  placeholder: { width: 32 },
  content: { flex: 1, padding: 20 },
  statusCard: {
    alignItems: 'center',
    marginBottom: 24,
  },
  statusBadge: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 8,
  },
  statusText: { fontSize: 14, fontWeight: '600' },
  bookingId: { fontSize: 14, color: '#6b7280' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 12 },
  detailsCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(37,99,235,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: { flex: 1 },
  detailLabel: { fontSize: 12, color: '#9ca3af', marginBottom: 4 },
  detailValue: { fontSize: 14, color: '#fff' },
  photographerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  photographerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  photographerInfo: { flex: 1 },
  photographerName: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 8 },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  messageButtonText: { color: PRIMARY_COLOR, fontSize: 14, fontWeight: '500' },
  notesCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  notesText: { fontSize: 14, color: '#d1d5db', lineHeight: 22 },
  paymentCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  paymentLabel: { fontSize: 14, color: '#9ca3af' },
  paymentValue: { fontSize: 14, color: '#fff' },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 12,
    marginBottom: 0,
  },
  totalLabel: { fontSize: 16, fontWeight: '600', color: '#fff' },
  totalValue: { fontSize: 18, fontWeight: '700', color: PRIMARY_COLOR },
});
