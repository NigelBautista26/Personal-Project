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
  Modal,
  TextInput,
  Dimensions,
  Alert,
  Share,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { Calendar, Clock, Camera, X, Star, Eye, Check, Palette, Download, ChevronLeft, ChevronRight, MessageSquare, Image as ImageIcon } from 'lucide-react-native';
import { snapnowApi, Booking } from '../../src/api/snapnowApi';
import { API_URL, apiClient } from '../../src/api/client';

const PRIMARY_COLOR = '#2563eb';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ReviewInfo {
  canReview: boolean;
  review?: { rating: number; comment?: string };
  reason?: string;
}

interface EditingRequestInfo {
  id: string;
  status: string;
  totalAmount: string;
  photoCount: number | null;
  editedPhotos: string[] | null;
  revisionCount: number | null;
  requestedPhotoUrls: string[] | null;
}

interface EditingServiceInfo {
  id: string;
  photographerId: string;
  isEnabled: boolean;
  pricingModel: 'flat' | 'per_photo';
  flatRate: string | null;
  perPhotoRate: string | null;
  turnaroundDays: number;
  description: string | null;
}

interface PhotoDelivery {
  id: string;
  bookingId: string;
  photographerId: string;
  photos: string[];
  message?: string;
  deliveredAt: string;
  downloadedAt?: string;
}

export default function CustomerBookingsScreen() {
  const queryClient = useQueryClient();
  
  const [selectedBookingPhotos, setSelectedBookingPhotos] = useState<(PhotoDelivery & { booking?: any }) | null>(null);
  const [viewingPhotoIndex, setViewingPhotoIndex] = useState(0);
  const [reviewingBookingId, setReviewingBookingId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [viewingEditedPhotos, setViewingEditedPhotos] = useState<{
    photos: string[];
    bookingId: string;
    requestId: string;
    status: string;
    requestedPhotoUrls: string[] | null;
  } | null>(null);
  const [editedPhotoIndex, setEditedPhotoIndex] = useState<number | null>(null);
  const [viewingOriginalIndex, setViewingOriginalIndex] = useState<number | null>(null);
  const [showRevisionInput, setShowRevisionInput] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['customer-bookings'],
    queryFn: () => snapnowApi.getBookings(),
  });

  const allBookings = Array.isArray(bookings) ? bookings : [];
  const completedBookingIds = allBookings.filter(b => b.status === 'completed').map(b => String(b.id));
  const photographerIds = Array.from(new Set(allBookings.filter(b => b.status === 'completed').map((b: any) => String(b.photographerId))));

  const { data: reviewInfoMap = {} } = useQuery<Record<string, ReviewInfo>>({
    queryKey: ['bookingReviewInfo', completedBookingIds],
    queryFn: async () => {
      const results: Record<string, ReviewInfo> = {};
      await Promise.all(
        completedBookingIds.map(async (bookingId) => {
          try {
            const data = await apiClient<ReviewInfo>(`/api/bookings/${bookingId}/can-review`);
            results[bookingId] = data;
          } catch (e) {
            results[bookingId] = { canReview: false, reason: "Error checking" };
          }
        })
      );
      return results;
    },
    enabled: completedBookingIds.length > 0,
  });

  const { data: editingRequestsMap = {} } = useQuery<Record<string, EditingRequestInfo | null>>({
    queryKey: ['editingRequests', completedBookingIds],
    queryFn: async () => {
      const results: Record<string, EditingRequestInfo | null> = {};
      await Promise.all(
        completedBookingIds.map(async (bookingId) => {
          try {
            const data = await apiClient<EditingRequestInfo>(`/api/editing-requests/booking/${bookingId}`);
            results[bookingId] = data;
          } catch (e) {
            results[bookingId] = null;
          }
        })
      );
      return results;
    },
    enabled: completedBookingIds.length > 0,
  });

  const { data: editingServicesMap = {} } = useQuery<Record<string, EditingServiceInfo | null>>({
    queryKey: ['editingServices', photographerIds],
    queryFn: async () => {
      const results: Record<string, EditingServiceInfo | null> = {};
      await Promise.all(
        photographerIds.map(async (photographerId) => {
          try {
            const data = await apiClient<EditingServiceInfo>(`/api/editing-services/${photographerId}`);
            results[photographerId as string] = data;
          } catch (e) {
            results[photographerId as string] = null;
          }
        })
      );
      return results;
    },
    enabled: photographerIds.length > 0,
  });

  const submitReviewMutation = useMutation({
    mutationFn: async ({ bookingId, rating, comment }: { bookingId: string; rating: number; comment: string }) => {
      return apiClient(`/api/bookings/${bookingId}/reviews`, {
        method: 'POST',
        body: { rating, comment: comment || undefined },
      });
    },
    onSuccess: () => {
      setReviewingBookingId(null);
      setReviewRating(5);
      setReviewComment('');
      queryClient.invalidateQueries({ queryKey: ['bookingReviewInfo'] });
      queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
    },
  });

  const dismissBookingMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      return apiClient(`/api/bookings/${bookingId}/dismiss`, { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
    },
  });

  const createEditingRequestMutation = useMutation({
    mutationFn: async ({ bookingId, photographerId, photoCount, customerNotes, requestedPhotoUrls }: { 
      bookingId: string; 
      photographerId: string; 
      photoCount?: number; 
      customerNotes?: string;
      requestedPhotoUrls?: string[];
    }) => {
      return apiClient('/api/editing-requests', {
        method: 'POST',
        body: { bookingId, photographerId, photoCount, customerNotes, requestedPhotoUrls },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['editingRequests'] });
      Alert.alert(
        'Request Sent!', 
        'Your editing request has been sent to the photographer. They will respond soon.',
        [{ text: 'OK', onPress: () => setSelectedBookingPhotos(null) }]
      );
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message || 'Failed to send editing request');
    },
  });

  const completeEditingMutation = useMutation({
    mutationFn: async (requestId: string) => {
      return apiClient(`/api/editing-requests/${requestId}/complete`, { method: 'PATCH' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['editingRequests'] });
      Alert.alert('Approved!', 'You have approved the edited photos.');
      setViewingEditedPhotos(null);
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message || 'Failed to approve edits');
    },
  });

  const requestRevisionMutation = useMutation({
    mutationFn: async ({ requestId, revisionNotes }: { requestId: string; revisionNotes: string }) => {
      return apiClient(`/api/editing-requests/${requestId}/request-revision`, { 
        method: 'POST',
        body: { revisionNotes },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['editingRequests'] });
      Alert.alert('Request Sent', 'Your revision request has been sent to the photographer.');
      setViewingEditedPhotos(null);
      setShowRevisionInput(false);
      setRevisionNotes('');
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message || 'Failed to request revision');
    },
  });

  const handleViewEditedPhotos = (bookingId: string, editingRequest: EditingRequestInfo) => {
    if (editingRequest?.editedPhotos && editingRequest.editedPhotos.length > 0) {
      setViewingEditedPhotos({
        photos: editingRequest.editedPhotos,
        bookingId,
        requestId: editingRequest.id,
        status: editingRequest.status,
        requestedPhotoUrls: editingRequest.requestedPhotoUrls,
      });
      setEditedPhotoIndex(null);
      setViewingOriginalIndex(null);
      setShowRevisionInput(false);
      setRevisionNotes('');
    }
  };

  const handleDownloadPhotos = async (photos: string[], startIndex: number = 0) => {
    if (photos.length === 0) return;
    
    if (photos.length === 1) {
      await Linking.openURL(getImageUrl(photos[0]));
      return;
    }
    
    if (startIndex >= photos.length) {
      Alert.alert('Complete', 'All photos have been opened. Long-press each photo in your browser to save it.');
      return;
    }
    
    Alert.alert(
      `Photo ${startIndex + 1} of ${photos.length}`,
      'Opening photo in browser. Long-press to save it, then come back for the next one.',
      [
        { text: 'Stop', style: 'cancel' },
        { 
          text: startIndex === 0 ? 'Start Downloading' : 'Next Photo', 
          onPress: async () => {
            await Linking.openURL(getImageUrl(photos[startIndex]));
            setTimeout(() => handleDownloadPhotos(photos, startIndex + 1), 1000);
          }
        },
      ]
    );
  };
  
  const hasSessionEnded = (booking: Booking) => {
    const sessionDate = new Date(booking.scheduledDate);
    const scheduledTime = booking.scheduledTime || '';
    const timeMatch = scheduledTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
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

  const upcomingBookings = allBookings.filter(b => 
    b.status === 'pending' || (b.status === 'confirmed' && !hasSessionEnded(b))
  );
  const awaitingPhotos = allBookings.filter(b => 
    (b.status === 'confirmed' && hasSessionEnded(b)) || 
    b.status === 'photos_pending' || 
    b.status === 'in_progress'
  );
  const completedBookings = allBookings.filter(b => b.status === 'completed');
  const expiredBookings = allBookings.filter(b => 
    (b.status === 'expired' || b.status === 'declined' || b.status === 'cancelled') && !(b as any).dismissed
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getImageUrl = (path?: string) => {
    if (!path) return 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200';
    if (path.startsWith('http')) return path;
    return `${API_URL}${path}`;
  };

  const getPhotographerName = (booking: Booking) => {
    return (booking as any).photographerName || 
           booking.photographer?.user?.fullName || 
           booking.photographer?.fullName || 
           'Photographer';
  };

  const getPhotographerImage = (booking: Booking) => {
    return (booking as any).photographerProfileImage || 
           booking.photographer?.profileImageUrl || 
           booking.photographer?.profilePicture;
  };

  const handleViewPhotos = async (bookingId: string, booking: any) => {
    try {
      const data = await apiClient<PhotoDelivery | null>(`/api/bookings/${bookingId}/photos`);
      if (data && data.photos && data.photos.length > 0) {
        setSelectedBookingPhotos({ ...data, booking });
        setViewingPhotoIndex(0);
      } else {
        Alert.alert('No Photos Yet', 'The photographer has not uploaded photos for this session yet.');
      }
    } catch (e) {
      console.error('Failed to load photos:', e);
      Alert.alert('Error', 'Failed to load photos. Please try again.');
    }
  };

  const renderStars = (rating: number, size: number = 12) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={size}
          color="#eab308"
          fill={i <= rating ? "#eab308" : "transparent"}
        />
      );
    }
    return stars;
  };

  const getEditingStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)', iconBg: 'rgba(34, 197, 94, 0.2)', iconColor: '#22c55e' };
      case 'delivered':
        return { bg: 'rgba(139, 92, 246, 0.1)', border: 'rgba(139, 92, 246, 0.3)', iconBg: 'rgba(139, 92, 246, 0.2)', iconColor: '#8b5cf6' };
      case 'declined':
        return { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', iconBg: 'rgba(239, 68, 68, 0.2)', iconColor: '#ef4444' };
      case 'revision_requested':
        return { bg: 'rgba(249, 115, 22, 0.1)', border: 'rgba(249, 115, 22, 0.3)', iconBg: 'rgba(249, 115, 22, 0.2)', iconColor: '#f97316' };
      default:
        return { bg: 'rgba(234, 179, 8, 0.1)', border: 'rgba(234, 179, 8, 0.3)', iconBg: 'rgba(234, 179, 8, 0.2)', iconColor: '#eab308' };
    }
  };

  const getEditingStatusText = (status: string) => {
    switch (status) {
      case 'requested': return 'Editing Requested';
      case 'accepted': return 'Editing Accepted';
      case 'in_progress': return 'Editing In Progress';
      case 'delivered': return 'Edited Photos Ready';
      case 'revision_requested': return 'Revisions In Progress';
      case 'completed': return 'Editing Complete';
      case 'declined': return 'Editing Declined';
      default: return 'Editing Status';
    }
  };

  const renderUpcomingCard = (booking: Booking) => (
    <TouchableOpacity
      key={booking.id}
      style={styles.bookingCard}
      onPress={() => router.push(`/(customer)/booking/${booking.id}`)}
      testID={`card-booking-${booking.id}`}
    >
      <Image source={{ uri: getImageUrl(getPhotographerImage(booking)) }} style={styles.avatar} />
      <View style={styles.bookingInfo}>
        <Text style={styles.photographerName}>{getPhotographerName(booking)}</Text>
        <Text style={styles.bookingDetails}>
          {formatDate(booking.scheduledDate)} · {booking.location}
        </Text>
      </View>
      <Text style={styles.bookingPrice}>£{booking.totalAmount}</Text>
    </TouchableOpacity>
  );

  const renderAwaitingPhotosCard = (booking: Booking) => (
    <View key={booking.id} style={styles.awaitingCard}>
      <View style={styles.progressBar} />
      <View style={styles.cardPadding}>
        <View style={styles.cardHeader}>
          <Image source={{ uri: getImageUrl(getPhotographerImage(booking)) }} style={[styles.avatar, styles.avatarRing]} />
          <View style={styles.bookingInfo}>
            <Text style={styles.photographerName}>{getPhotographerName(booking)}</Text>
            <Text style={styles.bookingDetails}>
              {formatDate(booking.scheduledDate)} - {booking.location}
            </Text>
          </View>
          <Text style={styles.bookingPrice}>£{parseFloat(booking.totalAmount as any).toFixed(2)}</Text>
        </View>
        
        <View style={styles.photoPreviewGrid}>
          {['#3b82f6', '#f59e0b', '#10b981', '#6366f1'].map((color, i) => (
            <View key={i} style={styles.photoPlaceholderContainer}>
              <View style={[styles.photoPlaceholder, { backgroundColor: color + '30' }]}>
                <View style={styles.photoPlaceholderOverlay} />
                <View style={styles.pulsingDot} />
              </View>
            </View>
          ))}
        </View>
        
        <View style={styles.uploadingRow}>
          <ActivityIndicator size="small" color="#3b82f6" />
          <Text style={styles.uploadingText}>Your photographer is uploading your photos...</Text>
        </View>
      </View>
    </View>
  );

  const renderCompletedCard = (booking: Booking) => {
    const bookingIdStr = String(booking.id);
    const reviewInfo = reviewInfoMap[bookingIdStr];
    const editingRequest = editingRequestsMap[bookingIdStr];
    
    return (
      <View key={booking.id} style={styles.completedCard}>
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => router.push(`/(customer)/booking/${booking.id}`)}
          testID={`card-completed-${booking.id}`}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.avatarSmallWrapper, styles.avatarPrimary]}>
              {getPhotographerImage(booking) ? (
                <Image source={{ uri: getImageUrl(getPhotographerImage(booking)) }} style={styles.avatarSmallImage} />
              ) : (
                <User size={20} color={PRIMARY_COLOR} />
              )}
            </View>
            <View style={styles.bookingInfo}>
              <Text style={styles.photographerName}>{getPhotographerName(booking)}</Text>
              <Text style={styles.bookingDetails}>
                {formatDate(booking.scheduledDate)} - {booking.location}
              </Text>
            </View>
            <Text style={styles.bookingPrice}>£{parseFloat(booking.totalAmount as any).toFixed(2)}</Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.completedActions}>
          <TouchableOpacity 
            style={styles.viewPhotosButton}
            onPress={() => handleViewPhotos(String(booking.id), booking)}
          >
            <ImageIcon size={14} color={PRIMARY_COLOR} />
            <Text style={styles.viewPhotosText}>View Photos</Text>
          </TouchableOpacity>
          
          {reviewInfo?.canReview ? (
            <TouchableOpacity 
              style={styles.leaveReviewButton}
              onPress={() => {
                setReviewingBookingId(String(booking.id));
                setReviewRating(5);
                setReviewComment('');
              }}
            >
              <Star size={14} color="#0a0a0a" />
              <Text style={styles.leaveReviewText}>Leave Review</Text>
            </TouchableOpacity>
          ) : reviewInfo?.review ? (
            <View style={styles.reviewedBadge}>
              <Check size={12} color="#22c55e" />
              <Text style={styles.reviewedText}>Reviewed</Text>
              <View style={styles.starsRow}>
                {renderStars(reviewInfo.review.rating)}
              </View>
            </View>
          ) : null}
        </View>
        
        {editingRequest && (
          <View style={[
            styles.editingStatusCard,
            { 
              backgroundColor: getEditingStatusStyle(editingRequest.status).bg,
              borderColor: getEditingStatusStyle(editingRequest.status).border
            }
          ]}>
            <View style={[
              styles.editingIconWrapper,
              { backgroundColor: getEditingStatusStyle(editingRequest.status).iconBg }
            ]}>
              <Palette size={16} color={getEditingStatusStyle(editingRequest.status).iconColor} />
            </View>
            <View style={styles.editingInfo}>
              <Text style={styles.editingTitle}>{getEditingStatusText(editingRequest.status)}</Text>
              <Text style={styles.editingAmount}>
                £{parseFloat(editingRequest.totalAmount).toFixed(2)}
                {editingRequest.status === 'revision_requested' && editingRequest.revisionCount && 
                  ` · Revision #${editingRequest.revisionCount}`}
              </Text>
            </View>
            {(editingRequest.status === 'delivered' || editingRequest.status === 'completed') && 
             editingRequest.editedPhotos && editingRequest.editedPhotos.length > 0 && (
              <TouchableOpacity 
                style={styles.viewEditedButton}
                onPress={() => handleViewEditedPhotos(String(booking.id), editingRequest)}
              >
                <ImageIcon size={12} color="#fff" />
                <Text style={styles.viewEditedText}>View Edited</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderExpiredCard = (booking: Booking) => (
    <View key={booking.id} style={styles.expiredCard}>
      <View style={styles.cardHeader}>
        <View style={[styles.avatarSmallWrapper, styles.avatarOrange]}>
          {getPhotographerImage(booking) ? (
            <Image source={{ uri: getImageUrl(getPhotographerImage(booking)) }} style={styles.avatarSmallImage} />
          ) : (
            <User size={20} color="#fb923c" />
          )}
        </View>
        <View style={styles.bookingInfo}>
          <Text style={styles.photographerName}>{getPhotographerName(booking)}</Text>
          <Text style={styles.bookingDetails}>
            {formatDate(booking.scheduledDate)} - {booking.location}
          </Text>
        </View>
        <View style={styles.expiredBadge}>
          <Text style={styles.expiredBadgeText}>expired</Text>
        </View>
      </View>
      
      <View style={styles.expiredActions}>
        <TouchableOpacity 
          style={styles.bookAgainButton}
          onPress={() => router.push(`/(customer)/photographer/${(booking as any).photographerId}`)}
        >
          <Camera size={16} color="#fff" />
          <Text style={styles.bookAgainText}>Book Again</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.dismissButton}
          onPress={() => dismissBookingMutation.mutate(String(booking.id))}
        >
          <X size={16} color="#71717a" />
        </TouchableOpacity>
      </View>
    </View>
  );

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
            {/* Upcoming Sessions */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Calendar size={16} color="#fff" />
                <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
              </View>
              {upcomingBookings.length === 0 ? (
                <View style={styles.emptySection}>
                  <Calendar size={32} color="#6b7280" style={{ marginBottom: 8 }} />
                  <Text style={styles.emptySectionText}>No upcoming bookings</Text>
                  <TouchableOpacity onPress={() => router.push('/(customer)/photographers')}>
                    <Text style={styles.findLink}>Find a photographer</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                upcomingBookings.map(renderUpcomingCard)
              )}
            </View>
            
            {/* Awaiting Photos */}
            {awaitingPhotos.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.cameraIconWrapper}>
                    <Camera size={16} color="#3b82f6" />
                    <View style={styles.pulseDot} />
                  </View>
                  <Text style={styles.sectionTitle}>Awaiting Photos</Text>
                </View>
                {awaitingPhotos.map(renderAwaitingPhotosCard)}
              </View>
            )}
            
            {/* Completed Sessions */}
            {completedBookings.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitleLarge}>Completed Sessions</Text>
                {completedBookings.map(renderCompletedCard)}
              </View>
            )}
            
            {/* Expired Requests */}
            {expiredBookings.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Clock size={16} color="#f97316" />
                  <Text style={[styles.sectionTitle, { color: '#f97316' }]}>Expired Requests</Text>
                </View>
                <Text style={styles.expiredNote}>
                  These requests expired before the photographer could respond. Your card was not charged.
                </Text>
                {expiredBookings.map(renderExpiredCard)}
              </View>
            )}
          </>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Photo Gallery Modal */}
      <Modal
        visible={!!selectedBookingPhotos}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedBookingPhotos(null)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Your Photos</Text>
            <TouchableOpacity onPress={() => setSelectedBookingPhotos(null)} style={styles.modalCloseButton}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.downloadAllContainer}>
            <TouchableOpacity 
              style={styles.downloadAllButton}
              onPress={() => handleDownloadPhotos(selectedBookingPhotos?.photos || [])}
            >
              <Download size={16} color="#fff" />
              <Text style={styles.downloadAllText}>Download All</Text>
            </TouchableOpacity>
            
            {/* Request Editing button - show if photographer offers editing and no existing request */}
            {selectedBookingPhotos?.booking && (() => {
              const photographerId = String((selectedBookingPhotos.booking as any).photographerId);
              const bookingId = String(selectedBookingPhotos.booking.id);
              const service = editingServicesMap[photographerId];
              const existingRequest = editingRequestsMap[bookingId];
              if (service?.isEnabled && !existingRequest) {
                const estimatedCost = service.pricingModel === 'flat' 
                  ? parseFloat(service.flatRate || '0')
                  : parseFloat(service.perPhotoRate || '0');
                return (
                  <TouchableOpacity 
                    style={styles.requestEditingButton}
                    onPress={() => {
                      const photoCount = service.pricingModel === 'per_photo' ? selectedBookingPhotos.photos.length : undefined;
                      const totalCost = service.pricingModel === 'flat' 
                        ? parseFloat(service.flatRate || '0')
                        : parseFloat(service.perPhotoRate || '0') * (photoCount || 1);
                      
                      Alert.alert(
                        'Request Editing',
                        `Request professional editing for £${totalCost.toFixed(2)}?\n\n${service.pricingModel === 'per_photo' ? `${photoCount} photos @ £${service.perPhotoRate}/photo` : 'Flat rate for all photos'}\n\nEstimated turnaround: ${service.turnaroundDays} days`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Request', onPress: () => {
                            createEditingRequestMutation.mutate({
                              bookingId: selectedBookingPhotos.booking.id,
                              photographerId: (selectedBookingPhotos.booking as any).photographerId,
                              photoCount,
                              requestedPhotoUrls: selectedBookingPhotos.photos,
                            });
                          }}
                        ]
                      );
                    }}
                    disabled={createEditingRequestMutation.isPending}
                  >
                    {createEditingRequestMutation.isPending ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Palette size={16} color="#fff" />
                        <Text style={styles.requestEditingText}>Request Editing</Text>
                      </>
                    )}
                  </TouchableOpacity>
                );
              }
              return null;
            })()}
          </View>
          
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
            {selectedBookingPhotos?.message && (
              <Text style={styles.modalMessage}>{selectedBookingPhotos.message}</Text>
            )}
            
            {selectedBookingPhotos && selectedBookingPhotos.photos.length > 0 && (
              <>
                <View style={styles.mainPhotoWrapper}>
                  <View style={styles.mainPhotoInner}>
                    <Image 
                      source={{ uri: getImageUrl(selectedBookingPhotos.photos[viewingPhotoIndex]) }} 
                      style={styles.mainPhoto}
                      resizeMode="contain"
                    />
                    {selectedBookingPhotos.photos.length > 1 && (
                      <>
                        <TouchableOpacity 
                          style={[styles.navArrow, styles.navArrowLeft]}
                          onPress={() => setViewingPhotoIndex(i => i > 0 ? i - 1 : selectedBookingPhotos.photos.length - 1)}
                        >
                          <ChevronLeft size={24} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.navArrow, styles.navArrowRight]}
                          onPress={() => setViewingPhotoIndex(i => i < selectedBookingPhotos.photos.length - 1 ? i + 1 : 0)}
                        >
                          <ChevronRight size={24} color="#fff" />
                        </TouchableOpacity>
                      </>
                    )}
                    <View style={styles.photoCounter}>
                      <Text style={styles.photoCounterText}>
                        {viewingPhotoIndex + 1} / {selectedBookingPhotos.photos.length}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.thumbnailSection}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
                    {selectedBookingPhotos.photos.map((photo, idx) => (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => setViewingPhotoIndex(idx)}
                        style={[
                          styles.thumbnail,
                          idx === viewingPhotoIndex && styles.thumbnailActive
                        ]}
                      >
                        <Image source={{ uri: getImageUrl(photo) }} style={styles.thumbnailImage} />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Compare Photos Modal (Edited Photos) */}
      <Modal
        visible={!!viewingEditedPhotos}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setViewingEditedPhotos(null);
          setShowRevisionInput(false);
          setRevisionNotes('');
          setViewingOriginalIndex(null);
          setEditedPhotoIndex(null);
        }}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleRow}>
              <ImageIcon size={20} color="#8b5cf6" />
              <Text style={styles.modalTitle}>Compare Photos</Text>
              {viewingEditedPhotos?.status === 'delivered' && (
                <View style={[styles.statusBadge, { backgroundColor: 'rgba(234, 179, 8, 0.2)' }]}>
                  <Text style={[styles.statusBadgeText, { color: '#eab308' }]}>Review</Text>
                </View>
              )}
              {viewingEditedPhotos?.status === 'completed' && (
                <View style={[styles.statusBadge, { backgroundColor: 'rgba(34, 197, 94, 0.2)' }]}>
                  <Text style={[styles.statusBadgeText, { color: '#22c55e' }]}>Approved</Text>
                </View>
              )}
            </View>
            <TouchableOpacity 
              onPress={() => {
                setViewingEditedPhotos(null);
                setShowRevisionInput(false);
                setRevisionNotes('');
                setViewingOriginalIndex(null);
                setEditedPhotoIndex(null);
              }} 
              style={styles.modalCloseButton}
            >
              <X size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Download All Button */}
          <View style={styles.downloadAllContainer}>
            <TouchableOpacity 
              style={[styles.downloadAllButton, { backgroundColor: '#8b5cf6' }]}
              onPress={() => handleDownloadPhotos(viewingEditedPhotos?.photos || [])}
            >
              <Download size={16} color="#fff" />
              <Text style={styles.downloadAllText}>Download All Photos</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {/* Original Photos Section */}
            <View style={styles.compareSection}>
              <View style={styles.compareSectionHeader}>
                <View style={[styles.compareDot, { backgroundColor: '#71717a' }]} />
                <Text style={[styles.compareSectionTitle, { color: '#a1a1aa' }]}>Original Photos</Text>
                {viewingEditedPhotos?.requestedPhotoUrls && viewingEditedPhotos.requestedPhotoUrls.length > 0 ? (
                  <Text style={styles.compareCount}>({viewingEditedPhotos.requestedPhotoUrls.length})</Text>
                ) : (
                  <Text style={styles.compareCount}>(not available)</Text>
                )}
              </View>
              
              {viewingEditedPhotos?.requestedPhotoUrls && viewingEditedPhotos.requestedPhotoUrls.length > 0 ? (
                viewingOriginalIndex !== null ? (
                  <View style={styles.compareMainPhotoContainer}>
                    <Image
                      source={{ uri: getImageUrl(viewingEditedPhotos.requestedPhotoUrls[viewingOriginalIndex]) }}
                      style={styles.compareMainPhoto}
                      resizeMode="contain"
                    />
                    {viewingEditedPhotos.requestedPhotoUrls.length > 1 && (
                      <>
                        <TouchableOpacity
                          style={[styles.navArrow, styles.navArrowLeft]}
                          onPress={() => setViewingOriginalIndex(i => i !== null && i > 0 ? i - 1 : (viewingEditedPhotos.requestedPhotoUrls?.length || 1) - 1)}
                        >
                          <ChevronLeft size={20} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.navArrow, styles.navArrowRight]}
                          onPress={() => setViewingOriginalIndex(i => i !== null && i < (viewingEditedPhotos.requestedPhotoUrls?.length || 1) - 1 ? i + 1 : 0)}
                        >
                          <ChevronRight size={20} color="#fff" />
                        </TouchableOpacity>
                      </>
                    )}
                    <TouchableOpacity
                      style={styles.allButton}
                      onPress={() => setViewingOriginalIndex(null)}
                    >
                      <Text style={styles.allButtonText}>All</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.compareThumbnailRow}>
                    {viewingEditedPhotos.requestedPhotoUrls.map((url, idx) => (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => setViewingOriginalIndex(idx)}
                        style={[styles.compareThumbnail, { borderColor: '#52525b' }]}
                      >
                        <View style={[styles.compareThumbnailNumber, { backgroundColor: '#52525b' }]}>
                          <Text style={styles.compareThumbnailNumberText}>{idx + 1}</Text>
                        </View>
                        <Image source={{ uri: getImageUrl(url) }} style={styles.compareThumbnailImage} />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )
              ) : (
                <View style={styles.notAvailableBox}>
                  <Text style={styles.notAvailableText}>Original photos not saved for older requests</Text>
                </View>
              )}
            </View>

            {/* VS Divider */}
            {viewingEditedPhotos?.requestedPhotoUrls && viewingEditedPhotos.requestedPhotoUrls.length > 0 && (
              <View style={styles.vsDivider}>
                <View style={styles.vsLine} />
                <Text style={styles.vsText}>vs</Text>
                <View style={styles.vsLine} />
              </View>
            )}

            {/* Edited Photos Section */}
            <View style={styles.compareSection}>
              <View style={styles.compareSectionHeader}>
                <View style={[styles.compareDot, { backgroundColor: '#8b5cf6' }]} />
                <Text style={[styles.compareSectionTitle, { color: '#a78bfa' }]}>Edited Photos</Text>
                <Text style={[styles.compareCount, { color: '#7c3aed' }]}>({viewingEditedPhotos?.photos.length || 0})</Text>
              </View>
              
              {editedPhotoIndex !== null && viewingEditedPhotos ? (
                <View style={[styles.compareMainPhotoContainer, { borderColor: '#8b5cf6' }]}>
                  <Image
                    source={{ uri: getImageUrl(viewingEditedPhotos.photos[editedPhotoIndex]) }}
                    style={styles.compareMainPhoto}
                    resizeMode="contain"
                  />
                  {viewingEditedPhotos.photos.length > 1 && (
                    <>
                      <TouchableOpacity
                        style={[styles.navArrow, styles.navArrowLeft]}
                        onPress={() => setEditedPhotoIndex(i => i !== null && i > 0 ? i - 1 : viewingEditedPhotos.photos.length - 1)}
                      >
                        <ChevronLeft size={20} color="#fff" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.navArrow, styles.navArrowRight]}
                        onPress={() => setEditedPhotoIndex(i => i !== null && i < viewingEditedPhotos.photos.length - 1 ? i + 1 : 0)}
                      >
                        <ChevronRight size={20} color="#fff" />
                      </TouchableOpacity>
                    </>
                  )}
                  <TouchableOpacity
                    style={styles.allButton}
                    onPress={() => setEditedPhotoIndex(null)}
                  >
                    <Text style={styles.allButtonText}>All</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.compareThumbnailRow}>
                  {viewingEditedPhotos?.photos.map((photo, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setEditedPhotoIndex(index)}
                      style={[styles.compareThumbnail, { borderColor: 'rgba(139, 92, 246, 0.5)' }]}
                    >
                      <View style={[styles.compareThumbnailNumber, { backgroundColor: '#7c3aed' }]}>
                        <Text style={styles.compareThumbnailNumberText}>{index + 1}</Text>
                      </View>
                      <Image source={{ uri: getImageUrl(photo) }} style={styles.compareThumbnailImage} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
            
            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Approval Actions - Only show for 'delivered' status */}
          {viewingEditedPhotos?.status === 'delivered' && !showRevisionInput && (
            <View style={styles.approvalActions}>
              <Text style={styles.approvalPrompt}>Happy with these edits?</Text>
              <View style={styles.approvalButtons}>
                <TouchableOpacity
                  style={styles.changesButton}
                  onPress={() => setShowRevisionInput(true)}
                >
                  <MessageSquare size={14} color="#f97316" />
                  <Text style={styles.changesButtonText}>Changes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.approveButton}
                  onPress={() => {
                    if (viewingEditedPhotos?.requestId) {
                      completeEditingMutation.mutate(viewingEditedPhotos.requestId);
                    }
                  }}
                  disabled={completeEditingMutation.isPending}
                >
                  {completeEditingMutation.isPending ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Check size={14} color="#fff" />
                      <Text style={styles.approveButtonText}>Approve</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Revision Input */}
          {showRevisionInput && viewingEditedPhotos?.requestId && (
            <View style={styles.revisionInputSection}>
              <Text style={styles.revisionPrompt}>What changes would you like?</Text>
              <TextInput
                style={styles.revisionInput}
                value={revisionNotes}
                onChangeText={setRevisionNotes}
                placeholder="Describe the changes..."
                placeholderTextColor="#52525b"
                multiline
                numberOfLines={2}
              />
              {!revisionNotes.trim() && (
                <Text style={styles.revisionHint}>Please describe the changes you need</Text>
              )}
              <View style={styles.revisionButtons}>
                <TouchableOpacity
                  style={styles.revisionCancelButton}
                  onPress={() => {
                    setShowRevisionInput(false);
                    setRevisionNotes('');
                  }}
                >
                  <Text style={styles.revisionCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.revisionSubmitButton,
                    !revisionNotes.trim() && styles.revisionSubmitDisabled
                  ]}
                  onPress={() => {
                    if (viewingEditedPhotos?.requestId && revisionNotes.trim()) {
                      requestRevisionMutation.mutate({
                        requestId: viewingEditedPhotos.requestId,
                        revisionNotes: revisionNotes.trim(),
                      });
                    }
                  }}
                  disabled={!revisionNotes.trim() || requestRevisionMutation.isPending}
                >
                  {requestRevisionMutation.isPending ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.revisionSubmitText}>Send Request</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </SafeAreaView>
      </Modal>

      {/* Review Modal */}
      <Modal
        visible={!!reviewingBookingId}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setReviewingBookingId(null)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleRow}>
              <Star size={20} color="#eab308" />
              <Text style={styles.modalTitle}>Rate Your Experience</Text>
            </View>
            <TouchableOpacity onPress={() => setReviewingBookingId(null)} style={styles.modalCloseButton}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.reviewContent}>
            <Text style={styles.reviewPrompt}>How was your photo session?</Text>
            
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setReviewRating(star)}
                  style={styles.starButton}
                >
                  <Star
                    size={40}
                    color={star <= reviewRating ? "#eab308" : "#3f3f46"}
                    fill={star <= reviewRating ? "#eab308" : "transparent"}
                  />
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.ratingLabel}>
              {reviewRating === 1 && "Poor"}
              {reviewRating === 2 && "Fair"}
              {reviewRating === 3 && "Good"}
              {reviewRating === 4 && "Great"}
              {reviewRating === 5 && "Excellent"}
            </Text>
            
            <View style={styles.commentSection}>
              <View style={styles.commentLabelRow}>
                <MessageSquare size={16} color="#6b7280" />
                <Text style={styles.commentLabel}>Share your experience (optional)</Text>
              </View>
              <TextInput
                style={styles.commentInput}
                value={reviewComment}
                onChangeText={setReviewComment}
                placeholder="Tell others about your experience with this photographer..."
                placeholderTextColor="#52525b"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
            
            <View style={styles.reviewButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setReviewingBookingId(null)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.submitReviewButton}
                onPress={() => {
                  if (reviewingBookingId) {
                    submitReviewMutation.mutate({
                      bookingId: reviewingBookingId,
                      rating: reviewRating,
                      comment: reviewComment,
                    });
                  }
                }}
                disabled={submitReviewMutation.isPending}
              >
                {submitReviewMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Star size={16} color="#fff" />
                    <Text style={styles.submitReviewText}>Submit Review</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Edited Photos Modal */}
      <Modal
        visible={!!viewingEditedPhotos}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setViewingEditedPhotos(null)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleRow}>
              <Palette size={20} color="#8b5cf6" />
              <Text style={styles.modalTitle}>Edited Photos</Text>
              {viewingEditedPhotos?.status === 'delivered' && (
                <View style={styles.reviewBadge}>
                  <Text style={styles.reviewBadgeText}>Review</Text>
                </View>
              )}
              {viewingEditedPhotos?.status === 'completed' && (
                <View style={styles.approvedBadge}>
                  <Text style={styles.approvedBadgeText}>Approved</Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={() => setViewingEditedPhotos(null)} style={styles.modalCloseButton}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.downloadAllContainer}>
            <TouchableOpacity 
              style={[styles.downloadAllButton, { backgroundColor: '#8b5cf6' }]}
              onPress={() => handleDownloadPhotos(viewingEditedPhotos?.photos || [])}
            >
              <Download size={16} color="#fff" />
              <Text style={styles.downloadAllText}>Download All Photos</Text>
            </TouchableOpacity>
          </View>
          
          {viewingEditedPhotos && viewingEditedPhotos.photos.length > 0 && (
            <>
              <View style={styles.mainPhotoContainer}>
                <Image 
                  source={{ uri: viewingEditedPhotos.photos[editedPhotoIndex] }} 
                  style={styles.mainPhoto}
                  resizeMode="contain"
                />
                {viewingEditedPhotos.photos.length > 1 && (
                  <>
                    <TouchableOpacity 
                      style={[styles.navArrow, styles.navArrowLeft]}
                      onPress={() => setEditedPhotoIndex(i => i > 0 ? i - 1 : viewingEditedPhotos.photos.length - 1)}
                    >
                      <ChevronLeft size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.navArrow, styles.navArrowRight]}
                      onPress={() => setEditedPhotoIndex(i => i < viewingEditedPhotos.photos.length - 1 ? i + 1 : 0)}
                    >
                      <ChevronRight size={24} color="#fff" />
                    </TouchableOpacity>
                  </>
                )}
                <View style={styles.photoCounter}>
                  <Text style={styles.photoCounterText}>
                    {editedPhotoIndex + 1} / {viewingEditedPhotos.photos.length}
                  </Text>
                </View>
              </View>
              
              <ScrollView horizontal style={styles.thumbnailContainer} showsHorizontalScrollIndicator={false}>
                {viewingEditedPhotos.photos.map((photo, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setEditedPhotoIndex(idx)}
                    style={[
                      styles.thumbnail,
                      idx === editedPhotoIndex && styles.thumbnailActiveEdited
                    ]}
                  >
                    <Image source={{ uri: photo }} style={styles.thumbnailImage} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
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
  section: { marginTop: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#fff' },
  sectionTitleLarge: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 16 },
  emptySection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
  },
  emptySectionText: { color: '#6b7280', fontSize: 14, marginBottom: 4 },
  findLink: { color: PRIMARY_COLOR, fontSize: 14, fontWeight: '500' },
  
  bookingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 8,
  },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#1a1a1a', marginRight: 12 },
  avatarSmall: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1a1a1a', marginRight: 12 },
  avatarSmallWrapper: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    marginRight: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarSmallImage: { width: 40, height: 40 },
  avatarRing: { borderWidth: 2, borderColor: 'rgba(59, 130, 246, 0.3)' },
  avatarPrimary: { backgroundColor: 'rgba(37, 99, 235, 0.2)' },
  avatarGray: { opacity: 0.6 },
  bookingInfo: { flex: 1, gap: 2 },
  photographerName: { fontSize: 15, fontWeight: '600', color: '#fff' },
  bookingDetails: { fontSize: 13, color: '#6b7280' },
  bookingPrice: { fontSize: 15, fontWeight: '700', color: '#fff' },
  
  awaitingCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: { height: 3, backgroundColor: '#3b82f6' },
  cardPadding: { padding: 14 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardContent: {},
  photoPreviewGrid: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  photoPlaceholderContainer: { flex: 1 },
  photoPlaceholder: { height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  photoPlaceholderOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 8 },
  pulsingDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)' },
  uploadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  uploadingText: { fontSize: 13, color: '#3b82f6' },
  
  completedCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    marginBottom: 12,
  },
  completedActions: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8 },
  viewPhotosButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    backgroundColor: 'transparent',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.5)',
  },
  viewPhotosText: { color: PRIMARY_COLOR, fontSize: 14, fontWeight: '500' },
  reviewedBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  reviewedText: { color: '#4ade80', fontSize: 14, fontWeight: '500' },
  starsRow: { flexDirection: 'row', marginLeft: 4 },
  leaveReviewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    backgroundColor: '#f59e0b',
    borderRadius: 8,
  },
  leaveReviewText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  
  editingStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  editingIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  editingInfo: { flex: 1 },
  editingTitle: { fontSize: 14, fontWeight: '600', color: '#fff' },
  editingAmount: { fontSize: 12, color: '#9ca3af' },
  viewEditedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#8b5cf6',
    borderRadius: 6,
  },
  viewEditedText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  
  expiredCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    marginBottom: 8,
  },
  avatarOrange: {
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
  },
  expiredBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
    borderRadius: 12,
  },
  expiredBadgeText: { color: '#fb923c', fontSize: 11, fontWeight: '500' },
  expiredActions: { flexDirection: 'row', marginTop: 12, paddingTop: 8, gap: 8 },
  bookAgainButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    backgroundColor: 'transparent',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  bookAgainText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  dismissButton: { 
    paddingHorizontal: 10, 
    paddingVertical: 8,
    backgroundColor: 'transparent',
    borderRadius: 8,
  },
  expiredNote: { fontSize: 12, color: '#6b7280', marginBottom: 12, lineHeight: 18 },
  
  cameraIconWrapper: { position: 'relative' },
  pulseDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3b82f6',
  },
  
  modalContainer: { flex: 1, backgroundColor: '#0a0a0a' },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  modalCloseButton: { padding: 8 },
  modalMessage: { color: '#9ca3af', fontSize: 14, paddingHorizontal: 16, paddingVertical: 12 },
  
  mainPhotoWrapper: { 
    paddingHorizontal: 16, 
    paddingTop: 16,
  },
  mainPhotoInner: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#18181b',
  },
  mainPhotoContainer: { justifyContent: 'center', alignItems: 'center', position: 'relative' },
  mainPhoto: { width: SCREEN_WIDTH - 32, height: SCREEN_WIDTH - 32, borderRadius: 12 },
  thumbnailSection: {
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    marginTop: 16,
  },
  navArrow: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navArrowLeft: { left: 16 },
  navArrowRight: { right: 16 },
  photoCounter: {
    position: 'absolute',
    bottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
  photoCounterText: { color: '#fff', fontSize: 14 },
  
  thumbnailContainer: { padding: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  thumbnailActive: { borderColor: PRIMARY_COLOR },
  thumbnailActiveEdited: { borderColor: '#8b5cf6' },
  thumbnailImage: { width: '100%', height: '100%' },
  
  downloadAllContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  downloadAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 10,
  },
  downloadAllText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  
  requestEditingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: '#8b5cf6',
    borderRadius: 10,
    marginTop: 8,
  },
  requestEditingText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  
  reviewBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
    borderRadius: 10,
  },
  reviewBadgeText: { color: '#eab308', fontSize: 11, fontWeight: '500' },
  approvedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderRadius: 10,
  },
  approvedBadgeText: { color: '#22c55e', fontSize: 11, fontWeight: '500' },
  
  reviewContent: { flex: 1, padding: 24 },
  reviewPrompt: { color: '#9ca3af', fontSize: 14, textAlign: 'center', marginBottom: 16 },
  starsContainer: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8 },
  starButton: { padding: 4 },
  ratingLabel: { color: '#eab308', fontSize: 16, fontWeight: '600', textAlign: 'center', marginBottom: 24 },
  commentSection: { marginBottom: 24 },
  commentLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  commentLabel: { color: '#9ca3af', fontSize: 14 },
  commentInput: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 14,
    minHeight: 100,
  },
  reviewButtons: { flexDirection: 'row', gap: 12 },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cancelButtonText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  submitReviewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: '#eab308',
    borderRadius: 12,
  },
  submitReviewText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusBadgeText: { fontSize: 11, fontWeight: '500' },
  
  compareSection: {
    padding: 12,
  },
  compareSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  compareDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  compareSectionTitle: { fontSize: 12, fontWeight: '600' },
  compareCount: { fontSize: 12, color: '#52525b' },
  
  compareMainPhotoContainer: {
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: '#52525b',
    position: 'relative',
  },
  compareMainPhoto: {
    width: '100%',
    height: '100%',
  },
  allButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 4,
  },
  allButtonText: { color: '#fff', fontSize: 12 },
  
  compareThumbnailRow: {
    flexDirection: 'row',
    paddingBottom: 4,
  },
  compareThumbnail: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 6,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  compareThumbnailNumber: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  compareThumbnailNumberText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  compareThumbnailImage: { width: '100%', height: '100%' },
  
  notAvailableBox: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(63, 63, 70, 0.3)',
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  notAvailableText: { color: '#52525b', fontSize: 12, textAlign: 'center' },
  
  vsDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  vsLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  vsText: { color: '#52525b', fontSize: 10 },
  
  approvalActions: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  approvalPrompt: { color: '#9ca3af', fontSize: 12, textAlign: 'center', marginBottom: 8 },
  approvalButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  changesButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.5)',
    backgroundColor: 'transparent',
  },
  changesButtonText: { color: '#f97316', fontSize: 12, fontWeight: '500' },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#16a34a',
  },
  approveButtonText: { color: '#fff', fontSize: 12, fontWeight: '500' },
  
  revisionInputSection: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(249, 115, 22, 0.05)',
  },
  revisionPrompt: { color: '#fff', fontSize: 12, fontWeight: '500', marginBottom: 8 },
  revisionInput: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.3)',
    borderRadius: 8,
    padding: 10,
    color: '#fff',
    fontSize: 14,
    minHeight: 60,
  },
  revisionHint: { color: 'rgba(249, 115, 22, 0.7)', fontSize: 10, marginTop: 4, marginBottom: 8 },
  revisionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  revisionCancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3f3f46',
    backgroundColor: 'transparent',
  },
  revisionCancelText: { color: '#fff', fontSize: 12 },
  revisionSubmitButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f97316',
  },
  revisionSubmitDisabled: {
    backgroundColor: 'rgba(249, 115, 22, 0.3)',
  },
  revisionSubmitText: { color: '#fff', fontSize: 12, fontWeight: '500' },
});
