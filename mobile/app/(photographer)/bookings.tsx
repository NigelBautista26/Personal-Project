import React, { useState, useMemo } from 'react';
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
  Palette,
  RefreshCw,
} from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { snapnowApi, EditingRequest } from '../../src/api/snapnowApi';
import { API_URL } from '../../src/api/client';

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

  const { data: editingRequests = [] } = useQuery({
    queryKey: ['photographer-editing-requests', photographerProfile?.id],
    queryFn: () => snapnowApi.getPhotographerEditingRequests(photographerProfile!.id.toString()),
    enabled: !!photographerProfile?.id,
  });

  const bookingsArray = Array.isArray(bookings) ? bookings : [];
  const editingRequestsArray = Array.isArray(editingRequests) ? editingRequests : [];

  const { pendingEditingRequests, activeEditingRequests, revisionRequests, awaitingApprovalRequests, approvedEditingRequests } = useMemo(() => ({
    pendingEditingRequests: editingRequestsArray.filter((r: EditingRequest) => r.status === 'requested'),
    activeEditingRequests: editingRequestsArray.filter((r: EditingRequest) => 
      r.status === 'accepted' || r.status === 'in_progress'
    ),
    revisionRequests: editingRequestsArray.filter((r: EditingRequest) => r.status === 'revision_requested'),
    awaitingApprovalRequests: editingRequestsArray.filter((r: EditingRequest) => r.status === 'delivered'),
    approvedEditingRequests: editingRequestsArray.filter((r: EditingRequest) => r.status === 'completed'),
  }), [editingRequestsArray]);

  const getSessionEndTime = (booking: any) => {
    const sessionDate = new Date(booking.scheduledDate);
    const timeParts = (booking.scheduledTime || '12:00').replace(/[AP]M/i, '').trim().split(':');
    const hours = parseInt(timeParts[0]) || 12;
    const minutes = parseInt(timeParts[1]) || 0;
    const isPM = (booking.scheduledTime || '').toLowerCase().includes('pm');
    sessionDate.setHours(isPM && hours !== 12 ? hours + 12 : hours === 12 && !isPM ? 0 : hours, minutes);
    sessionDate.setHours(sessionDate.getHours() + (booking.duration || 1));
    return sessionDate;
  };

  const now = new Date();
  const pendingBookings = bookingsArray.filter(b => b.status === 'pending');
  const upcomingBookings = bookingsArray.filter(b => {
    if (b.status !== 'confirmed') return false;
    const sessionEnd = getSessionEndTime(b);
    return sessionEnd >= now;
  });
  const readyForPhotos = bookingsArray.filter(b => {
    if (b.status !== 'confirmed') return false;
    const sessionEnd = getSessionEndTime(b);
    return sessionEnd < now;
  });
  const completedBookings = bookingsArray.filter(b => b.status === 'completed');
  const declinedBookings = bookingsArray.filter(b => 
    (b.status === 'declined' || b.status === 'cancelled') && !b.dismissedAt
  );

  const updateBookingMutation = useMutation({
    mutationFn: ({ bookingId, status }: { bookingId: number; status: string }) => 
      snapnowApi.updateBookingStatus(bookingId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photographer-bookings'] });
    },
  });

  const dismissMutation = useMutation({
    mutationFn: (bookingId: string) => snapnowApi.dismissBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photographer-bookings'] });
    },
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' });
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
    color?: string,
    description?: string
  ) => (
    <View style={styles.sectionHeaderContainer}>
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
      {description && <Text style={styles.sectionDescription}>{description}</Text>}
    </View>
  );

  const renderBookingCard = (
    booking: any, 
    options: { 
      showActions?: boolean; 
      showUploadButton?: boolean;
      showEarnings?: boolean;
      showManagePhotos?: boolean;
    } = {}
  ) => (
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
          <View style={styles.customerDetails}>
            <Text style={styles.customerName}>
              {booking.customer?.fullName || 'Customer'}
            </Text>
            <Text style={styles.bookingMeta}>
              {formatDate(booking.scheduledDate)}
            </Text>
            <Text style={styles.bookingLocation}>{booking.location}</Text>
          </View>
        </View>
        {options.showEarnings !== false && (
          <View style={styles.earningsContainer}>
            <Text style={styles.earnings}>£{parseFloat(booking.photographerEarnings || 0).toFixed(2)}</Text>
            <Text style={styles.earningsLabel}>earnings</Text>
          </View>
        )}
      </View>

      {options.showUploadButton && (
        <TouchableOpacity 
          style={styles.uploadButton}
          onPress={() => router.push(`/(photographer)/booking/${booking.id}`)}
        >
          <Upload size={18} color="#fff" />
          <Text style={styles.uploadButtonText}>Upload Photos Now</Text>
        </TouchableOpacity>
      )}

      {options.showActions && (
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

      {options.showManagePhotos && (
        <TouchableOpacity 
          style={styles.managePhotosButton}
          onPress={() => router.push(`/(photographer)/booking/${booking.id}`)}
        >
          <Upload size={16} color="#2563eb" />
          <Text style={styles.managePhotosButtonText}>Manage Photos</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const renderEditingRequestCard = (
    request: EditingRequest, 
    borderColor: string = 'rgba(255,255,255,0.1)',
    options: { showRevisionUpload?: boolean; isAwaitingApproval?: boolean; isApproved?: boolean } = {}
  ) => {
    const isDelivered = options.isAwaitingApproval || options.isApproved;
    const photosToShow = isDelivered && request.editedPhotoUrls?.length 
      ? request.editedPhotoUrls 
      : request.requestedPhotoUrls;
    const photosLabel = isDelivered ? 'Your delivered edits' : 'Photos to edit';

    return (
      <View
        key={request.id}
        style={[styles.bookingCard, { borderColor }]}
        testID={`card-editing-${request.id}`}
      >
        <View style={styles.bookingHeader}>
          <View style={styles.customerInfo}>
            <View style={[styles.customerAvatar, { backgroundColor: 'rgba(139, 92, 246, 0.2)' }]}>
              {request.booking?.customer?.profileImageUrl ? (
                <Image 
                  source={{ uri: getImageUrl(request.booking.customer.profileImageUrl)! }} 
                  style={styles.customerAvatarImage} 
                />
              ) : (
                <Palette size={20} color="#8b5cf6" />
              )}
            </View>
            <View style={styles.customerDetails}>
              <View style={styles.customerNameRow}>
                <Text style={styles.customerName}>
                  {request.booking?.customer?.fullName || 'Customer'}
                </Text>
                {options.isAwaitingApproval && (
                  <View style={styles.awaitingBadge}>
                    <Text style={styles.awaitingBadgeText}>Awaiting Approval</Text>
                  </View>
                )}
              </View>
              <Text style={styles.bookingMeta}>
                {request.photoCount} photo{request.photoCount && request.photoCount > 1 ? 's' : ''}{isDelivered ? ' edited' : ''}
                {request.revisionCount && !isDelivered ? ` • Revision #${request.revisionCount + 1}` : ''}
              </Text>
              {options.isAwaitingApproval && (
                <Text style={styles.paymentNote}>Payment on approval</Text>
              )}
              {!isDelivered && request.booking?.scheduledDate && (
                <Text style={styles.bookingLocation}>
                  Session: {formatDate(request.booking.scheduledDate)}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.earningsContainer}>
            <Text style={[styles.earnings, { color: options.isApproved ? '#22c55e' : '#38bdf8' }]}>
              £{parseFloat(request.photographerEarnings || '0').toFixed(2)}
            </Text>
            <Text style={styles.earningsLabel}>{options.isApproved ? 'earned' : 'earnings'}</Text>
          </View>
        </View>

        {!isDelivered && request.customerNotes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Customer notes:</Text>
            <Text style={styles.notesText}>{request.customerNotes}</Text>
          </View>
        )}

        {photosToShow && photosToShow.length > 0 && (
          <View style={styles.photosPreview}>
            <View style={styles.photosLabel}>
              <Text style={styles.photosLabelText}>
                📷 {photosLabel} ({photosToShow.length})
              </Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosList}>
              {photosToShow.slice(0, 4).map((url, idx) => (
                <Image 
                  key={idx}
                  source={{ uri: getImageUrl(url)! }}
                  style={styles.photoThumb}
                />
              ))}
              {photosToShow.length > 4 && (
                <View style={styles.morePhotos}>
                  <Text style={styles.morePhotosText}>+{photosToShow.length - 4}</Text>
                </View>
              )}
            </ScrollView>
          </View>
        )}

        {options.showRevisionUpload && (
          <TouchableOpacity 
            style={[styles.uploadButton, { backgroundColor: '#f97316' }]}
            onPress={() => router.push(`/(photographer)/booking/${request.bookingId}`)}
          >
            <RefreshCw size={18} color="#fff" />
            <Text style={styles.uploadButtonText}>Upload Revised Photos</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

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
              <Calendar size={40} color="#6b7280" />
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
            {pendingBookings.map(booking => renderBookingCard(booking, { showActions: true }))}
          </View>
        )}

        {/* Pending Editing Requests */}
        {pendingEditingRequests.length > 0 && (
          <View style={styles.section}>
            {renderSectionHeader(
              <Palette size={20} color="#8b5cf6" />,
              'Editing Requests',
              pendingEditingRequests.length,
              undefined,
              '#8b5cf6'
            )}
            {pendingEditingRequests.map(request => renderEditingRequestCard(request, 'rgba(139, 92, 246, 0.3)'))}
          </View>
        )}

        {/* Active Editing (In Progress) */}
        {activeEditingRequests.length > 0 && (
          <View style={styles.section}>
            {renderSectionHeader(
              <Palette size={20} color="#3b82f6" />,
              'Editing In Progress',
              activeEditingRequests.length,
              undefined,
              '#3b82f6'
            )}
            {activeEditingRequests.map(request => renderEditingRequestCard(request, 'rgba(59, 130, 246, 0.3)'))}
          </View>
        )}

        {/* Revisions Requested */}
        {revisionRequests.length > 0 && (
          <View style={styles.section}>
            {renderSectionHeader(
              <RefreshCw size={20} color="#f97316" />,
              'Revisions Requested',
              revisionRequests.length,
              undefined,
              '#f97316',
              'Customer has requested changes to these edits.'
            )}
            {revisionRequests.map(request => renderEditingRequestCard(request, 'rgba(249, 115, 22, 0.3)', { showRevisionUpload: true }))}
          </View>
        )}

        {/* Ready for Photos */}
        {readyForPhotos.length > 0 && (
          <View style={styles.section}>
            {renderSectionHeader(
              <Upload size={20} color="#2563eb" />,
              'Ready for Photos',
              readyForPhotos.length,
              undefined,
              '#2563eb',
              'These sessions are complete. Upload photos to finalize and get paid.'
            )}
            {readyForPhotos.map(booking => renderBookingCard(booking, { showUploadButton: true }))}
          </View>
        )}

        {/* Awaiting Customer Approval */}
        {awaitingApprovalRequests.length > 0 && (
          <View style={styles.section}>
            {renderSectionHeader(
              <Clock size={20} color="#0f766e" />,
              'Awaiting Customer Approval',
              awaitingApprovalRequests.length,
              undefined,
              '#0f766e',
              'These edits have been delivered and are waiting for customer to approve.'
            )}
            {awaitingApprovalRequests.map(request => renderEditingRequestCard(request, 'rgba(13, 148, 136, 0.35)', { isAwaitingApproval: true }))}
          </View>
        )}

        {/* Approved Edits */}
        {approvedEditingRequests.length > 0 && (
          <View style={styles.section}>
            {renderSectionHeader(
              <Check size={20} color="#22c55e" />,
              'Approved Edits',
              approvedEditingRequests.length,
              'approvedEdits',
              '#22c55e'
            )}
            {!collapsedSections.approvedEdits && (
              approvedEditingRequests.map(request => renderEditingRequestCard(request, 'rgba(34, 197, 94, 0.3)', { isApproved: true }))
            )}
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
              completedBookings.map(booking => renderBookingCard(booking, { showManagePhotos: true }))
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
              declinedBookings.map(booking => (
                <View key={booking.id} style={styles.declinedBookingWrapper}>
                  {renderBookingCard(booking)}
                  <TouchableOpacity
                    style={styles.dismissButton}
                    onPress={() => dismissMutation.mutate(String(booking.id))}
                    disabled={dismissMutation.isPending}
                  >
                    <X size={16} color="#71717a" />
                    <Text style={styles.dismissButtonText}>Dismiss</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {/* Empty State */}
        {bookingsArray.length === 0 && editingRequestsArray.length === 0 && (
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
  
  header: { padding: 20, paddingTop: 12, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: '700', color: '#fff' },
  subtitle: { fontSize: 14, color: '#9ca3af', marginTop: 4 },

  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionHeaderContainer: { marginBottom: 12 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  sectionDescription: { fontSize: 13, color: '#9ca3af', marginTop: 4 },

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
  customerInfo: { flexDirection: 'row', alignItems: 'flex-start', flex: 1 },
  customerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  customerAvatarImage: { width: 48, height: 48, borderRadius: 24 },
  customerDetails: { flex: 1 },
  customerNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  customerName: { fontSize: 16, fontWeight: '600', color: '#fff' },
  awaitingBadge: {
    backgroundColor: 'rgba(20, 184, 166, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.5)',
  },
  awaitingBadgeText: { fontSize: 10, color: '#14b8a6', fontWeight: '600' },
  paymentNote: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  bookingMeta: { fontSize: 13, color: '#9ca3af', marginTop: 2 },
  bookingLocation: { fontSize: 13, color: '#9ca3af', marginTop: 1 },
  earningsContainer: { alignItems: 'flex-end' },
  earnings: { fontSize: 18, fontWeight: '700', color: '#22c55e' },
  earningsLabel: { fontSize: 11, color: '#9ca3af' },

  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
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

  managePhotosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2563eb',
    marginTop: 16,
    gap: 6,
  },
  managePhotosButtonText: { color: '#2563eb', fontSize: 14, fontWeight: '600' },

  notesContainer: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  notesLabel: { fontSize: 12, color: '#9ca3af', marginBottom: 4 },
  notesText: { fontSize: 14, color: '#fff' },

  photosPreview: { marginTop: 12 },
  photosLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  photosLabelText: { fontSize: 13, color: '#9ca3af' },
  photosList: { flexDirection: 'row' },
  photoThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  morePhotos: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  morePhotosText: { fontSize: 14, color: '#9ca3af', fontWeight: '600' },

  emptyStateContainer: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyStateTitle: { fontSize: 20, fontWeight: '600', color: '#fff', marginTop: 16 },
  emptyStateText: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 8 },
  
  declinedBookingWrapper: {
    marginBottom: 8,
  },
  dismissButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
    marginTop: -8,
    marginHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  dismissButtonText: { color: '#71717a', fontSize: 13 },
});
