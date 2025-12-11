import React, { useState } from 'react';
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  User, 
  ChevronRight, 
  ChevronDown,
  AlertTriangle,
  Upload,
  Check,
  X,
  Image as ImageIcon,
  DollarSign,
} from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { snapnowApi } from '../../src/api/snapnowApi';
import { API_URL } from '../../src/api/client'; // For image URLs

const PRIMARY_COLOR = '#2563eb';

export default function PhotographerBookingsScreen() {
  const { photographerProfile } = useAuth();
  const queryClient = useQueryClient();
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    completedSessions: true,
    approvedEdits: true,
    declined: true,
  });

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['photographer-bookings', photographerProfile?.id],
    queryFn: () => snapnowApi.getPhotographerBookings(photographerProfile!.id.toString()),
    enabled: !!photographerProfile?.id,
  });

  const bookingsArray = Array.isArray(bookings) ? bookings : [];

  const pendingBookings = bookingsArray.filter(b => b.status === 'pending');
  const upcomingBookings = bookingsArray.filter(b => 
    b.status === 'confirmed' && new Date(b.scheduledDate) >= new Date()
  );
  const readyForPhotos = bookingsArray.filter(b => b.status === 'photos_pending');
  const completedBookings = bookingsArray.filter(b => b.status === 'completed');
  const declinedBookings = bookingsArray.filter(b => b.status === 'declined' || b.status === 'cancelled');

  const updateBookingMutation = useMutation({
    mutationFn: ({ bookingId, status }: { bookingId: number; status: string }) => 
      snapnowApi.updateBookingStatus(bookingId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photographer-bookings'] });
    },
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getImageUrl = (url?: string | null) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
  };

  const renderSectionHeader = (
    icon: React.ReactNode,
    title: string,
    count: number,
    sectionKey?: string,
    color?: string
  ) => (
    <TouchableOpacity
      style={styles.sectionHeader}
      onPress={() => sectionKey && toggleSection(sectionKey)}
      disabled={!sectionKey}
    >
      <View style={styles.sectionTitleRow}>
        {icon}
        <Text style={[styles.sectionTitle, color ? { color } : null]}>
          {title} ({count})
        </Text>
      </View>
      {sectionKey && (
        collapsedSections[sectionKey] ? 
          <ChevronRight size={20} color="#9ca3af" /> : 
          <ChevronDown size={20} color="#9ca3af" />
      )}
    </TouchableOpacity>
  );

  const renderBookingCard = (booking: any, showActions: boolean = false, showUploadButton: boolean = false) => (
    <TouchableOpacity
      key={booking.id}
      style={styles.bookingCard}
      onPress={() => router.push(`/(photographer)/booking/${booking.id}`)}
      testID={`card-booking-${booking.id}`}
    >
      <View style={styles.bookingHeader}>
        <View style={styles.customerInfo}>
          <View style={styles.customerAvatar}>
            {booking.customer?.profileImageUrl ? (
              <Image 
                source={{ uri: getImageUrl(booking.customer.profileImageUrl)! }} 
                style={styles.customerAvatarImage} 
              />
            ) : (
              <User size={20} color="#9ca3af" />
            )}
          </View>
          <View>
            <Text style={styles.customerName}>
              {booking.customer?.fullName || 'Customer'}
            </Text>
            <Text style={styles.bookingMeta}>
              {formatDate(booking.scheduledDate)} • {booking.location}
            </Text>
          </View>
        </View>
        <View style={styles.earningsContainer}>
          <Text style={styles.earnings}>£{booking.photographerEarnings}</Text>
          <Text style={styles.earningsLabel}>earnings</Text>
        </View>
      </View>

      {showUploadButton && (
        <TouchableOpacity 
          style={styles.uploadButton}
          onPress={() => router.push(`/(photographer)/booking/${booking.id}`)}
        >
          <Upload size={18} color="#fff" />
          <Text style={styles.uploadButtonText}>Upload Photos Now</Text>
        </TouchableOpacity>
      )}

      {showActions && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.declineButton}
            onPress={() => updateBookingMutation.mutate({ bookingId: booking.id, status: 'declined' })}
          >
            <X size={16} color="#ef4444" />
            <Text style={styles.declineButtonText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.acceptButton}
            onPress={() => updateBookingMutation.mutate({ bookingId: booking.id, status: 'confirmed' })}
          >
            <Check size={16} color="#fff" />
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  if (bookingsLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Bookings</Text>
          <Text style={styles.subtitle}>Manage your upcoming photo sessions</Text>
        </View>

        {/* Upcoming Sessions */}
        <View style={styles.section}>
          {renderSectionHeader(
            <Calendar size={20} color={PRIMARY_COLOR} />,
            'Upcoming Sessions',
            upcomingBookings.length
          )}
          {upcomingBookings.length === 0 ? (
            <View style={styles.emptyCard}>
              <Calendar size={32} color="#6b7280" />
              <Text style={styles.emptyText}>No upcoming sessions</Text>
            </View>
          ) : (
            upcomingBookings.map(booking => renderBookingCard(booking))
          )}
        </View>

        {/* Pending Requests */}
        {pendingBookings.length > 0 && (
          <View style={styles.section}>
            {renderSectionHeader(
              <Clock size={20} color="#f59e0b" />,
              'Pending Requests',
              pendingBookings.length,
              undefined,
              '#f59e0b'
            )}
            <Text style={styles.sectionDescription}>
              These customers are waiting for your response
            </Text>
            {pendingBookings.map(booking => renderBookingCard(booking, true))}
          </View>
        )}

        {/* Ready for Photos */}
        {readyForPhotos.length > 0 && (
          <View style={styles.section}>
            {renderSectionHeader(
              <Upload size={20} color="#f97316" />,
              'Ready for Photos',
              readyForPhotos.length,
              undefined,
              '#f97316'
            )}
            <Text style={styles.sectionDescription}>
              These sessions are complete. Upload photos to finalize and get paid.
            </Text>
            {readyForPhotos.map(booking => renderBookingCard(booking, false, true))}
          </View>
        )}

        {/* Completed Sessions */}
        {completedBookings.length > 0 && (
          <View style={styles.section}>
            {renderSectionHeader(
              <Check size={20} color="#22c55e" />,
              'Completed Sessions',
              completedBookings.length,
              'completedSessions',
              '#22c55e'
            )}
            {!collapsedSections.completedSessions && (
              completedBookings.map(booking => renderBookingCard(booking))
            )}
          </View>
        )}

        {/* Declined */}
        {declinedBookings.length > 0 && (
          <View style={styles.section}>
            {renderSectionHeader(
              <X size={20} color="#ef4444" />,
              'Declined',
              declinedBookings.length,
              'declined',
              '#ef4444'
            )}
            {!collapsedSections.declined && (
              declinedBookings.map(booking => renderBookingCard(booking))
            )}
          </View>
        )}

        {/* Empty State - No bookings at all */}
        {bookingsArray.length === 0 && (
          <View style={styles.emptyStateContainer}>
            <Calendar size={64} color="#6b7280" />
            <Text style={styles.emptyStateTitle}>No bookings yet</Text>
            <Text style={styles.emptyStateText}>
              When customers book sessions with you, they'll appear here
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1 },
  
  header: { padding: 20, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '700', color: '#fff' },
  subtitle: { fontSize: 14, color: '#9ca3af', marginTop: 4 },

  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginLeft: 8 },
  sectionDescription: { fontSize: 13, color: '#9ca3af', marginBottom: 12, marginTop: -4 },

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
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 12,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  customerInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  customerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  customerAvatarImage: { width: 44, height: 44, borderRadius: 22 },
  customerName: { fontSize: 16, fontWeight: '600', color: '#fff' },
  bookingMeta: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  earningsContainer: { alignItems: 'flex-end' },
  earnings: { fontSize: 18, fontWeight: '700', color: '#22c55e' },
  earningsLabel: { fontSize: 11, color: '#9ca3af' },

  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f97316',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  uploadButtonText: { fontSize: 14, fontWeight: '600', color: '#fff' },

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ef4444',
    gap: 6,
  },
  declineButtonText: { color: '#ef4444', fontSize: 14, fontWeight: '600' },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#22c55e',
    gap: 6,
  },
  acceptButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  emptyStateContainer: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyStateTitle: { fontSize: 20, fontWeight: '600', color: '#fff', marginTop: 16 },
  emptyStateText: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 8 },
});
