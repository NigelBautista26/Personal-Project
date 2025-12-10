import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Clock, MapPin, User, MessageSquare, Check, X } from 'lucide-react-native';
import { snapnowApi } from '../../../src/api/snapnowApi';
import api from '../../../src/api/client';

const PRIMARY_COLOR = '#2563eb';

export default function PhotographerBookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: booking, isLoading, error, refetch } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => snapnowApi.getBooking(Number(id)),
    enabled: !!id,
  });

  const confirmMutation = useMutation({
    mutationFn: async () => {
      const response = await api.patch(`/api/bookings/${id}/confirm`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photographer-bookings'] });
      refetch();
      Alert.alert('Success', 'Booking confirmed!');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to confirm booking');
    },
  });

  const declineMutation = useMutation({
    mutationFn: async () => {
      const response = await api.patch(`/api/bookings/${id}/decline`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photographer-bookings'] });
      router.back();
      Alert.alert('Booking Declined', 'The booking has been declined.');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to decline booking');
    },
  });

  const completeMutation = useMutation({
    mutationFn: async () => {
      const response = await api.patch(`/api/bookings/${id}/complete`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photographer-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['photographer-earnings'] });
      refetch();
      Alert.alert('Success', 'Session marked as complete!');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to complete booking');
    },
  });

  const handleConfirm = () => {
    Alert.alert(
      'Confirm Booking',
      'Are you sure you want to accept this booking?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => confirmMutation.mutate() },
      ]
    );
  };

  const handleDecline = () => {
    Alert.alert(
      'Decline Booking',
      'Are you sure you want to decline this booking?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Decline', style: 'destructive', onPress: () => declineMutation.mutate() },
      ]
    );
  };

  const handleComplete = () => {
    Alert.alert(
      'Complete Session',
      'Mark this session as complete?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Complete', onPress: () => completeMutation.mutate() },
      ]
    );
  };

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

  const isPending = booking.status === 'pending';
  const isConfirmed = booking.status === 'confirmed';

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
          <Text style={styles.earnings}>£{booking.photographerEarnings}</Text>
          <Text style={styles.earningsLabel}>Your earnings</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer</Text>
          <View style={styles.customerCard}>
            <View style={styles.customerAvatar}>
              <User size={24} color="#9ca3af" />
            </View>
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>
                {booking.customer?.fullName || 'Customer'}
              </Text>
              <TouchableOpacity style={styles.messageButton}>
                <MessageSquare size={16} color={PRIMARY_COLOR} />
                <Text style={styles.messageButtonText}>Message</Text>
              </TouchableOpacity>
            </View>
          </View>
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

            <View style={[styles.detailRow, { marginBottom: 0 }]}>
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

        {booking.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{booking.notes}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {isPending && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.declineButton}
            onPress={handleDecline}
            disabled={declineMutation.isPending}
            testID="button-decline"
          >
            {declineMutation.isPending ? (
              <ActivityIndicator color="#ef4444" />
            ) : (
              <>
                <X size={20} color="#ef4444" />
                <Text style={styles.declineButtonText}>Decline</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
            disabled={confirmMutation.isPending}
            testID="button-confirm"
          >
            {confirmMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Check size={20} color="#fff" />
                <Text style={styles.confirmButtonText}>Accept</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {isConfirmed && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleComplete}
            disabled={completeMutation.isPending}
            testID="button-complete"
          >
            {completeMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.completeButtonText}>Mark as Complete</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
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
    marginBottom: 12,
  },
  statusText: { fontSize: 14, fontWeight: '600' },
  earnings: { fontSize: 36, fontWeight: '700', color: '#22c55e' },
  earningsLabel: { fontSize: 14, color: '#9ca3af', marginTop: 4 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 12 },
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  customerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  customerInfo: { flex: 1 },
  customerName: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 8 },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  messageButtonText: { color: PRIMARY_COLOR, fontSize: 14, fontWeight: '500' },
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
  notesCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  notesText: { fontSize: 14, color: '#d1d5db', lineHeight: 22 },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  declineButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  declineButtonText: { color: '#ef4444', fontSize: 16, fontWeight: '600' },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#22c55e',
  },
  confirmButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  completeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: PRIMARY_COLOR,
  },
  completeButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
