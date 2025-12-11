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
  Lightbulb,
  Target,
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
    queryKey: ['photographer-bookings', photographerProfile?.id],
    queryFn: () => snapnowApi.getPhotographerBookings(photographerProfile!.id.toString()),
    enabled: !!photographerProfile?.id,
  });

  const { data: earnings } = useQuery({
    queryKey: ['photographer-earnings', photographerProfile?.id],
    queryFn: () => snapnowApi.getPhotographerEarnings(photographerProfile!.id.toString()),
    enabled: !!photographerProfile?.id,
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

  const bookingsArray = Array.isArray(bookings) ? bookings : [];
  const pendingBookings = bookingsArray.filter(b => b.status === 'pending');
  const confirmedBookings = bookingsArray.filter(b => b.status === 'confirmed');
  const completedBookings = bookingsArray.filter(b => b.status === 'completed');
  const awaitingPhotos = bookingsArray.filter(b => b.status === 'photos_pending');

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

  const getStatusSubtext = () => {
    if (sessionState === 'in_session') return 'Currently shooting';
    if (!isAvailable) return 'Not accepting bookings';
    return 'Ready for bookings';
  };

  const getStatusColor = () => {
    if (sessionState === 'in_session') return '#f59e0b';
    if (!isAvailable) return '#6b7280';
    return '#22c55e';
  };

  const rating = photographerProfile?.rating ? parseFloat(photographerProfile.rating.toString()) : 5.0;

  const mapCenter = {
    latitude: photographerProfile?.latitude ? Number(photographerProfile.latitude) : 51.5074,
    longitude: photographerProfile?.longitude ? Number(photographerProfile.longitude) : -0.1278,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  };

  const upcomingBookingsWithLocation = confirmedBookings.filter(
    b => b.meetingLatitude && b.meetingLongitude && new Date(b.scheduledDate) >= new Date()
  );

  const isToday = (dateStr: string) => {
    return new Date(dateStr).toDateString() === new Date().toDateString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.profileRow}>
            <View style={styles.avatarContainer}>
              {getImageUrl() ? (
                <Image source={{ uri: getImageUrl()! }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Camera size={32} color={PRIMARY_COLOR} />
                </View>
              )}
              <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.fullName || 'Photographer'}</Text>
              <View style={styles.locationRow}>
                <MapPin size={12} color="#9ca3af" />
                <Text style={styles.locationText}>
                  @{photographerProfile?.city || photographerProfile?.location || 'No location set'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sections}>
          {/* Status Pill */}
          <View style={styles.statusCard}>
            <View style={styles.statusLeft}>
              <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
              <View>
                <Text style={styles.statusText}>{getStatusText()}</Text>
                <Text style={styles.statusSubtext}>{getStatusSubtext()}</Text>
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
              style={styles.actionAlert}
              onPress={() => router.push('/(photographer)/bookings')}
            >
              <View style={styles.actionAlertLeft}>
                <View style={styles.actionAlertIcon}>
                  <Bell size={20} color={PRIMARY_COLOR} />
                </View>
                <View>
                  <Text style={styles.actionAlertTitle}>
                    You have {totalActionItems} action item{totalActionItems > 1 ? 's' : ''}
                  </Text>
                  <Text style={styles.actionAlertSubtext}>
                    {pendingBookings.length > 0 && `${pendingBookings.length} pending request${pendingBookings.length > 1 ? 's' : ''}`}
                    {pendingBookings.length > 0 && awaitingPhotos.length > 0 && ' • '}
                    {awaitingPhotos.length > 0 && `${awaitingPhotos.length} awaiting photos`}
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Calendar size={16} color={PRIMARY_COLOR} />
                <Text style={styles.statLabel}>Today</Text>
              </View>
              <Text style={styles.statValue}>{todayBookings.length}</Text>
              <Text style={styles.statSubtext}>Bookings</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <DollarSign size={16} color="#22c55e" />
                <Text style={styles.statLabel}>This Week</Text>
              </View>
              <Text style={styles.statValue}>£{weekEarnings.toFixed(0)}</Text>
              <Text style={styles.statSubtext}>Earnings</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Star size={16} color="#fbbf24" />
                <Text style={styles.statLabel}>Rating</Text>
              </View>
              <Text style={styles.statValue}>{rating.toFixed(1)}</Text>
              <Text style={styles.statSubtext}>Average</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Camera size={16} color="#a855f7" />
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <Text style={styles.statValue}>{completedBookings.length}</Text>
              <Text style={styles.statSubtext}>Jobs Done</Text>
            </View>
          </View>

          {/* Live Map Section */}
          <View style={styles.mapSection}>
            <View style={styles.sectionHeader}>
              <MapPin size={20} color={PRIMARY_COLOR} />
              <Text style={styles.sectionTitle}>Live Map</Text>
            </View>
            <View style={styles.mapContainer}>
              <MapView
                ref={mapRef}
                style={styles.map}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                mapType={Platform.OS === 'ios' ? 'mutedStandard' : 'standard'}
                customMapStyle={Platform.OS === 'android' ? darkMapStyle : undefined}
                initialRegion={mapCenter}
                showsUserLocation
                showsMyLocationButton={false}
              >
                {upcomingBookingsWithLocation.map(booking => (
                  <Marker
                    key={booking.id}
                    coordinate={{
                      latitude: parseFloat(booking.meetingLatitude),
                      longitude: parseFloat(booking.meetingLongitude),
                    }}
                    onPress={() => router.push(`/(photographer)/booking/${booking.id}`)}
                  >
                    <View style={[
                      styles.bookingMarker,
                      { backgroundColor: isToday(booking.scheduledDate) ? '#22c55e' : '#8b5cf6' }
                    ]}>
                      <View style={styles.bookingMarkerInner} />
                    </View>
                  </Marker>
                ))}
              </MapView>

              {/* Map Controls */}
              <View style={styles.mapControls}>
                <TouchableOpacity style={styles.mapControlButton}>
                  <Layers size={16} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.mapControlButton}>
                  <Navigation size={16} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* Legend */}
              <View style={styles.mapLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#22c55e' }]} />
                  <Text style={styles.legendText}>Today</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#8b5cf6' }]} />
                  <Text style={styles.legendText}>Upcoming</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Get Ready for Bookings - Tips Section */}
          <View style={styles.tipsSection}>
            <View style={styles.sectionHeader}>
              <Zap size={20} color="#fbbf24" />
              <Text style={styles.sectionTitle}>Get Ready for Bookings</Text>
            </View>

            <TouchableOpacity style={styles.tipCard}>
              <View style={[styles.tipIcon, { backgroundColor: 'rgba(139, 92, 246, 0.2)' }]}>
                <UserIcon size={20} color="#8b5cf6" />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Update Your Profile</Text>
                <Text style={styles.tipDescription}>
                  Add photos and update your bio to attract more customers
                </Text>
              </View>
              <ChevronRight size={20} color="#6b7280" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.tipCard}>
              <View style={[styles.tipIcon, { backgroundColor: 'rgba(34, 197, 94, 0.2)' }]}>
                <DollarSign size={20} color="#22c55e" />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Set Your Rates</Text>
                <Text style={styles.tipDescription}>
                  Adjust your hourly rate and add editing services
                </Text>
              </View>
              <ChevronRight size={20} color="#6b7280" />
            </TouchableOpacity>

            <View style={styles.tipCard}>
              <View style={[styles.tipIcon, { backgroundColor: 'rgba(251, 191, 36, 0.2)' }]}>
                <Lightbulb size={20} color="#fbbf24" />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Pro Tip</Text>
                <Text style={styles.tipDescription}>
                  Photographers with complete profiles and portfolio photos get 3x more bookings
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  content: { flex: 1 },
  
  header: { padding: 20, paddingTop: 12 },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { position: 'relative', marginRight: 16 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'rgba(37,99,235,0.5)',
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(37,99,235,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(37,99,235,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#0a0a0a',
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 20, fontWeight: '700', color: '#fff' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  locationText: { fontSize: 14, color: '#9ca3af' },

  sections: { paddingHorizontal: 20 },

  statusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16,
  },
  statusLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusIndicator: { width: 12, height: 12, borderRadius: 6 },
  statusText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  statusSubtext: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statusButtonText: { fontSize: 14, fontWeight: '500', color: '#fff' },

  actionAlert: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(37,99,235,0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(37,99,235,0.3)',
    marginBottom: 16,
  },
  actionAlertLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  actionAlertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(37,99,235,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionAlertTitle: { fontSize: 14, fontWeight: '600', color: '#fff' },
  actionAlertSubtext: { fontSize: 12, color: '#9ca3af', marginTop: 2 },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
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
  statHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  statLabel: { fontSize: 12, color: '#9ca3af' },
  statValue: { fontSize: 28, fontWeight: '700', color: '#fff' },
  statSubtext: { fontSize: 12, color: '#9ca3af', marginTop: 2 },

  mapSection: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  mapContainer: {
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  map: { flex: 1 },
  mapControls: {
    position: 'absolute',
    top: 12,
    right: 12,
    gap: 8,
  },
  mapControlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  mapLegend: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    gap: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  bookingMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingMarkerInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },

  tipsSection: { marginBottom: 20 },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 8,
  },
  tipIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipContent: { flex: 1 },
  tipTitle: { fontSize: 14, fontWeight: '600', color: '#fff' },
  tipDescription: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
});
