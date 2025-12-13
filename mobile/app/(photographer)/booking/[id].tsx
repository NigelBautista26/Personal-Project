import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Image,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Clock, MapPin, User, Check, X, Upload, Plus, DollarSign, Camera, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { snapnowApi } from '../../../src/api/snapnowApi';
import api, { API_URL } from '../../../src/api/client';
import { MeetUpExperience } from '../../../src/components/MeetUpExperience';
import { BookingChat } from '../../../src/components/BookingChat';
import { useAuth } from '../../../src/context/AuthContext';

const PRIMARY_COLOR = '#2563eb';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function PhotographerBookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Photo upload state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState<string[]>([]);
  const [uploadMessage, setUploadMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Success modal state (themed replacement for Alert)
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: '', message: '' });
  
  // Error modal state
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState({ title: '', message: '' });
  
  // Confirmation modal state (replaces Alert.alert with buttons)
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    isDestructive: boolean;
    onConfirm: () => void;
  }>({ title: '', message: '', confirmText: 'Confirm', cancelText: 'Cancel', isDestructive: false, onConfirm: () => {} });
  
  // Photo fullscreen viewer state
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  

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
      setSuccessMessage({ title: 'Booking Confirmed', message: 'Payment has been captured. Get ready for the session!' });
      setShowSuccessModal(true);
    },
    onError: (error: any) => {
      setErrorMessage({ title: 'Error', message: error.response?.data?.error || 'Failed to confirm booking' });
      setShowErrorModal(true);
    },
  });

  const declineMutation = useMutation({
    mutationFn: async () => {
      const response = await api.patch(`/api/bookings/${id}/status`, { status: 'cancelled' });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photographer-bookings'] });
      setSuccessMessage({ title: 'Booking Declined', message: 'The booking has been declined and payment authorization released.' });
      setShowSuccessModal(true);
      setTimeout(() => router.back(), 1500);
    },
    onError: (error: any) => {
      setErrorMessage({ title: 'Error', message: error.response?.data?.error || 'Failed to decline booking' });
      setShowErrorModal(true);
    },
  });

  const handleConfirm = () => {
    setConfirmModalConfig({
      title: 'Accept Booking',
      message: 'Are you sure you want to accept this booking?',
      confirmText: 'Accept',
      cancelText: 'Cancel',
      isDestructive: false,
      onConfirm: () => {
        setShowConfirmModal(false);
        confirmMutation.mutate();
      },
    });
    setShowConfirmModal(true);
  };

  const handleDecline = () => {
    setConfirmModalConfig({
      title: 'Decline Booking',
      message: 'Are you sure you want to decline this booking?',
      confirmText: 'Decline',
      cancelText: 'Cancel',
      isDestructive: true,
      onConfirm: () => {
        setShowConfirmModal(false);
        declineMutation.mutate();
      },
    });
    setShowConfirmModal(true);
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
      setErrorMessage({ title: 'Permission Needed', message: 'Please allow access to your photo library to upload photos.' });
      setShowErrorModal(true);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      setIsUploading(true);
      try {
        for (const asset of result.assets) {
          const { uploadURL, objectPath } = await snapnowApi.getUploadUrl();
          
          const base64Data = asset.base64;
          if (!base64Data) {
            throw new Error('No base64 data available');
          }
          
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', uploadURL);
            xhr.setRequestHeader('Content-Type', asset.mimeType || 'image/jpeg');
            
            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                resolve();
              } else {
                reject(new Error(`Upload failed with status ${xhr.status}`));
              }
            };
            
            xhr.onerror = () => reject(new Error('Network error during upload'));
            xhr.send(bytes.buffer);
          });

          const delivery = await snapnowApi.addPhotoToDelivery(id!, objectPath);
          setUploadingPhotos(delivery.photos || []);
        }
        // Refresh queries so customer sees new photos
        queryClient.invalidateQueries({ queryKey: ['photo-delivery', id] });
        queryClient.invalidateQueries({ queryKey: ['booking', id] });
        setSuccessMessage({ title: 'Photos Added', message: `${result.assets.length} photo${result.assets.length > 1 ? 's' : ''} uploaded successfully!` });
        setShowSuccessModal(true);
      } catch (error) {
        console.error('Upload error:', error);
        setErrorMessage({ title: 'Upload Failed', message: 'Could not upload photos. Please try again.' });
        setShowErrorModal(true);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const togglePhotoSelection = (photoUrl: string) => {
    setSelectedPhotos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(photoUrl)) {
        newSet.delete(photoUrl);
      } else {
        newSet.add(photoUrl);
      }
      return newSet;
    });
  };

  const handleDeleteSelectedPhotos = async () => {
    if (selectedPhotos.size === 0) return;
    
    const count = selectedPhotos.size;
    Alert.alert(
      'Delete Photos',
      `Delete ${count} photo${count > 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              // Delete all selected photos in parallel
              const deletePromises = Array.from(selectedPhotos).map(photoUrl =>
                snapnowApi.deletePhotoFromDelivery(id!, photoUrl)
              );
              const results = await Promise.all(deletePromises);
              
              // Get the final photos list from last result
              const finalResult = results[results.length - 1];
              setUploadingPhotos(finalResult?.photos || []);
              setSelectedPhotos(new Set());
              queryClient.invalidateQueries({ queryKey: ['photo-delivery', id] });
              setSuccessMessage({ title: 'Photos Deleted', message: `${count} photo${count > 1 ? 's' : ''} removed.` });
              setShowSuccessModal(true);
            } catch (error) {
              console.error('[DELETE] API error:', error);
              setErrorMessage({ title: 'Error', message: 'Failed to delete photos. Please try again.' });
              setShowErrorModal(true);
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const clearPhotoSelection = () => {
    setSelectedPhotos(new Set());
  };

  const handleSaveDelivery = async () => {
    try {
      await snapnowApi.savePhotoDelivery(id!, uploadMessage || undefined);
      queryClient.invalidateQueries({ queryKey: ['photographer-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['photo-delivery', id] });
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      await refetch();
      setShowUploadModal(false);
      setSuccessMessage({ title: 'Photos Delivered', message: 'Your photos have been sent to the customer!' });
      setShowSuccessModal(true);
    } catch (error) {
      setErrorMessage({ title: 'Error', message: 'Could not save photo delivery. Please try again.' });
      setShowErrorModal(true);
    }
  };

  // Helper to show themed success
  const showSuccess = (title: string, message: string) => {
    setSuccessMessage({ title, message });
    setShowSuccessModal(true);
  };

  // Get the photos to display (for completed bookings)
  const deliveredPhotos = existingDelivery?.photos || [];

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

        {/* Meet Up Experience - unified meeting point + live location */}
        {booking.status === 'confirmed' && !hasSessionEnded() && (
          <MeetUpExperience
            bookingId={booking.id}
            scheduledDate={booking.scheduledDate}
            scheduledTime={booking.scheduledTime}
            duration={booking.duration || 1}
            userType="photographer"
            meetingLatitude={booking.meetingLatitude}
            meetingLongitude={booking.meetingLongitude}
            meetingNotes={booking.meetingNotes}
            locationName={booking.location}
            canEditMeetingPoint={canEditMeetingPoint}
            onMeetingPointSaved={() => refetch()}
            myProfileImage={user?.profileImageUrl ? getImageUrl(user.profileImageUrl) : undefined}
            otherPartyProfileImage={booking.customer?.profileImageUrl ? getImageUrl(booking.customer.profileImageUrl) : undefined}
          />
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

        {/* Delivered Photos - for completed bookings */}
        {booking.status === 'completed' && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Camera size={20} color="#6366f1" />
                <Text style={styles.sectionTitle}>Delivered Photos</Text>
              </View>
              {deliveredPhotos.length > 0 && (
                <Text style={styles.photoCountText}>{deliveredPhotos.length} photos</Text>
              )}
            </View>
            
            {deliveredPhotos.length > 0 ? (
              <View style={styles.deliveredPhotoGrid}>
                {deliveredPhotos.map((photo, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.deliveredPhotoThumbnail}
                    onPress={() => setSelectedPhotoIndex(index)}
                    testID={`delivered-photo-${index}`}
                  >
                    <Image 
                      source={{ uri: getImageUrl(photo)! }} 
                      style={styles.deliveredPhotoImage} 
                    />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.noPhotosCard}>
                <Camera size={32} color="#6b7280" />
                <Text style={styles.noPhotosText}>No photos delivered yet</Text>
              </View>
            )}
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

      {booking.status === 'completed' && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.addMorePhotosButton}
            onPress={handleOpenUploadModal}
            testID="button-add-more-photos"
          >
            <Plus size={20} color="#fff" />
            <Text style={styles.uploadButtonText}>Add More Photos</Text>
          </TouchableOpacity>
        </View>
      )}
      </KeyboardAvoidingView>

      {/* Photo Upload Modal - with keyboard fix */}
      <Modal
        visible={showUploadModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          clearPhotoSelection();
          setShowUploadModal(false);
        }}
      >
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => {
                clearPhotoSelection();
                setShowUploadModal(false);
              }}>
                <X size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Deliver Photos</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView 
              style={styles.modalContent} 
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.photoCountLabel}>
                {selectedPhotos.size > 0 
                  ? `${selectedPhotos.size} selected` 
                  : `Photos (${uploadingPhotos.length})`}
              </Text>
              {selectedPhotos.size === 0 && uploadingPhotos.length > 0 && (
                <Text style={styles.photoHintLabel}>Tap photos to select for deletion</Text>
              )}
              
              <View style={styles.photoGrid}>
                {uploadingPhotos.map((photo, idx) => {
                  const isSelected = selectedPhotos.has(photo);
                  return (
                    <TouchableOpacity 
                      key={idx} 
                      style={[styles.photoItem, isSelected && styles.photoItemSelected]}
                      onPress={() => togglePhotoSelection(photo)}
                      activeOpacity={0.8}
                      testID={`photo-item-${idx}`}
                    >
                      <Image 
                        source={{ uri: getImageUrl(photo) || photo }} 
                        style={[styles.photoImage, isSelected && styles.photoImageSelected]} 
                      />
                      {isSelected && (
                        <View style={styles.photoSelectOverlay}>
                          <View style={styles.photoCheckBadge}>
                            <Check size={16} color="#fff" />
                          </View>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
                
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
              <View style={{ height: 120 }} />
            </ScrollView>

            {/* Selection Footer - shows when photos selected */}
            {selectedPhotos.size > 0 ? (
              <View style={styles.selectionFooter}>
                <View style={styles.selectionInfo}>
                  <Text style={styles.selectionCountText}>{selectedPhotos.size} selected</Text>
                  <TouchableOpacity onPress={clearPhotoSelection}>
                    <Text style={styles.clearSelectionText}>Clear</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.deleteSelectedButton}
                  onPress={handleDeleteSelectedPhotos}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.deleteSelectedButtonText}>Delete</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
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
            )}
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* Themed Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalContent}>
            <View style={styles.successIconContainer}>
              <CheckCircle size={48} color="#22c55e" />
            </View>
            <Text style={styles.successModalTitle}>{successMessage.title}</Text>
            <Text style={styles.successModalMessage}>{successMessage.message}</Text>
            <TouchableOpacity 
              style={styles.successModalButton}
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={styles.successModalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Themed Error Modal */}
      <Modal
        visible={showErrorModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalContent}>
            <View style={[styles.successIconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
              <X size={48} color="#ef4444" />
            </View>
            <Text style={styles.successModalTitle}>{errorMessage.title}</Text>
            <Text style={styles.successModalMessage}>{errorMessage.message}</Text>
            <TouchableOpacity 
              style={[styles.successModalButton, { backgroundColor: '#ef4444' }]}
              onPress={() => setShowErrorModal(false)}
            >
              <Text style={styles.successModalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Themed Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalContent}>
            <Text style={styles.successModalTitle}>{confirmModalConfig.title}</Text>
            <Text style={styles.successModalMessage}>{confirmModalConfig.message}</Text>
            <View style={styles.confirmButtonRow}>
              <TouchableOpacity 
                style={styles.confirmCancelButton}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.confirmCancelButtonText}>{confirmModalConfig.cancelText}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.confirmActionButton,
                  confirmModalConfig.isDestructive && { backgroundColor: '#ef4444' }
                ]}
                onPress={confirmModalConfig.onConfirm}
              >
                <Text style={styles.confirmActionButtonText}>{confirmModalConfig.confirmText}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Fullscreen Photo Viewer */}
      <Modal
        visible={selectedPhotoIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPhotoIndex(null)}
      >
        <View style={styles.fullscreenOverlay}>
          <SafeAreaView style={styles.fullscreenContainer}>
            <View style={styles.fullscreenHeader}>
              <TouchableOpacity 
                style={styles.fullscreenCloseButton} 
                onPress={() => setSelectedPhotoIndex(null)}
              >
                <X size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.fullscreenCounter}>
                {selectedPhotoIndex !== null ? `${selectedPhotoIndex + 1} / ${deliveredPhotos.length}` : ''}
              </Text>
              <View style={{ width: 40 }} />
            </View>

            {selectedPhotoIndex !== null && deliveredPhotos.length > 0 && selectedPhotoIndex < deliveredPhotos.length && (
              <View style={styles.fullscreenImageContainer}>
                <Image 
                  source={{ uri: getImageUrl(deliveredPhotos[selectedPhotoIndex])! }} 
                  style={styles.fullscreenImage}
                  resizeMode="contain"
                />
                
                {selectedPhotoIndex > 0 && (
                  <TouchableOpacity 
                    style={[styles.navButton, styles.navButtonLeft]}
                    onPress={() => setSelectedPhotoIndex(selectedPhotoIndex - 1)}
                  >
                    <ChevronLeft size={32} color="#fff" />
                  </TouchableOpacity>
                )}
                {selectedPhotoIndex < deliveredPhotos.length - 1 && (
                  <TouchableOpacity 
                    style={[styles.navButton, styles.navButtonRight]}
                    onPress={() => setSelectedPhotoIndex(selectedPhotoIndex + 1)}
                  >
                    <ChevronRight size={32} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </SafeAreaView>
        </View>
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
  photoCountLabel: { fontSize: 14, color: '#9ca3af', marginBottom: 4 },
  photoHintLabel: { fontSize: 12, color: '#6b7280', marginBottom: 12 },
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
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  photoItemSelected: {
    borderColor: PRIMARY_COLOR,
  },
  photoImage: { width: '100%', height: '100%' },
  photoImageSelected: { opacity: 0.7 },
  photoSelectOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoCheckBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: PRIMARY_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#0a0a0a',
  },
  selectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  selectionCountText: { fontSize: 16, color: '#fff', fontWeight: '600' },
  clearSelectionText: { fontSize: 14, color: PRIMARY_COLOR },
  deleteSelectedButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#ef4444',
  },
  deleteSelectedButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
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

  // Add more photos button
  addMorePhotosButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#6366f1',
  },

  // Photo count text
  photoCountText: {
    fontSize: 13,
    color: '#9ca3af',
  },

  // Delivered photo grid
  deliveredPhotoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  deliveredPhotoThumbnail: {
    width: (SCREEN_WIDTH - 40 - 16) / 3,
    height: (SCREEN_WIDTH - 40 - 16) / 3,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  deliveredPhotoImage: {
    width: '100%',
    height: '100%',
  },
  noPhotosCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  noPhotosText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 12,
  },

  // Themed Success Modal
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successModalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  successModalMessage: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  successModalButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
  },
  successModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Confirmation Modal Buttons
  confirmButtonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  confirmCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
  },
  confirmCancelButtonText: {
    color: '#9ca3af',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmActionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#22c55e',
    alignItems: 'center',
  },
  confirmActionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Fullscreen Photo Viewer
  fullscreenOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  fullscreenContainer: {
    flex: 1,
  },
  fullscreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  fullscreenCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenCounter: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  fullscreenImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.75,
  },
  navButton: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    top: '50%',
    marginTop: -25,
  },
  navButtonLeft: {
    left: 16,
  },
  navButtonRight: {
    right: 16,
  },
});
