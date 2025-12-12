import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Clock, MapPin, MessageSquare, Navigation, X, Camera } from 'lucide-react-native';
import * as Location from 'expo-location';
import { snapnowApi } from '../../../src/api/snapnowApi';
import { API_URL } from '../../../src/api/client';

const PRIMARY_COLOR = '#2563eb';

const PHOTO_SPOTS: { [city: string]: { id: number; name: string; category: string; image: string }[] } = {
  London: [
    { id: 1, name: 'Tower Bridge', category: 'Landmark', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=100' },
    { id: 2, name: 'Buckingham Palace', category: 'Landmark', image: 'https://images.unsplash.com/photo-1587056753321-c3fef73bfc71?w=100' },
    { id: 3, name: 'London Eye', category: 'Landmark', image: 'https://images.unsplash.com/photo-1520986606214-8b456906c813?w=100' },
    { id: 4, name: 'St Pauls Cathedral', category: 'Architecture', image: 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=100' },
    { id: 5, name: 'Camden Market', category: 'Street', image: 'https://images.unsplash.com/photo-1533929736562-4f5040f56024?w=100' },
    { id: 6, name: 'Notting Hill', category: 'Street', image: 'https://images.unsplash.com/photo-1506452305024-9d3f02d1c9b5?w=100' },
    { id: 7, name: 'Big Ben & Westminster', category: 'Landmark', image: 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=100' },
    { id: 8, name: 'South Bank', category: 'Waterfront', image: 'https://images.unsplash.com/photo-1520986606214-8b456906c813?w=100' },
    { id: 9, name: 'Hyde Park', category: 'Park', image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=100' },
    { id: 10, name: 'Covent Garden', category: 'Street', image: 'https://images.unsplash.com/photo-1533929736562-4f5040f56024?w=100' },
  ],
};

export default function BookingScreen() {
  const { id, duration: durationParam } = useLocalSearchParams<{ id: string; duration?: string }>();
  const queryClient = useQueryClient();
  
  const [duration, setDuration] = useState(Number(durationParam) || 1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [manualLocation, setManualLocation] = useState('');

  const { data: photographer, isLoading } = useQuery({
    queryKey: ['photographer', id],
    queryFn: () => snapnowApi.getPhotographer(id!),
    enabled: !!id,
  });

  const bookingMutation = useMutation({
    mutationFn: (data: {
      photographerId: string;
      scheduledDate: string;
      scheduledTime: string;
      duration: number;
      location: string;
    }) => snapnowApi.createBooking(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
      Alert.alert(
        'Booking Requested',
        'Your booking request has been sent to the photographer. You will be notified when they respond.',
        [{ text: 'OK', onPress: () => router.replace('/(customer)/bookings') }]
      );
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to create booking. Please try again.');
    },
  });

  const handleSubmit = () => {
    if (!selectedDate) {
      Alert.alert('Missing Information', 'Please select a date for your session.');
      return;
    }
    if (!selectedTime) {
      Alert.alert('Missing Information', 'Please select a time for your session.');
      return;
    }
    if (!location.trim()) {
      Alert.alert('Missing Information', 'Please enter a location for your session.');
      return;
    }

    const scheduledDateTime = `${selectedDate}T${selectedTime}:00.000Z`;

    bookingMutation.mutate({
      photographerId: id!,
      scheduledDate: scheduledDateTime,
      scheduledTime: selectedTime,
      duration,
      location: location.trim(),
    });
  };

  const handleUseCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location services to use this feature.');
        setIsGettingLocation(false);
        return;
      }
      const currentLocation = await Location.getCurrentPositionAsync({});
      const lat = currentLocation.coords.latitude.toFixed(4);
      const lng = currentLocation.coords.longitude.toFixed(4);
      setLocation(`My Location (${lat}, ${lng})`);
      setShowLocationPicker(false);
    } catch (error) {
      Alert.alert('Error', 'Could not get your location. Please try again.');
    }
    setIsGettingLocation(false);
  };

  const handleSelectSpot = (spotName: string) => {
    setLocation(spotName);
    setShowLocationPicker(false);
  };

  const handleSetManualLocation = () => {
    if (manualLocation.trim()) {
      setLocation(manualLocation.trim());
      setManualLocation('');
      setShowLocationPicker(false);
    }
  };

  const getImageUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_URL}${path}`;
  };

  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
      });
    }
    return dates;
  };

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} style={styles.loader} />
      </SafeAreaView>
    );
  }

  const hourlyRate = photographer?.hourlyRate || 0;
  const baseAmount = hourlyRate * duration;
  const serviceFee = Math.round(baseAmount * 0.10 * 100) / 100;
  const totalPrice = Math.round((baseAmount + serviceFee) * 100) / 100;
  const dateOptions = generateDateOptions();
  const photographerCity = photographer?.city || photographer?.location?.split(',')[0] || 'London';
  const spots = PHOTO_SPOTS[photographerCity] || PHOTO_SPOTS['London'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} testID="button-back">
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Book Session</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.photographerCard}>
          <Image
            source={{ uri: getImageUrl(photographer?.profilePicture) || 'https://via.placeholder.com/60' }}
            style={styles.photographerImage}
          />
          <View style={styles.photographerInfo}>
            <Text style={styles.photographerName}>{photographer?.fullName || 'Photographer'}</Text>
            <View style={styles.photographerLocation}>
              <MapPin size={14} color="#9ca3af" />
              <Text style={styles.photographerLocationText}>{photographer?.city || photographer?.location}</Text>
            </View>
            <Text style={styles.photographerRate}>£{hourlyRate}/hour</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={20} color={PRIMARY_COLOR} />
            <Text style={styles.sectionTitle}>Session Duration</Text>
          </View>
          <View style={styles.durationGrid}>
            {[1, 2, 3].map((hours) => (
              <TouchableOpacity
                key={hours}
                style={[
                  styles.durationOption,
                  duration === hours && styles.durationOptionActive,
                ]}
                onPress={() => setDuration(hours)}
                testID={`button-duration-${hours}`}
              >
                <Text
                  style={[
                    styles.durationText,
                    duration === hours && styles.durationTextActive,
                  ]}
                >
                  {hours} hour{hours > 1 ? 's' : ''}
                </Text>
                <Text
                  style={[
                    styles.durationPrice,
                    duration === hours && styles.durationPriceActive,
                  ]}
                >
                  £{hourlyRate * hours}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color={PRIMARY_COLOR} />
            <Text style={styles.sectionTitle}>Date & Time</Text>
          </View>
          <View style={styles.dateTimeRow}>
            <View style={styles.dateTimeColumn}>
              <Text style={styles.dateTimeLabel}>Date</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.dateGrid}>
                  {dateOptions.slice(0, 7).map((date) => (
                    <TouchableOpacity
                      key={date.value}
                      style={[
                        styles.dateOption,
                        selectedDate === date.value && styles.dateOptionActive,
                      ]}
                      onPress={() => setSelectedDate(date.value)}
                      testID={`button-date-${date.value}`}
                    >
                      <Text
                        style={[
                          styles.dateText,
                          selectedDate === date.value && styles.dateTextActive,
                        ]}
                      >
                        {date.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
          <View style={styles.dateTimeColumn}>
            <Text style={styles.dateTimeLabel}>Time</Text>
            <View style={styles.timeGrid}>
              {timeSlots.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeOption,
                    selectedTime === time && styles.timeOptionActive,
                  ]}
                  onPress={() => setSelectedTime(time)}
                  testID={`button-time-${time}`}
                >
                  <Text
                    style={[
                      styles.timeText,
                      selectedTime === time && styles.timeTextActive,
                    ]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color={PRIMARY_COLOR} />
            <Text style={styles.sectionTitle}>Meeting Location</Text>
          </View>
          <TouchableOpacity
            style={styles.locationSelector}
            onPress={() => setShowLocationPicker(true)}
            testID="button-select-location"
          >
            <Text style={location ? styles.locationText : styles.locationPlaceholder}>
              {location || 'Select a location'}
            </Text>
            <Text style={styles.locationArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MessageSquare size={20} color={PRIMARY_COLOR} />
            <Text style={styles.sectionTitle}>Notes (optional)</Text>
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Any special requests or details..."
            placeholderTextColor="#6b7280"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            testID="input-notes"
          />
        </View>

        <View style={styles.priceSummary}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Session ({duration}h)</Text>
            <Text style={styles.priceValue}>£{baseAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Service fee (10%)</Text>
            <Text style={styles.priceValue}>£{serviceFee.toFixed(2)}</Text>
          </View>
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>£{totalPrice.toFixed(2)}</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, bookingMutation.isPending && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={bookingMutation.isPending}
          testID="button-submit"
        >
          {bookingMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Continue to Payment</Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={showLocationPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLocationPicker(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choose Location</Text>
            <TouchableOpacity onPress={() => setShowLocationPicker(false)} testID="button-close-location">
              <X size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <TouchableOpacity
              style={styles.locationOption}
              onPress={handleUseCurrentLocation}
              disabled={isGettingLocation}
              testID="button-current-location"
            >
              <View style={[styles.locationOptionIcon, { backgroundColor: 'rgba(37, 99, 235, 0.2)' }]}>
                <Navigation size={20} color={PRIMARY_COLOR} />
              </View>
              <View style={styles.locationOptionText}>
                <Text style={styles.locationOptionTitle}>Use Current Location</Text>
                <Text style={styles.locationOptionSubtitle}>Share your GPS location</Text>
              </View>
              {isGettingLocation && <ActivityIndicator size="small" color={PRIMARY_COLOR} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.locationOption}
              onPress={() => Alert.alert('Coming Soon', 'Map picker will be available soon!')}
              testID="button-pick-on-map"
            >
              <View style={[styles.locationOptionIcon, { backgroundColor: 'rgba(139, 92, 246, 0.2)' }]}>
                <Camera size={20} color="#8b5cf6" />
              </View>
              <View style={styles.locationOptionText}>
                <Text style={styles.locationOptionTitle}>Pick on Map</Text>
                <Text style={styles.locationOptionSubtitle}>Tap anywhere to set location</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.manualSection}>
              <Text style={styles.manualLabel}>ENTER MANUALLY</Text>
              <View style={styles.manualInputRow}>
                <TextInput
                  style={styles.manualInput}
                  placeholder="Type a location..."
                  placeholderTextColor="#6b7280"
                  value={manualLocation}
                  onChangeText={setManualLocation}
                  testID="input-manual-location"
                />
                <TouchableOpacity
                  style={styles.manualSetButton}
                  onPress={handleSetManualLocation}
                  testID="button-set-location"
                >
                  <Text style={styles.manualSetButtonText}>Set</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.spotsSection}>
              <Text style={styles.spotsLabel}>POPULAR PHOTO SPOTS IN {photographerCity.toUpperCase()}</Text>
              {spots.map((spot) => (
                <TouchableOpacity
                  key={spot.id}
                  style={styles.spotItem}
                  onPress={() => handleSelectSpot(spot.name)}
                  testID={`button-spot-${spot.id}`}
                >
                  <Image source={{ uri: spot.image }} style={styles.spotImage} />
                  <View style={styles.spotInfo}>
                    <Text style={styles.spotName}>{spot.name}</Text>
                    <Text style={styles.spotCategory}>{spot.category}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: { padding: 8 },
  title: { fontSize: 18, fontWeight: '600', color: '#fff' },
  placeholder: { width: 40 },
  content: { flex: 1, paddingHorizontal: 16 },
  loader: { marginTop: 100 },
  
  photographerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  photographerImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
  },
  photographerInfo: { marginLeft: 12, flex: 1 },
  photographerName: { fontSize: 16, fontWeight: '600', color: '#fff' },
  photographerLocation: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  photographerLocationText: { fontSize: 13, color: '#9ca3af', marginLeft: 4 },
  photographerRate: { fontSize: 14, color: PRIMARY_COLOR, fontWeight: '600', marginTop: 4 },

  section: { marginTop: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginLeft: 8 },
  
  durationGrid: { flexDirection: 'row', gap: 12 },
  durationOption: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  durationOptionActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    borderColor: PRIMARY_COLOR,
  },
  durationText: { fontSize: 14, fontWeight: '500', color: '#9ca3af' },
  durationTextActive: { color: '#fff' },
  durationPrice: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  durationPriceActive: { color: PRIMARY_COLOR },

  dateTimeRow: { marginBottom: 16 },
  dateTimeColumn: { marginBottom: 12 },
  dateTimeLabel: { fontSize: 13, color: '#9ca3af', marginBottom: 8 },
  dateGrid: { flexDirection: 'row', gap: 8 },
  dateOption: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  dateOptionActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    borderColor: PRIMARY_COLOR,
  },
  dateText: { fontSize: 13, color: '#9ca3af' },
  dateTextActive: { color: '#fff' },

  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  timeOptionActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    borderColor: PRIMARY_COLOR,
  },
  timeText: { fontSize: 13, color: '#9ca3af' },
  timeTextActive: { color: '#fff' },

  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  locationText: { fontSize: 15, color: '#fff', flex: 1 },
  locationPlaceholder: { fontSize: 15, color: '#6b7280', flex: 1 },
  locationArrow: { fontSize: 20, color: '#6b7280' },

  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },

  priceSummary: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceLabel: { fontSize: 14, color: '#9ca3af' },
  priceValue: { fontSize: 14, color: '#fff' },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 12,
    marginTop: 4,
    marginBottom: 0,
  },
  totalLabel: { fontSize: 16, fontWeight: '600', color: '#fff' },
  totalValue: { fontSize: 18, fontWeight: '700', color: PRIMARY_COLOR },

  footer: {
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#0a0a0a',
  },
  submitButton: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  modalContainer: { flex: 1, backgroundColor: '#0a0a0a' },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#fff' },
  modalContent: { flex: 1, paddingHorizontal: 16 },

  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  locationOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationOptionText: { flex: 1, marginLeft: 12 },
  locationOptionTitle: { fontSize: 15, fontWeight: '600', color: '#fff' },
  locationOptionSubtitle: { fontSize: 13, color: '#9ca3af', marginTop: 2 },

  manualSection: { marginTop: 24 },
  manualLabel: { fontSize: 12, fontWeight: '600', color: '#6b7280', marginBottom: 8, letterSpacing: 0.5 },
  manualInputRow: { flexDirection: 'row', gap: 8 },
  manualInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  manualSetButton: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manualSetButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  spotsSection: { marginTop: 24, marginBottom: 32 },
  spotsLabel: { fontSize: 12, fontWeight: '600', color: '#6b7280', marginBottom: 12, letterSpacing: 0.5 },
  spotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  spotImage: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#1a1a1a' },
  spotInfo: { flex: 1, marginLeft: 12 },
  spotName: { fontSize: 15, fontWeight: '500', color: '#fff' },
  spotCategory: { fontSize: 13, color: '#6b7280', marginTop: 2 },
});
