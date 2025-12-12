import React, { useState, useRef } from 'react';
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
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Clock, MapPin, Navigation, X, ChevronRight, CreditCard, Lock } from 'lucide-react-native';
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
  ],
};

const formatDateShort = (dateStr: string) => {
  const date = new Date(dateStr);
  const day = date.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${months[date.getMonth()]}`;
};

const formatDateFull = (dateStr: string) => {
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatTime12h = (time: string) => {
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
};

export default function BookingScreen() {
  const { id, duration: durationParam } = useLocalSearchParams<{ id: string; duration?: string }>();
  const queryClient = useQueryClient();
  const webViewRef = useRef<WebView>(null);
  
  const [step, setStep] = useState(1);
  const [duration, setDuration] = useState(Number(durationParam) || 1);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('14:00');
  const [location, setLocation] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showPaymentWebView, setShowPaymentWebView] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [manualLocation, setManualLocation] = useState('');

  const { data: photographer, isLoading } = useQuery({
    queryKey: ['photographer', id],
    queryFn: () => snapnowApi.getPhotographer(id!),
    enabled: !!id,
  });

  const handleContinueToPayment = () => {
    if (!selectedDate) {
      Alert.alert('Missing Information', 'Please select a date for your session.');
      return;
    }
    if (!location.trim()) {
      Alert.alert('Missing Information', 'Please enter a location for your session.');
      return;
    }
    setStep(2);
  };

  const handleOpenPayment = () => {
    setShowPaymentWebView(true);
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      router.back();
    }
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
    for (let i = 0; i <= 14; i++) {
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

  // Build the web booking URL with all the parameters
  const webBookingUrl = `${API_URL}/book/${id}?duration=${duration}&date=${selectedDate}&time=${selectedTime}&location=${encodeURIComponent(location)}&step=2`;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1 }}>
      {/* Header with Progress */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} testID="button-back">
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Book Session</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressBar}>
        <View style={[styles.progressStep, step >= 1 && styles.progressStepActive]} />
        <View style={[styles.progressStep, step >= 2 && styles.progressStepActive]} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Photographer Card - Both Steps */}
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

        {step === 1 ? (
          <>
            {/* Step 1: Session Duration */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Clock size={18} color={PRIMARY_COLOR} />
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

            {/* Date & Time */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Calendar size={18} color={PRIMARY_COLOR} />
                <Text style={styles.sectionTitle}>Date & Time</Text>
              </View>
              <View style={styles.dateTimeRow}>
                <TouchableOpacity 
                  style={styles.dateTimePicker}
                  onPress={() => setShowDatePicker(true)}
                  testID="button-date-picker"
                >
                  <View style={styles.dateTimePickerContent}>
                    <Text style={styles.dateTimeLabel}>Date</Text>
                    <Text style={styles.dateTimeValue}>
                      {selectedDate ? formatDateShort(selectedDate) : 'Select'}
                    </Text>
                  </View>
                  <Calendar size={18} color="#6b7280" />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.dateTimePicker}
                  onPress={() => setShowTimePicker(true)}
                  testID="button-time-picker"
                >
                  <View style={styles.dateTimePickerContent}>
                    <Text style={styles.dateTimeLabel}>Time</Text>
                    <Text style={styles.dateTimeValue}>{formatTime12h(selectedTime)}</Text>
                  </View>
                  <Clock size={18} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Meeting Location */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MapPin size={18} color={PRIMARY_COLOR} />
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
                <ChevronRight size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Price Preview */}
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
          </>
        ) : (
          <>
            {/* Step 2: Booking Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Booking Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Duration</Text>
                <Text style={styles.summaryValue}>{duration} hour{duration > 1 ? 's' : ''}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Date</Text>
                <Text style={styles.summaryValue}>{formatDateFull(selectedDate)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Time</Text>
                <Text style={styles.summaryValue}>{selectedTime}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Location</Text>
                <Text style={styles.summaryValue}>{location}</Text>
              </View>
            </View>

            {/* Price Breakdown */}
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

            {/* Payment Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <CreditCard size={18} color={PRIMARY_COLOR} />
                <Text style={styles.sectionTitle}>Payment</Text>
              </View>
              
              <View style={styles.sandboxNotice}>
                <Text style={styles.sandboxText}>
                  Sandbox Mode - Use test card: 4242 4242 4242 4242, any future date, any CVC
                </Text>
              </View>

              <TouchableOpacity
                style={styles.cardInputPlaceholder}
                onPress={handleOpenPayment}
                testID="button-open-payment"
              >
                <CreditCard size={20} color="#6b7280" />
                <Text style={styles.cardInputText}>Tap to enter card details</Text>
                <ChevronRight size={18} color="#6b7280" />
              </TouchableOpacity>

              <View style={styles.securedBy}>
                <Lock size={12} color="#6b7280" />
                <Text style={styles.securedByText}>Secured by Stripe</Text>
              </View>
            </View>
          </>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={step === 1 ? handleContinueToPayment : handleOpenPayment}
          testID="button-submit"
        >
          <Text style={styles.submitButtonText}>
            {step === 1 ? 'Continue to Payment' : `Pay £${totalPrice.toFixed(2)}`}
          </Text>
        </TouchableOpacity>
      </View>
      </View>
      </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Payment WebView Modal */}
      <Modal
        visible={showPaymentWebView}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowPaymentWebView(false)}
      >
        <SafeAreaView style={styles.webViewContainer}>
          <View style={styles.webViewHeader}>
            <TouchableOpacity onPress={() => setShowPaymentWebView(false)} style={styles.webViewClose}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.webViewTitle}>Complete Payment</Text>
            <View style={{ width: 40 }} />
          </View>
          <WebView
            ref={webViewRef}
            source={{ uri: webBookingUrl }}
            style={styles.webView}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            sharedCookiesEnabled={true}
            thirdPartyCookiesEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.webViewLoading}>
                <ActivityIndicator size="large" color={PRIMARY_COLOR} />
                <Text style={styles.webViewLoadingText}>Loading payment form...</Text>
              </View>
            )}
            onNavigationStateChange={(navState) => {
              if (navState.url.includes('/bookings') || navState.url.includes('success=true')) {
                setShowPaymentWebView(false);
                queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
                Alert.alert(
                  'Booking Confirmed!',
                  'Your payment was successful and booking request has been sent.',
                  [{ text: 'OK', onPress: () => router.replace('/(customer)/bookings') }]
                );
              }
            }}
          />
        </SafeAreaView>
      </Modal>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Date</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {dateOptions.map((date) => (
              <TouchableOpacity
                key={date.value}
                style={[
                  styles.modalOption,
                  selectedDate === date.value && styles.modalOptionActive,
                ]}
                onPress={() => {
                  setSelectedDate(date.value);
                  setShowDatePicker(false);
                }}
              >
                <Text style={[
                  styles.modalOptionText,
                  selectedDate === date.value && styles.modalOptionTextActive,
                ]}>
                  {date.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Time Picker Modal */}
      <Modal
        visible={showTimePicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Time</Text>
            <TouchableOpacity onPress={() => setShowTimePicker(false)}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {timeSlots.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.modalOption,
                  selectedTime === time && styles.modalOptionActive,
                ]}
                onPress={() => {
                  setSelectedTime(time);
                  setShowTimePicker(false);
                }}
              >
                <Text style={[
                  styles.modalOptionText,
                  selectedTime === time && styles.modalOptionTextActive,
                ]}>
                  {formatTime12h(time)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Location Picker Modal */}
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
              <Text style={styles.spotsLabel}>POPULAR PHOTO SPOTS</Text>
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
  },
  backButton: { padding: 8 },
  title: { fontSize: 18, fontWeight: '600', color: '#fff' },
  placeholder: { width: 40 },
  
  progressBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  progressStep: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  progressStepActive: {
    backgroundColor: PRIMARY_COLOR,
  },

  content: { flex: 1, paddingHorizontal: 16 },
  loader: { marginTop: 100 },
  
  photographerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
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
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#fff' },
  
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

  dateTimeRow: { flexDirection: 'row', gap: 12 },
  dateTimePicker: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  dateTimePickerContent: {},
  dateTimeLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  dateTimeValue: { fontSize: 15, fontWeight: '500', color: '#fff' },

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

  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  summaryTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 16 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: { fontSize: 14, color: '#6b7280' },
  summaryValue: { fontSize: 14, color: '#fff' },

  sandboxNotice: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  sandboxText: { fontSize: 12, color: '#9ca3af', textAlign: 'center' },
  
  cardInputPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardInputText: { fontSize: 15, color: '#6b7280', flex: 1 },
  
  securedBy: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  securedByText: { fontSize: 12, color: '#6b7280' },

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
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  webViewContainer: { flex: 1, backgroundColor: '#0a0a0a' },
  webViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  webViewClose: { padding: 8 },
  webViewTitle: { fontSize: 18, fontWeight: '600', color: '#fff' },
  webView: { flex: 1, backgroundColor: '#0a0a0a' },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  webViewLoadingText: { color: '#9ca3af', marginTop: 16, fontSize: 14 },

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
  modalOption: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  modalOptionActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
  },
  modalOptionText: { fontSize: 16, color: '#fff' },
  modalOptionTextActive: { color: PRIMARY_COLOR, fontWeight: '600' },

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
