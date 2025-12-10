import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { MapPin, DollarSign, Instagram, Globe, FileText, LogOut, Camera } from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';
import { snapnowApi } from '../api/snapnowApi';
import { useAuth } from '../context/AuthContext';
import PhotoBackground from '../components/PhotoBackground';

const PRIMARY_COLOR = '#2563eb';

export default function PhotographerOnboardingScreen() {
  const { refreshPhotographerProfile, logout } = useAuth();
  const [hourlyRate, setHourlyRate] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!coords) throw new Error('Please set your location');
      if (!hourlyRate) throw new Error('Please set your hourly rate');
      if (!instagramUrl.trim()) throw new Error('Instagram URL is required for verification');

      await snapnowApi.createPhotographerProfile({
        hourlyRate: parseInt(hourlyRate),
        city,
        latitude: coords.lat,
        longitude: coords.lng,
        bio: bio || undefined,
        instagramUrl,
        websiteUrl: websiteUrl || undefined,
      });
    },
    onSuccess: async () => {
      await refreshPhotographerProfile();
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to create profile');
    },
  });

  const handleFinishLater = async () => {
    setLoggingOut(true);
    await logout();
  };

  const useCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });

      const [address] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (address?.city) {
        setCity(address.city);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not get your location');
    } finally {
      setLocationLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <PhotoBackground />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Camera size={32} color={PRIMARY_COLOR} />
              </View>
              <Text style={styles.title}>Complete Your Profile</Text>
              <Text style={styles.subtitle}>
                Set up your profile and submit your portfolio for review. Once approved, customers will be able to book you.
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Hourly Rate (£)</Text>
                <View style={styles.inputWrapper}>
                  <DollarSign size={20} color="#6b7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 75"
                    placeholderTextColor="#6b7280"
                    value={hourlyRate}
                    onChangeText={setHourlyRate}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>City</Text>
                <View style={styles.inputWrapper}>
                  <MapPin size={20} color="#6b7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. London"
                    placeholderTextColor="#6b7280"
                    value={city}
                    onChangeText={setCity}
                  />
                </View>
                <TouchableOpacity
                  style={styles.locationButton}
                  onPress={useCurrentLocation}
                  disabled={locationLoading}
                >
                  {locationLoading ? (
                    <ActivityIndicator size="small" color={PRIMARY_COLOR} />
                  ) : (
                    <>
                      <MapPin size={16} color={PRIMARY_COLOR} />
                      <Text style={styles.locationButtonText}>Use Current Location</Text>
                    </>
                  )}
                </TouchableOpacity>
                {coords && (
                  <Text style={styles.coordsText}>Location set ✓</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Bio (optional)</Text>
                <View style={styles.inputWrapper}>
                  <FileText size={20} color="#6b7280" style={[styles.inputIcon, { top: 16 }]} />
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Tell clients about yourself..."
                    placeholderTextColor="#6b7280"
                    value={bio}
                    onChangeText={setBio}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Instagram URL (required for verification)</Text>
                <View style={styles.inputWrapper}>
                  <Instagram size={20} color="#e1306c" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="https://instagram.com/yourprofile"
                    placeholderTextColor="#6b7280"
                    value={instagramUrl}
                    onChangeText={setInstagramUrl}
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Website URL (optional)</Text>
                <View style={styles.inputWrapper}>
                  <Globe size={20} color={PRIMARY_COLOR} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="https://yourwebsite.com"
                    placeholderTextColor="#6b7280"
                    value={websiteUrl}
                    onChangeText={setWebsiteUrl}
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, createMutation.isPending && styles.submitButtonDisabled]}
                onPress={() => createMutation.mutate()}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit for Review</Text>
                )}
              </TouchableOpacity>

              <Text style={styles.disclaimer}>
                Your profile will be reviewed by our team before you can start accepting bookings. This usually takes 24-48 hours.
              </Text>

              <TouchableOpacity
                style={styles.finishLaterButton}
                onPress={handleFinishLater}
                disabled={loggingOut}
              >
                {loggingOut ? (
                  <ActivityIndicator size="small" color="#9ca3af" />
                ) : (
                  <>
                    <LogOut size={18} color="#9ca3af" style={styles.finishLaterIcon} />
                    <Text style={styles.finishLaterText}>Finish later</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  safeArea: { flex: 1 },
  content: { flex: 1, padding: 24 },
  card: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  header: { marginBottom: 24, alignItems: 'center' },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#9ca3af', lineHeight: 22, textAlign: 'center' },
  form: {},
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '500', color: '#fff', marginBottom: 8 },
  inputWrapper: { position: 'relative' },
  inputIcon: { position: 'absolute', left: 16, top: 18, zIndex: 1 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    paddingLeft: 48,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  textArea: {
    height: 100,
    paddingTop: 16,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  locationButtonIcon: {
    marginRight: 8,
  },
  locationButtonText: { color: PRIMARY_COLOR, fontSize: 14, fontWeight: '500' },
  coordsText: { color: '#22c55e', fontSize: 12, marginTop: 4 },
  submitButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  disclaimer: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
  },
  finishLaterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 16,
    marginBottom: 40,
  },
  finishLaterIcon: {
    marginRight: 8,
  },
  finishLaterText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
  },
});
