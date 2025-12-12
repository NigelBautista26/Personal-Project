import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Image,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Clock, MapPin, User, MessageSquare, Check, X, Upload, Plus, Navigation, DollarSign } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { snapnowApi } from '../../../src/api/snapnowApi';
import api, { API_URL } from '../../../src/api/client';
import { LiveLocationSharing } from '../../../src/components/LiveLocationSharing';
import { BookingChat } from '../../../src/components/BookingChat';
import { useAuth } from '../../../src/context/AuthContext';

const PRIMARY_COLOR = '#2563eb';

export default function PhotographerBookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Photo upload state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState<string[]>([]);
  const [uploadMessage, setUploadMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  // Meeting point state
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [meetingLatitude, setMeetingLatitude] = useState<number | null>(null);
  const [meetingLongitude, setMeetingLongitude] = useState<number | null>(null);
  const [meetingNotes, setMeetingNotes] = useState('');
  const [isSavingLocation, setIsSavingLocation] = useState(false);

  const { data: booking, isLoading, error, refetch } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => snapnowApi.getBooking(id!),
    enabled: !!id,
  });

  // Fetch existing photo delivery
  const { data: existingDelivery } = useQuery({
    queryKey: ['photo-delivery', id],
    queryFn: () => snapnowApi.getPhotoDelivery(id!),
    enabled: !!id && (booking?.status === 'photos_pending' || booking?.status === 'completed'),
  });

  const confirmMutation = useMutation({
    mutationFn: async () => {
      const response = await api.patch(`/api/bookings/${id}/status`, { status: 'confirmed' });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photographer-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      refetch();
      Alert.alert('Success', 'Booking confirmed! Payment has been captured.');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to confirm booking');
    },
  });

  const declineMutation = useMutation({
    mutationFn: async () => {
      const response = await api.patch(`/api/bookings/${id}/status`, { status: 'cancelled' });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photographer-bookings'] });
      router.back();
      Alert.alert('Booking Declined', 'The booking has been declined and payment authorization released.');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to decline booking');
    },
  });

  const completeMutation = useMutation({
    mutationFn: async () => {
      const response = await api.patch(`/api/bookings/${id}/status`, { status: 'completed' });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photographer-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['photographer-earnings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
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

  // Photo upload functions
  const handleOpenUploadModal = () => {
    if (existingDelivery?.photos) {
      setUploadingPhotos(existingDelivery.photos);
      setUploadMessage(existingDelivery.message || '');
    }
    setShowUploadModal(true);
  };

  const handlePickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'Please allow access to your photo library to upload photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setIsUploading(true);
      try {
        for (const asset of result.assets) {
          // Get upload URL
          const { uploadURL, objectPath } = await snapnowApi.getUploadUrl();
          
          // Upload the file
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          
          await fetch(uploadURL, {
            method: 'PUT',
            headers: { 'Content-Type': 'image/jpeg' },
            body: blob,
          });

          // Add to delivery
          const delivery = await snapnowApi.addPhotoToDelivery(id!, objectPath);
          setUploadingPhotos(delivery.photos || []);
        }
        Alert.alert('Success', `${result.assets.length} photo(s) uploaded!`);
      } catch (error) {
        console.error('Upload error:', error);
        Alert.alert('Upload Failed', 'Could not upload photos. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSaveDelivery = async () => {
    try {
      await snapnowApi.savePhotoDelivery(id!, uploadMessage || undefined);
      queryClient.invalidateQueries({ queryKey: ['photographer-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['photo-delivery', id] });
      refetch();
      setShowUploadModal(false);
      Alert.alert('Photos Delivered', 'Your photos have been sent to the customer!');
    } catch (error) {
      Alert.alert('Error', 'Could not save photo delivery.');
    }
  };

  const getImageUrl = (url: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#22c55e';
      case 'pending': return '#f59e0b';
      case 'completed': return '#6366f1';
      case 'photos_pending': return '#2563eb';
      case 'cancelled':
      case 'declined':
      case 'expired': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    if (!status) return 'Unknown';
    switch (status) {
      case 'photos_pending': return 'Ready for Photos';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
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

  // Initialize meeting point from booking data
  useEffect(() => {
    if (booking) {
      if (booking.meetingLatitude) setMeetingLatitude(parseFloat(booking.meetingLatitude));
      if (booking.meetingLongitude) setMeetingLongitude(parseFloat(booking.meetingLongitude));
      if (booking.meetingNotes) setMeetingNotes(booking.meetingNotes);
    }
  }, [booking]);

  const hasMeetingLocation = !!(booking?.meetingLatitude && booking?.meetingLongitude);

  const handleUseCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is required to set meeting point.');
      return;
    }
    const location = await Location.getCurrentPositionAsync({});
    setMeetingLatitude(location.coords.latitude);
    setMeetingLongitude(location.coords.longitude);
    setIsEditingLocation(true);
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setMeetingLatitude(latitude);
    setMeetingLongitude(longitude);
  };

  const handleSaveLocation = async () => {
    if (!meetingLatitude || !meetingLongitude) {
      Alert.alert('Error', 'Please select a location on the map.');
      return;
    }
    setIsSavingLocation(true);
    try {
      await api.patch(`/api/bookings/${id}/meeting-location`, {
        latitude: meetingLatitude,
        longitude: meetingLongitude,
        notes: meetingNotes || null,
      });
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      refetch();
      setIsEditingLocation(false);
      Alert.alert('Success', 'Meeting point saved!');
    } catch (error) {
      Alert.alert('Error', 'Could not save meeting point.');
    } finally {
      setIsSavingLocation(false);
    }
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
  
  // Compute if session has ended (confirmed booking with past date/time)
  const hasSessionEnded = () => {
    if (booking.status !== 'confirmed') return false;
    const sessionDate = new Date(booking.scheduledDate);
    const timeMatch = booking.scheduledTime?.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
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
  
  const isConfirmed = booking.status === 'confirmed' && !hasSessionEnded();
  const canEditMeetingPoint = (booking.status === 'pending' || booking.status === 'confirmed') && !hasSessionEnded();
  const isPhotosPending = (booking.status === 'confirmed' && hasSessionEnded()) || booking.status === 'photos_pending';

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
          <View style={[styles.statusBadge, { backgroundColor: (isPhotosPending ? getStatusColor('photos_pending') : getStatusColor(booking.status || 'pending')) + '20' }]}>
            <Text style={[styles.statusText, { color: isPhotosPending ? getStatusColor('photos_pending') : getStatusColor(booking.status || 'pending') }]}>
              {isPhotosPending ? 'Ready for Photos' : getStatusLabel(booking.status || 'pending')}
            </Text>
          </View>
          <Text style={styles.earnings}>£{booking.photographerEarnings || '0.00'}</Text>
          <Text style={styles.earningsLabel}>Your earnings</Text>
        </View>

        {/* Customer Card */}
        <View style={styles.customerSection}>
          {booking.customer?.profileImageUrl ? (
            <Image 
              source={{ uri: getImageUrl(booking.customer.profileImageUrl)! }} 
              style={styles.customerImage} 
            />
          ) : (
            <View style={styles.customerAvatarLarge}>
              <User size={28} color="#9ca3af" />
            </View>
          )}
          <View style={styles.customerInfo}>
            <Text style={styles.customerLabel}>Customer</Text>
            <Text style={styles.customerName}>{booking.customer?.fullName || 'Customer'}</Text>
          </View>
        </View>

        {/* Session Details */}
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

            <View style={[styles.detailRow, { marginBottom: 0 }]}>
              <View style={[styles.detailIcon, { backgroundColor: 'rgba(34, 197, 94, 0.2)' }]}>
                <DollarSign size={20} color="#22c55e" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Your Earnings</Text>
                <Text style={[styles.detailValue, { color: '#22c55e', fontWeight: '700', fontSize: 18 }]}>
                  £{parseFloat(booking.photographerEarnings || '0').toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Meeting Point - for confirmed bookings */}
        {canEditMeetingPoint && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Meeting Point</Text>
              {hasMeetingLocation && !isEditingLocation && (
                <TouchableOpacity 
                  onPress={() => setIsEditingLocation(true)}
                  style={styles.editButton}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              )}
            </View>

            {(isEditingLocation || !hasMeetingLocation) ? (
              <View style={styles.meetingPointCard}>
                <TouchableOpacity 
                  style={styles.useLocationButton}
                  onPress={handleUseCurrentLocation}
                  testID="button-use-my-location"
                >
                  <Navigation size={18} color="#fff" />
                  <Text style={styles.useLocationButtonText}>Use My Current Location</Text>
                </TouchableOpacity>

                {meetingLatitude && meetingLongitude && (
                  <View style={styles.locationSetCard}>
                    <MapPin size={16} color="#22c55e" />
                    <Text style={styles.locationSetText}>
                      Location set: {meetingLatitude.toFixed(4)}, {meetingLongitude.toFixed(4)}
                    </Text>
                  </View>
                )}

                <TextInput
                  style={styles.meetingNotesInput}
                  placeholder="Meeting Notes (optional)"
                  placeholderTextColor="#6b7280"
                  value={meetingNotes}
                  onChangeText={setMeetingNotes}
                  multiline
                />

                <TouchableOpacity 
                  style={[styles.saveLocationButton, (!meetingLatitude || isSavingLocation) && styles.saveLocationButtonDisabled]}
                  onPress={handleSaveLocation}
                  disabled={!meetingLatitude || isSavingLocation}
                  testID="button-save-location"
                >
                  {isSavingLocation ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveLocationButtonText}>Save Meeting Point</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.meetingPointCard}>
                <View style={styles.locationSetCard}>
                  <MapPin size={16} color="#22c55e" />
                  <Text style={styles.locationSetText}>Meeting point set</Text>
                </View>
                {booking.meetingNotes && (
                  <View style={styles.meetingNotesDisplay}>
                    <Text style={styles.meetingNotesText}>{booking.meetingNotes}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* Live Location Sharing */}
        {booking.status === 'confirmed' && !hasSessionEnded() && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Live Location</Text>
            <LiveLocationSharing
              bookingId={booking.id}
              scheduledDate={booking.scheduledDate}
              scheduledTime={booking.scheduledTime}
              duration={booking.duration || 1}
              userType="photographer"
            />
          </View>
        )}

        {/* Messages/Chat */}
        {user && (booking.status === 'confirmed' || booking.status === 'pending') && (
          <View style={styles.section}>
            <BookingChat
              bookingId={booking.id}
              currentUserId={user.id}
              otherPartyName={booking.customer?.fullName || 'Customer'}
            />
          </View>
        )}

        {/* Customer Notes */}
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

      {isPhotosPending && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleOpenUploadModal}
            testID="button-upload-photos"
          >
            <Upload size={20} color="#fff" />
            <Text style={styles.uploadButtonText}>Upload Photos</Text>
          </TouchableOpacity>
        </View>
      )}
      </KeyboardAvoidingView>

      {/* Photo Upload Modal */}
      <Modal
        visible={showUploadModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowUploadModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowUploadModal(false)}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Deliver Photos</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.photoCountLabel}>Photos ({uploadingPhotos.length})</Text>
            
            <View style={styles.photoGrid}>
              {uploadingPhotos.map((photo, idx) => (
                <View key={idx} style={styles.photoItem}>
                  <Image 
                    source={{ uri: getImageUrl(photo) || photo }} 
                    style={styles.photoImage} 
                  />
                </View>
              ))}
              
              <TouchableOpacity 
                style={styles.addPhotoButton}
                onPress={handlePickImages}
                disabled={isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator color={PRIMARY_COLOR} />
                ) : (
                  <>
                    <Plus size={24} color={PRIMARY_COLOR} />
                    <Text style={styles.addPhotoText}>Add</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.messageLabel}>Message to Customer (optional)</Text>
            <TextInput
              style={styles.messageInput}
              placeholder="Add a personal note..."
              placeholderTextColor="#6b7280"
              value={uploadMessage}
              onChangeText={setUploadMessage}
              multiline
              numberOfLines={3}
            />
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.deliverButton, uploadingPhotos.length === 0 && styles.deliverButtonDisabled]}
              onPress={handleSaveDelivery}
              disabled={uploadingPhotos.length === 0}
            >
              <Text style={styles.deliverButtonText}>
                📷 Deliver {uploadingPhotos.length} Photo{uploadingPhotos.length !== 1 ? 's' : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
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
  uploadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: PRIMARY_COLOR,
  },
  uploadButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  
  // Modal styles
  modalContainer: { flex: 1, backgroundColor: '#0a0a0a' },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#fff' },
  modalContent: { flex: 1, padding: 20 },
  photoCountLabel: { fontSize: 14, color: '#9ca3af', marginBottom: 12 },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  photoItem: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  photoImage: { width: '100%', height: '100%' },
  addPhotoButton: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoText: { fontSize: 12, color: PRIMARY_COLOR, marginTop: 4 },
  messageLabel: { fontSize: 14, color: '#9ca3af', marginBottom: 8 },
  messageInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalFooter: {
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  deliverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#22c55e',
  },
  deliverButtonDisabled: {
    backgroundColor: '#374151',
  },
  deliverButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  // Customer section styles
  customerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 24,
  },
  customerImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
  },
  customerAvatarLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  customerLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 2,
  },

  // Meeting Point styles
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  meetingPointCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  useLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 12,
  },
  useLocationButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapHint: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 12,
  },
  meetingNotesInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 12,
  },
  saveLocationButton: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: PRIMARY_COLOR,
  },
  saveLocationButtonDisabled: {
    backgroundColor: '#374151',
  },
  saveLocationButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
  locationSetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  locationSetText: {
    color: '#22c55e',
    fontSize: 14,
  },
});
