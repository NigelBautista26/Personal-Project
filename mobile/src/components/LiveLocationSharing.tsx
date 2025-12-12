import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import * as Location from 'expo-location';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Navigation, MapPin, AlertCircle, Loader2 } from 'lucide-react-native';
import { snapnowApi } from '../api/snapnowApi';

interface LiveLocationSharingProps {
  bookingId: string;
  scheduledDate: string;
  scheduledTime: string;
  userType: 'customer' | 'photographer';
  onLocationUpdate?: (location: { lat: number; lng: number } | null) => void;
  onOtherPartyLocation?: (location: { lat: number; lng: number; updatedAt: string } | null) => void;
}

const PRIMARY_COLOR = '#2563eb';

export function LiveLocationSharing({
  bookingId,
  scheduledDate,
  scheduledTime,
  userType,
  onLocationUpdate,
  onOtherPartyLocation,
}: LiveLocationSharingProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [minutesUntilAvailable, setMinutesUntilAvailable] = useState<number | null>(null);
  const [isWithinWindow, setIsWithinWindow] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const hasAutoStarted = useRef(false);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const queryClient = useQueryClient();

  const getSessionDateTime = useCallback(() => {
    const sessionDate = new Date(scheduledDate);
    const timeParts = scheduledTime.replace(/[AP]M/i, '').trim().split(':');
    const hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]) || 0;
    const isPM = scheduledTime.toLowerCase().includes('pm');
    sessionDate.setHours(isPM && hours !== 12 ? hours + 12 : hours === 12 && !isPM ? 0 : hours, minutes);
    return sessionDate;
  }, [scheduledDate, scheduledTime]);

  useEffect(() => {
    const checkAvailability = () => {
      const sessionDateTime = getSessionDateTime();
      const now = new Date();
      const minutesUntil = (sessionDateTime.getTime() - now.getTime()) / (1000 * 60);

      if (minutesUntil <= 10) {
        setMinutesUntilAvailable(null);
        setIsWithinWindow(true);
      } else {
        setMinutesUntilAvailable(Math.ceil(minutesUntil - 10));
        setIsWithinWindow(false);
      }
    };

    checkAvailability();
    const interval = setInterval(checkAvailability, 30000);
    return () => clearInterval(interval);
  }, [getSessionDateTime]);

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
    enabled: isWithinWindow,
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (otherPartyLocation && onOtherPartyLocation) {
      onOtherPartyLocation({
        lat: parseFloat(otherPartyLocation.latitude),
        lng: parseFloat(otherPartyLocation.longitude),
        updatedAt: otherPartyLocation.updatedAt,
      });
    } else if (!otherPartyLocation && onOtherPartyLocation) {
      onOtherPartyLocation(null);
    }
  }, [otherPartyLocation, onOtherPartyLocation]);

  const startSharing = useCallback(async () => {
    setError(null);

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setPermissionDenied(true);
      setError('Location permission denied');
      return;
    }

    try {
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 5,
        },
        (location) => {
          const { latitude, longitude, accuracy } = location.coords;
          const newLocation = { lat: latitude, lng: longitude };
          setCurrentLocation(newLocation);
          onLocationUpdate?.(newLocation);
          updateLocationMutation.mutate({ latitude, longitude, accuracy: accuracy || 10 });
        }
      );

      locationSubscription.current = subscription;
      setIsSharing(true);
    } catch (err: any) {
      console.error('Location error:', err);
      setError(err.message || 'Failed to start location sharing');
    }
  }, [bookingId, updateLocationMutation, onLocationUpdate]);

  const stopSharing = useCallback(() => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    setIsSharing(false);
    setCurrentLocation(null);
    onLocationUpdate?.(null);
    snapnowApi.deleteLiveLocation(bookingId).catch(console.error);
  }, [bookingId, onLocationUpdate]);

  useEffect(() => {
    if (isWithinWindow && !isSharing && !hasAutoStarted.current && !permissionDenied) {
      hasAutoStarted.current = true;
      startSharing();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWithinWindow]);

  useEffect(() => {
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, []);

  if (!isWithinWindow) {
    if (minutesUntilAvailable !== null) {
      return (
        <View style={styles.container}>
          <View style={[styles.iconContainer, styles.grayBg]}>
            <Navigation size={20} color="#9ca3af" />
          </View>
          <View style={styles.content}>
            <Text style={styles.title}>Location Sharing</Text>
            <Text style={styles.subtitle}>
              Available in {minutesUntilAvailable} minute{minutesUntilAvailable !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      );
    }
    return null;
  }

  if (permissionDenied) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <View style={[styles.iconContainer, styles.redBg]}>
          <AlertCircle size={20} color="#ef4444" />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>Location Access Denied</Text>
          <Text style={styles.subtitle}>Enable location in device settings to share</Text>
        </View>
      </View>
    );
  }

  if (isSharing) {
    return (
      <View style={[styles.container, styles.activeContainer]}>
        <View style={[styles.iconContainer, styles.blueBg]}>
          <Navigation size={20} color={PRIMARY_COLOR} />
          <View style={styles.pulse} />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>Sharing Your Location</Text>
          {currentLocation && (
            <View style={styles.locationRow}>
              <MapPin size={12} color={PRIMARY_COLOR} />
              <Text style={styles.locationText}>
                {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
              </Text>
            </View>
          )}
        </View>
        <Loader2 size={20} color={PRIMARY_COLOR} style={styles.spinner} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, styles.grayBg]}>
        <Navigation size={20} color="#9ca3af" />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Starting Location...</Text>
        <Text style={styles.subtitle}>Requesting permissions</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeContainer: {
    backgroundColor: 'rgba(37, 99, 235, 0.05)',
    borderColor: 'rgba(37, 99, 235, 0.3)',
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  grayBg: {
    backgroundColor: 'rgba(156, 163, 175, 0.2)',
  },
  blueBg: {
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
  },
  redBg: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  pulse: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 6,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    color: PRIMARY_COLOR,
    fontSize: 11,
    marginLeft: 4,
  },
  spinner: {
    marginLeft: 8,
  },
});
