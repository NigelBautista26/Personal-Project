import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, ActivityIndicator, Image } from 'react-native';
import { SafeMapView, SafeMarker, PROVIDER_GOOGLE } from './SafeMapView';
import * as Location from 'expo-location';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MapPin, Navigation, MessageSquare, Clock, CheckCircle, AlertCircle, Camera, User } from 'lucide-react-native';
import { snapnowApi } from '../api/snapnowApi';
import api from '../api/client';

interface MeetUpExperienceProps {
  bookingId: string;
  scheduledDate: string;
  scheduledTime: string;
  duration?: number;
  userType: 'customer' | 'photographer';
  meetingLatitude?: string | null;
  meetingLongitude?: string | null;
  meetingNotes?: string | null;
  locationName: string;
  onMeetingPointSaved?: () => void;
  canEditMeetingPoint?: boolean;
  myProfileImage?: string | null;
  otherPartyProfileImage?: string | null;
}

const PRIMARY_COLOR = '#2563eb';

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.country', elementType: 'labels', stylers: [{ visibility: 'on' }] },
  { featureType: 'administrative.locality', elementType: 'labels', stylers: [{ visibility: 'on' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#ffffff' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2d2d44' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1a1a2e' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3d3d5c' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1a1a2e' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#2d2d44' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4a5568' }] },
];

export function MeetUpExperience({
  bookingId,
  scheduledDate,
  scheduledTime,
  duration = 1,
  userType,
  meetingLatitude,
  meetingLongitude,
  meetingNotes,
  locationName,
  onMeetingPointSaved,
  canEditMeetingPoint = false,
  myProfileImage,
  otherPartyProfileImage,
}: MeetUpExperienceProps) {
  const queryClient = useQueryClient();
  const [isSharing, setIsSharing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [minutesUntilAvailable, setMinutesUntilAvailable] = useState<number | null>(null);
  const [isWithinWindow, setIsWithinWindow] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const hasAutoStarted = useRef(false);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  // Meeting point editing state (for photographer)
  const [isEditing, setIsEditing] = useState(false);
  const [editLat, setEditLat] = useState<number | null>(null);
  const [editLng, setEditLng] = useState<number | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const hasMeetingPoint = !!(meetingLatitude && meetingLongitude);

  const getSessionDateTime = useCallback(() => {
    const sessionDate = new Date(scheduledDate);
    const timeParts = scheduledTime.replace(/[AP]M/i, '').trim().split(':');
    const hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]) || 0;
    const isPM = scheduledTime.toLowerCase().includes('pm');
    sessionDate.setHours(isPM && hours !== 12 ? hours + 12 : hours === 12 && !isPM ? 0 : hours, minutes);
    return sessionDate;
  }, [scheduledDate, scheduledTime]);

  const getSessionEndDateTime = useCallback(() => {
    const startTime = getSessionDateTime();
    return new Date(startTime.getTime() + duration * 60 * 60 * 1000);
  }, [getSessionDateTime, duration]);

  useEffect(() => {
    const checkAvailability = () => {
      const sessionDateTime = getSessionDateTime();
      const sessionEndTime = getSessionEndDateTime();
      const now = new Date();
      const minutesUntilStart = (sessionDateTime.getTime() - now.getTime()) / (1000 * 60);

      if (now > sessionEndTime) {
        setSessionEnded(true);
        setIsWithinWindow(false);
        return;
      }

      if (minutesUntilStart <= 10) {
        setMinutesUntilAvailable(null);
        setIsWithinWindow(true);
      } else {
        setMinutesUntilAvailable(Math.ceil(minutesUntilStart - 10));
        setIsWithinWindow(false);
      }
    };

    checkAvailability();
    const interval = setInterval(checkAvailability, 30000);
    return () => clearInterval(interval);
  }, [getSessionDateTime, getSessionEndDateTime]);

  const updateLocationMutation = useMutation({
    mutationFn: (data: { latitude: number; longitude: number; accuracy: number }) =>
      snapnowApi.updateLiveLocation(bookingId, { ...data, userType }),
    onError: (err: any) => {
      console.error('Failed to update location:', err);
    },
  });

  const { data: otherPartyLocation } = useQuery({
    queryKey: ['other-party-location', bookingId, userType],
    queryFn: () => snapnowApi.getOtherPartyLocation(bookingId, userType),
    enabled: isWithinWindow && !sessionEnded,
    refetchInterval: 5000,
  });

  const startSharing = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setPermissionDenied(true);
      return;
    }

    try {
      const subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 5 },
        (location) => {
          const { latitude, longitude, accuracy } = location.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          updateLocationMutation.mutate({ latitude, longitude, accuracy: accuracy || 10 });
        }
      );
      locationSubscription.current = subscription;
      setIsSharing(true);
    } catch (err: any) {
      console.error('Location error:', err);
    }
  }, [bookingId, updateLocationMutation]);

  const stopSharing = useCallback(() => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    setIsSharing(false);
    setCurrentLocation(null);
    snapnowApi.deleteLiveLocation(bookingId).catch(console.error);
  }, [bookingId]);

  useEffect(() => {
    if (isWithinWindow && !isSharing && !hasAutoStarted.current && !permissionDenied) {
      hasAutoStarted.current = true;
      startSharing();
    }
  }, [isWithinWindow, isSharing, permissionDenied, startSharing]);

  useEffect(() => {
    if (sessionEnded && isSharing) {
      stopSharing();
    }
  }, [sessionEnded, isSharing, stopSharing]);

  useEffect(() => {
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, []);

  const handleUseCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is required.');
      return;
    }
    const location = await Location.getCurrentPositionAsync({});
    setEditLat(location.coords.latitude);
    setEditLng(location.coords.longitude);
  };

  const handleSaveMeetingPoint = async () => {
    if (!editLat || !editLng) {
      Alert.alert('Error', 'Please set a location first.');
      return;
    }
    setIsSaving(true);
    try {
      await api.patch(`/api/bookings/${bookingId}/meeting-location`, {
        latitude: editLat,
        longitude: editLng,
        notes: editNotes || null,
      });
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
      setIsEditing(false);
      onMeetingPointSaved?.();
      Alert.alert('Success', 'Meeting point saved!');
    } catch (error) {
      Alert.alert('Error', 'Could not save meeting point.');
    } finally {
      setIsSaving(false);
    }
  };

  const otherPartyLabel = userType === 'customer' ? 'Photographer' : 'Customer';
  const hasOtherPartyLocation = otherPartyLocation && otherPartyLocation.latitude;

  // Determine map region
  const getMapRegion = () => {
    const points: { lat: number; lng: number }[] = [];
    
    if (hasMeetingPoint) {
      points.push({ lat: parseFloat(meetingLatitude!), lng: parseFloat(meetingLongitude!) });
    }
    if (currentLocation) {
      points.push(currentLocation);
    }
    if (hasOtherPartyLocation) {
      points.push({ 
        lat: parseFloat(otherPartyLocation.latitude), 
        lng: parseFloat(otherPartyLocation.longitude) 
      });
    }

    if (points.length === 0) {
      return { latitude: 51.5074, longitude: -0.1278, latitudeDelta: 0.02, longitudeDelta: 0.02 };
    }

    const latitudes = points.map(p => p.lat);
    const longitudes = points.map(p => p.lng);
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);
    
    const latDelta = Math.max((maxLat - minLat) * 1.5, 0.01);
    const lngDelta = Math.max((maxLng - minLng) * 1.5, 0.01);

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };
  };

  // Get status message
  const getStatusMessage = () => {
    if (sessionEnded) {
      return { text: 'Session ended', color: '#6b7280', icon: CheckCircle };
    }
    if (permissionDenied) {
      return { text: 'Location access denied', color: '#ef4444', icon: AlertCircle };
    }
    if (!isWithinWindow && minutesUntilAvailable !== null) {
      return { text: `Live tracking starts in ${minutesUntilAvailable} min`, color: '#9ca3af', icon: Clock };
    }
    if (isWithinWindow && isSharing) {
      if (hasOtherPartyLocation) {
        return { text: `Both sharing • Head to ${locationName}`, color: '#22c55e', icon: Navigation };
      }
      return { text: `Sharing location • Waiting for ${otherPartyLabel.toLowerCase()}`, color: PRIMARY_COLOR, icon: Navigation };
    }
    return { text: `Head to ${locationName}`, color: '#9ca3af', icon: MapPin };
  };

  const status = getStatusMessage();
  const StatusIcon = status.icon;

  // Photographer editing mode
  if (userType === 'photographer' && canEditMeetingPoint && (isEditing || !hasMeetingPoint)) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Set Meeting Point</Text>
        <Text style={styles.subtitle}>Choose where you'll meet {otherPartyLabel.toLowerCase()}</Text>

        <TouchableOpacity style={styles.useLocationButton} onPress={handleUseCurrentLocation}>
          <Navigation size={18} color="#fff" />
          <Text style={styles.useLocationButtonText}>Use My Current Location</Text>
        </TouchableOpacity>

        {editLat && editLng && (
          <View style={styles.mapContainer}>
            <SafeMapView
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              customMapStyle={darkMapStyle}
              region={{
                latitude: editLat,
                longitude: editLng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              onPress={(e: any) => {
                setEditLat(e.nativeEvent.coordinate.latitude);
                setEditLng(e.nativeEvent.coordinate.longitude);
              }}
            >
              <SafeMarker coordinate={{ latitude: editLat, longitude: editLng }}>
                <View style={styles.meetingPinContainer}>
                  <View style={styles.meetingPin}>
                    <MapPin size={16} color="#fff" />
                  </View>
                </View>
              </SafeMarker>
            </SafeMapView>
            <Text style={styles.mapHint}>Tap map to adjust location</Text>
          </View>
        )}

        <TextInput
          style={styles.notesInput}
          placeholder="Meeting notes (e.g., 'Near the main entrance')"
          placeholderTextColor="#6b7280"
          value={editNotes}
          onChangeText={setEditNotes}
          multiline
        />

        <View style={styles.buttonRow}>
          {hasMeetingPoint && (
            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsEditing(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={[styles.saveButton, (!editLat || isSaving) && styles.saveButtonDisabled]}
            onPress={handleSaveMeetingPoint}
            disabled={!editLat || isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Save Meeting Point</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Meet Up</Text>
        {userType === 'photographer' && canEditMeetingPoint && hasMeetingPoint && (
          <TouchableOpacity onPress={() => {
            setEditLat(parseFloat(meetingLatitude!));
            setEditLng(parseFloat(meetingLongitude!));
            setEditNotes(meetingNotes || '');
            setIsEditing(true);
          }}>
            <Text style={styles.editLink}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Status Banner */}
      <View style={[styles.statusBanner, { borderColor: status.color + '40' }]}>
        <StatusIcon size={16} color={status.color} />
        <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
        {isWithinWindow && isSharing && (
          <View style={styles.liveDot} />
        )}
      </View>

      {/* Map */}
      {(hasMeetingPoint || currentLocation || hasOtherPartyLocation) && (
        <View style={styles.mapContainer}>
          <SafeMapView style={styles.map} region={getMapRegion()} provider={PROVIDER_GOOGLE} customMapStyle={darkMapStyle}>
            {/* Meeting Point Marker */}
            {hasMeetingPoint && (
              <SafeMarker
                coordinate={{
                  latitude: parseFloat(meetingLatitude!),
                  longitude: parseFloat(meetingLongitude!),
                }}
                title="Meeting Point"
                description={locationName}
              >
                <View style={styles.meetingPinContainer}>
                  <View style={styles.meetingPin}>
                    <MapPin size={14} color="#fff" />
                  </View>
                </View>
              </SafeMarker>
            )}

            {/* Your Location - Profile Picture with Blue Border */}
            {currentLocation && (
              <SafeMarker
                coordinate={{ latitude: currentLocation.lat, longitude: currentLocation.lng }}
                title="You"
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <View style={styles.profileMarker}>
                  <View style={[styles.profileMarkerBorder, { borderColor: '#3b82f6' }]}>
                    {myProfileImage ? (
                      <Image source={{ uri: myProfileImage }} style={styles.profileMarkerImage} />
                    ) : (
                      <View style={[styles.profileMarkerFallback, { backgroundColor: '#3b82f6' }]}>
                        <User size={16} color="#fff" />
                      </View>
                    )}
                  </View>
                  <Text style={styles.profileMarkerLabel}>You</Text>
                </View>
              </SafeMarker>
            )}

            {/* Other Party Location - Profile Picture with Green/Orange Border */}
            {hasOtherPartyLocation && (
              <SafeMarker
                coordinate={{
                  latitude: parseFloat(otherPartyLocation.latitude),
                  longitude: parseFloat(otherPartyLocation.longitude),
                }}
                title={otherPartyLabel}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <View style={styles.profileMarker}>
                  <View style={[styles.profileMarkerBorder, { borderColor: userType === 'customer' ? '#22c55e' : '#f97316' }]}>
                    {otherPartyProfileImage ? (
                      <Image source={{ uri: otherPartyProfileImage }} style={styles.profileMarkerImage} />
                    ) : (
                      <View style={[styles.profileMarkerFallback, { backgroundColor: userType === 'customer' ? '#22c55e' : '#f97316' }]}>
                        {userType === 'customer' ? <Camera size={16} color="#fff" /> : <User size={16} color="#fff" />}
                      </View>
                    )}
                  </View>
                  <Text style={styles.profileMarkerLabel}>{otherPartyLabel}</Text>
                </View>
              </SafeMarker>
            )}
          </SafeMapView>

          {/* Simplified Legend - only show meeting point indicator */}
          {hasMeetingPoint && (
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: PRIMARY_COLOR }]} />
                <Text style={styles.legendText}>Meeting Point</Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* No meeting point set message for customer */}
      {!hasMeetingPoint && userType === 'customer' && (
        <View style={styles.waitingCard}>
          <Clock size={20} color="#9ca3af" />
          <Text style={styles.waitingText}>Waiting for photographer to set meeting point</Text>
        </View>
      )}

      {/* Meeting Notes */}
      {meetingNotes && (
        <View style={styles.notesCard}>
          <MessageSquare size={16} color="#9ca3af" />
          <Text style={styles.notesText}>{meetingNotes}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  subtitle: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 16,
  },
  editLink: {
    color: PRIMARY_COLOR,
    fontSize: 14,
    fontWeight: '500',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    gap: 8,
  },
  statusText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  mapContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  map: {
    height: 250,
  },
  mapHint: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center',
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.8)',
    gap: 12,
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
    fontSize: 11,
    color: '#d1d5db',
  },
  meetingPinContainer: {
    alignItems: 'center',
  },
  meetingPin: {
    backgroundColor: PRIMARY_COLOR,
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileMarker: {
    alignItems: 'center',
  },
  profileMarkerBorder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    padding: 2,
    backgroundColor: '#1a1a2e',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  profileMarkerImage: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  profileMarkerFallback: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileMarkerLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  waitingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 12,
  },
  waitingText: {
    flex: 1,
    fontSize: 13,
    color: '#9ca3af',
  },
  notesCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    marginBottom: 12,
  },
  notesText: {
    flex: 1,
    fontSize: 13,
    color: '#d1d5db',
    lineHeight: 20,
  },
  useLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 14,
    gap: 8,
    marginBottom: 12,
  },
  useLocationButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  notesInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 14,
    marginBottom: 16,
    minHeight: 60,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cancelButtonText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: PRIMARY_COLOR,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
