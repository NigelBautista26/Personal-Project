import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { 
  Calendar, 
  DollarSign, 
  Star, 
  Camera, 
  Clock, 
  Bell, 
  ChevronRight, 
  MapPin,
  Layers,
  Navigation,
  Zap,
  User as UserIcon,
} from 'lucide-react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useAuth } from '../../src/context/AuthContext';
import { snapnowApi } from '../../src/api/snapnowApi';
import { API_URL } from '../../src/api/client';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PRIMARY_COLOR = '#2563eb';

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0d1117' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8b949e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0d1117' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a1f2e' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0c1929' }] },
];

export default function PhotographerDashboardScreen() {
  const { user, photographerProfile, refreshPhotographerProfile } = useAuth();
  const queryClient = useQueryClient();
  const mapRef = useRef<MapView>(null);
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');

  const { data: bookings } = useQuery({
    queryKey: ['photographer-bookings'],
    queryFn: () => snapnowApi.getBookings(),
  });

  const { data: earnings } = useQuery({
    queryKey: ['photographer-earnings'],
    queryFn: () => snapnowApi.getEarnings(),
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: async (isAvailable: boolean) => {
      const response = await fetch(`${API_URL}/api/photographers/me/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isAvailable }),
      });
      if (!response.ok) throw new Error('Failed to update availability');
      return response.json();
    },
    onSuccess: () => {
      refreshPhotographerProfile();
      queryClient.invalidateQueries({ queryKey: ['photographer-bookings'] });
    },
  });

  const pendingBookings = (bookings || []).filter(b => b.status === 'pending');
  const confirmedBookings = (bookings || []).filter(b => b.status === 'confirmed');
  const completedBookings = (bookings || []).filter(b => b.status === 'completed');
  const awaitingPhotos = (bookings || []).filter(b => b.status === 'photos_pending');

  const totalActionItems = pendingBookings.length + awaitingPhotos.length;

  const todayBookings = confirmedBookings.filter(b => {
    const today = new Date().toDateString();
    return new Date(b.scheduledDate).toDateString() === today;
  });

  const earningsArray = Array.isArray(earnings) ? earnings : [];
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekEarnings = earningsArray
    .filter(e => new Date(e.createdAt) >= weekStart)
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const getImageUrl = () => {
    const url = photographerProfile?.profileImageUrl || photographerProfile?.profilePicture;
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
  };

  const isAvailable = photographerProfile?.isAvailable !== false;
  const sessionState = photographerProfile?.sessionState || 'available';

  const getStatusText = () => {
    if (sessionState === 'in_session') return 'In Session';
    if (!isAvailable) return 'Offline';
    return 'Available';
  };

  const getStatusColor = () => {
    if (sessionState === 'in_session') return '#f59e0b';
    if (!isAvailable) return '#6b7280';
    return '#22c55e';
  };

  const mapCenter = {
    latitude: photographerProfile?.latitude ? Number(photographerProfile.latitude) : 51.5074,
    longitude: photographerProfile?.longitude ? Number(photographerProfile.longitude) : -0.1278,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {getImageUrl() ? (
              <Image source={{ uri: getImageUrl()! }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <UserIcon size={32} color="#9ca3af" />
              </View>
            )}
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.fullName || 'Photographer'}</Text>
            <View style={styles.locationRow}>
              <MapPin size={14} color="#9ca3af" />
              <Text style={styles.locationText}>{photographerProfile?.location || 'Location not set'}</Text>
            </View>
          </View>
        </View>

        {/* Availability Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusLeft}>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
            <View>
              <Text style={styles.statusTitle}>{getStatusText()}</Text>
              <Text style={styles.statusSubtitle}>
                {sessionState === 'in_session' ? 'Currently with a customer' : isAvailable ? 'Ready for bookings' : 'Not accepting bookings'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.statusButton}
            onPress={() => toggleAvailabilityMutation.mutate(!isAvailable)}
            disabled={toggleAvailabilityMutation.isPending || sessionState === 'in_session'}
          >
            <Text style={styles.statusButtonText}>
              {isAvailable ? 'Go Offline' : 'Go Online'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Items Alert */}
        {totalActionItems > 0 && (
          <TouchableOpacity
            style={styles.alertCard}
            onPress={() => router.push('/(photographer)/bookings')}
          >
            <View style={styles.alertIcon}>
              <Bell size={20} color={PRIMARY_COLOR} />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>
                You have {totalActionItems} action item{totalActionItems > 1 ? 's' : ''}
              </Text>
              <Text style={styles.alertSubtitle}>
                {pendingBookings.length > 0 && `${pendingBookings.length} pending request${pendingBookings.length > 1 ? 's' : ''}`}
                {pendingBookings.length > 0 && awaitingPhotos.length > 0 && ' • '}
                {awaitingPhotos.length > 0 && `${awaitingPhotos.length} awaiting photos`}
              </Text>
            </View>
            <ChevronRight size={20} color="#6b7280" />
          </TouchableOpacity>
        )}

        {/* Stats Grid - 2x2 matching web */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Calendar size={16} color={PRIMARY_COLOR} />
              <Text style={styles.statHeaderText}>Today</Text>
            </View>
            <Text style={styles.statValue}>{todayBookings.length}</Text>
            <Text style={styles.statLabel}>Bookings</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <DollarSign size={16} color="#22c55e" />
              <Text style={styles.statHeaderText}>This Week</Text>
            </View>
            <Text style={styles.statValue}>£{weekEarnings.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Earnings</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Star size={16} color="#fbbf24" />
              <Text style={styles.statHeaderText}>Rating</Text>
            </View>
            <Text style={styles.statValue}>
              {photographerProfile?.rating != null ? Number(photographerProfile.rating).toFixed(1) : 'N/A'}
            </Text>
            <Text style={styles.statLabel}>Average</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Camera size={16} color="#a855f7" />
              <Text style={styles.statHeaderText}>Total</Text>
            </View>
            <Text style={styles.statValue}>{photographerProfile?.reviewCount || completedBookings.length}</Text>
            <Text style={styles.statLabel}>Jobs Done</Text>
          </View>
        </View>

        {/* Live Map Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <MapPin size={20} color={PRIMARY_COLOR} />
              <Text style={styles.sectionTitle}>Live Map</Text>
            </View>
          </View>
          
          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
              initialRegion={mapCenter}
              mapType={Platform.OS === 'ios' ? (mapType === 'satellite' ? 'satellite' : 'mutedStandard') : mapType}
              customMapStyle={Platform.OS === 'android' && mapType === 'standard' ? darkMapStyle : undefined}
              userInterfaceStyle="dark"
              showsUserLocation={true}
              showsMyLocationButton={false}
            >
              {confirmedBookings
                .filter(b => b.meetingLatitude && b.meetingLongitude)
                .map((booking) => {
                  const isToday = new Date(booking.scheduledDate).toDateString() === new Date().toDateString();
                  return (
                    <Marker
                      key={booking.id}
                      coordinate={{
                        latitude: Number(booking.meetingLatitude),
                        longitude: Number(booking.meetingLongitude),
                      }}
                      pinColor={isToday ? '#22c55e' : '#a855f7'}
                    />
                  );
                })}
            </MapView>

            {/* Map Controls */}
            <View style={styles.mapControls}>
              <TouchableOpacity
                style={styles.mapControlButton}
                onPress={() => setMapType(prev => prev === 'standard' ? 'satellite' : 'standard')}
              >
                <Layers size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.mapControlButton}
                onPress={() => {
                  if (mapRef.current) {
                    mapRef.current.animateToRegion(mapCenter, 500);
                  }
                }}
              >
                <Navigation size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Map Legend */}
            <View style={styles.mapLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#22c55e' }]} />
                <Text style={styles.legendText}>Today</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#a855f7' }]} />
                <Text style={styles.legendText}>Upcoming</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Get Ready for Bookings / Tips */}
        {totalActionItems === 0 && confirmedBookings.length === 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Zap size={20} color="#fbbf24" />
                <Text style={styles.sectionTitle}>Get Ready for Bookings</Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.tipCard}
              onPress={() => router.push('/(photographer)/profile')}
            >
              <View style={styles.tipIcon}>
                <UserIcon size={24} color={PRIMARY_COLOR} />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Update Your Profile</Text>
                <Text style={styles.tipSubtitle}>Add photos and update your bio to attract more customers</Text>
              </View>
              <ChevronRight size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
        )}

        {/* Upcoming Sessions */}
        {confirmedBookings.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Clock size={20} color={PRIMARY_COLOR} />
                <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(photographer)/bookings')}>
                <Text style={styles.seeAll}>View All</Text>
              </TouchableOpacity>
            </View>

            {confirmedBookings.slice(0, 2).map((booking) => (
              <TouchableOpacity
                key={booking.id}
                style={styles.sessionCard}
                onPress={() => router.push(`/(photographer)/booking/${booking.id}`)}
              >
                <View style={styles.sessionAvatar}>
                  {booking.customer?.profileImageUrl ? (
                    <Image 
                      source={{ uri: booking.customer.profileImageUrl.startsWith('http') ? booking.customer.profileImageUrl : `${API_URL}${booking.customer.profileImageUrl}` }} 
                      style={styles.sessionAvatarImage} 
                    />
                  ) : (
                    <UserIcon size={24} color={PRIMARY_COLOR} />
                  )}
                </View>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionName}>{booking.customer?.fullName || 'Customer'}</Text>
                  <View style={styles.sessionDetails}>
                    <Calendar size={12} color="#9ca3af" />
                    <Text style={styles.sessionDetailText}>
                      {new Date(booking.scheduledDate).toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </Text>
                    <Clock size={12} color="#9ca3af" style={{ marginLeft: 8 }} />
                    <Text style={styles.sessionDetailText}>{booking.scheduledTime}</Text>
                  </View>
                </View>
                <Text style={styles.sessionEarnings}>£{booking.photographerEarnings}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  content: { flex: 1 },

  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  avatarContainer: { position: 'relative' },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  avatarPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#0a0a0a',
  },
  profileInfo: { marginLeft: 16, flex: 1 },
  profileName: { fontSize: 22, fontWeight: '700', color: '#fff' },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  locationText: { fontSize: 14, color: '#9ca3af', marginLeft: 4 },

  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statusLeft: { flexDirection: 'row', alignItems: 'center' },
  statusIndicator: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  statusTitle: { fontSize: 16, fontWeight: '600', color: '#fff' },
  statusSubtitle: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statusButtonText: { fontSize: 14, color: '#fff', fontWeight: '500' },

  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    backgroundColor: 'rgba(37,99,235,0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(37,99,235,0.3)',
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(37,99,235,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertContent: { flex: 1 },
  alertTitle: { fontSize: 15, fontWeight: '600', color: '#fff' },
  alertSubtitle: { fontSize: 12, color: '#9ca3af', marginTop: 2 },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  statHeaderText: { fontSize: 12, color: '#9ca3af', marginLeft: 6 },
  statValue: { fontSize: 28, fontWeight: '700', color: '#fff' },
  statLabel: { fontSize: 12, color: '#9ca3af', marginTop: 2 },

  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginLeft: 8 },
  seeAll: { fontSize: 14, color: PRIMARY_COLOR },

  mapContainer: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  map: { flex: 1 },
  mapControls: {
    position: 'absolute',
    right: 12,
    top: 12,
    gap: 8,
  },
  mapControlButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapLegend: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    gap: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  legendText: { fontSize: 12, color: '#fff' },

  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  tipIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(37,99,235,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipContent: { flex: 1 },
  tipTitle: { fontSize: 16, fontWeight: '600', color: '#fff' },
  tipSubtitle: { fontSize: 13, color: '#9ca3af', marginTop: 2 },

  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 12,
  },
  sessionAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(37,99,235,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  sessionAvatarImage: { width: 48, height: 48, borderRadius: 24 },
  sessionInfo: { flex: 1, marginLeft: 12 },
  sessionName: { fontSize: 16, fontWeight: '600', color: '#fff' },
  sessionDetails: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  sessionDetailText: { fontSize: 12, color: '#9ca3af', marginLeft: 4 },
  sessionEarnings: { fontSize: 18, fontWeight: '700', color: '#22c55e' },
});
