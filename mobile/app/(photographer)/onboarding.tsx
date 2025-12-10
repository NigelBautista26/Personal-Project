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
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { MapPin, DollarSign, Instagram, Globe, FileText } from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';
import { snapnowApi } from '../../src/api/snapnowApi';
import { useAuth } from '../../src/context/AuthContext';

export default function PhotographerOnboardingScreen() {
  const { refreshPhotographerProfile } = useAuth();
  const [hourlyRate, setHourlyRate] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

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
      router.replace('/(photographer)/pending');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to create profile');
    },
  });

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
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>
            Set up your photographer profile to start accepting bookings
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
                <ActivityIndicator size="small" color="#6366f1" />
              ) : (
                <>
                  <MapPin size={16} color="#6366f1" />
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
              <Globe size={20} color="#6366f1" style={styles.inputIcon} />
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  content: { flex: 1, padding: 24 },
  header: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#9ca3af', lineHeight: 24 },
  form: { gap: 20 },
  inputGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: '500', color: '#fff' },
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
    gap: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  locationButtonText: { color: '#6366f1', fontSize: 14, fontWeight: '500' },
  coordsText: { color: '#22c55e', fontSize: 12, marginTop: 4 },
  submitButton: {
    backgroundColor: '#6366f1',
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
    marginBottom: 40,
  },
});
