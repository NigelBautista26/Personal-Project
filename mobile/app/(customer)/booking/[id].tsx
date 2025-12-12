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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Clock, MapPin, User, DollarSign, Shield } from 'lucide-react-native';
import { snapnowApi } from '../../../src/api/snapnowApi';
import { LiveLocationSharing } from '../../../src/components/LiveLocationSharing';
import { BookingChat } from '../../../src/components/BookingChat';
import { useAuth } from '../../../src/context/AuthContext';
import { API_URL } from '../../../src/api/client';

const PRIMARY_COLOR = '#2563eb';

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

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

  const formatDate = (dateStr: string | undefined | null) => {
    if (!dateStr) return 'Date not set';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-GB', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getImageUrl = (url: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
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
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} testID="button-back">
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Booking Details</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.statusCard}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status || 'pending') + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(booking.status || 'pending') }]}>
              {(booking.status || 'Pending').charAt(0).toUpperCase() + (booking.status || 'pending').slice(1)}
            </Text>
          </View>
        </View>

        {/* Photographer Card */}
        {booking.photographer && (
          <View style={styles.photographerSection}>
            {booking.photographer.profileImageUrl ? (
              <Image 
                source={{ uri: getImageUrl(booking.photographer.profileImageUrl)! }} 
                style={styles.photographerImage} 
              />
            ) : (
              <View style={styles.photographerAvatarLarge}>
                <User size={28} color="#9ca3af" />
              </View>
            )}
            <View style={styles.photographerInfo}>
              <Text style={styles.photographerLabel}>Your Photographer</Text>
              <Text style={styles.photographerName}>
                {booking.photographer.user?.fullName || 'Photographer'}
              </Text>
            </View>
            <TouchableOpacity style={styles.messageIconButton}>
              <MessageSquare size={20} color={PRIMARY_COLOR} />
            </TouchableOpacity>
          </View>
        )}

        {/* Session Details with Total Paid */}
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
                <Text style={styles.detailValue}>
                  {booking.scheduledTime || 'Time not set'} ({booking.duration || 1} hour{(booking.duration || 1) > 1 ? 's' : ''})
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <MapPin size={20} color={PRIMARY_COLOR} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{booking.location || 'Location not set'}</Text>
              </View>
            </View>

            <View style={[styles.detailRow, { marginBottom: 0 }]}>
              <View style={[styles.detailIcon, { backgroundColor: 'rgba(34, 197, 94, 0.2)' }]}>
                <DollarSign size={20} color="#22c55e" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Total Paid</Text>
                <Text style={[styles.detailValue, { color: '#22c55e', fontWeight: '700', fontSize: 18 }]}>
                  £{parseFloat(booking.totalAmount || '0').toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Payment Protected Notice */}
        {booking.status === 'confirmed' && (
          <View style={styles.paymentProtectedCard}>
            <View style={styles.paymentProtectedIcon}>
              <Shield size={20} color="#22c55e" />
            </View>
            <View style={styles.paymentProtectedContent}>
              <Text style={styles.paymentProtectedTitle}>Payment Protected</Text>
              <Text style={styles.paymentProtectedText}>
                Your payment is held securely until your photographer delivers your photos. This ensures you're protected and get what you paid for.
              </Text>
            </View>
          </View>
        )}

        {/* Live Location Sharing */}
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

        {/* Messages/Chat */}
        {user && (booking.status === 'confirmed' || booking.status === 'pending') && (
          <View style={styles.section}>
            <BookingChat
              bookingId={booking.id}
              currentUserId={user.id}
              otherPartyName={booking.photographer?.user?.fullName || 'Photographer'}
            />
          </View>
        )}

        {/* Customer Notes */}
        {booking.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{booking.notes}</Text>
            </View>
          </View>
        )}
        </ScrollView>
      </KeyboardAvoidingView>
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

  // Photographer section styles
  photographerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 24,
  },
  photographerImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  photographerAvatarLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  photographerLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 2,
  },
  messageIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(37,99,235,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Payment Protected styles
  paymentProtectedCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    marginBottom: 24,
  },
  paymentProtectedIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paymentProtectedContent: {
    flex: 1,
  },
  paymentProtectedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22c55e',
    marginBottom: 4,
  },
  paymentProtectedText: {
    fontSize: 12,
    color: '#9ca3af',
    lineHeight: 18,
  },

  // Meeting Point styles
  meetingPointCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  mapContainer: {
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  meetingNotesDisplay: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  meetingNotesText: {
    color: '#d1d5db',
    fontSize: 14,
  },
  liveMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  liveMarkerInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  mapLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  waitingForLocationCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  waitingForLocationTitle: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  waitingForLocationText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
