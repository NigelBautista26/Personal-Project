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
  const [tempHour, setTempHour] = useState(14);
  const [tempMinute, setTempMinute] = useState(0);
  const [tempAmPm, setTempAmPm] = useState<'AM' | 'PM'>('PM');
  const hourScrollRef = useRef<ScrollView>(null);
  const minuteScrollRef = useRef<ScrollView>(null);
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

  const hours = Array.from({ length: 12 }, (_, i) => i + 1); // 1-12
  const minutes = Array.from({ length: 60 }, (_, i) => i); // 0-59

  const openTimePicker = () => {
    // Parse current selectedTime to set temp values
    const [h, m] = selectedTime.split(':').map(Number);
    const hour12 = h % 12 || 12;
    setTempHour(hour12);
    setTempMinute(m);
    setTempAmPm(h >= 12 ? 'PM' : 'AM');
    setShowTimePicker(true);
  };

  const confirmTime = () => {
    let hour24 = tempHour;
    if (tempAmPm === 'PM' && tempHour !== 12) hour24 = tempHour + 12;
    if (tempAmPm === 'AM' && tempHour === 12) hour24 = 0;
    const timeStr = `${hour24.toString().padStart(2, '0')}:${tempMinute.toString().padStart(2, '0')}`;
    setSelectedTime(timeStr);
    setShowTimePicker(false);
  };

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

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Photographer Card - Both Steps */}
        <View style={styles.photographerCard}>
          <Image
            source={{ uri: getImageUrl(photographer?.profilePicture || photographer?.profileImageUrl) || 'https://via.placeholder.com/60' }}
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
              
              <View style={styles.wheelPickerRow}>
                {/* Date Picker */}
                <View style={styles.wheelPickerColumn}>
                  <Text style={styles.wheelPickerLabel}>Date</Text>
                  <View style={styles.spinnerContainer}>
                    <TouchableOpacity 
                      style={styles.spinnerArrow}
                      onPress={() => {
                        const currentIdx = dateOptions.findIndex(d => d.value === selectedDate);
                        if (currentIdx > 0) setSelectedDate(dateOptions[currentIdx - 1].value);
                      }}
                    >
                      <Text style={styles.spinnerArrowText}>▲</Text>
                    </TouchableOpacity>
                    <View style={styles.spinnerValueContainer}>
                      <Text style={styles.spinnerValue}>
                        {dateOptions.find(d => d.value === selectedDate)?.label || 'Select'}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.spinnerArrow}
                      onPress={() => {
                        const currentIdx = dateOptions.findIndex(d => d.value === selectedDate);
                        if (currentIdx < dateOptions.length - 1) setSelectedDate(dateOptions[currentIdx + 1].value);
                      }}
                    >
                      <Text style={styles.spinnerArrowText}>▼</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Hour Picker */}
                <View style={styles.wheelPickerColumn}>
                  <Text style={styles.wheelPickerLabel}>Hour</Text>
                  <View style={styles.spinnerContainer}>
                    <TouchableOpacity 
                      style={styles.spinnerArrow}
                      onPress={() => {
                        const [h, m] = selectedTime.split(':').map(Number);
                        const newH = h === 0 ? 23 : h - 1;
                        setSelectedTime(`${newH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
                      }}
                    >
                      <Text style={styles.spinnerArrowText}>▲</Text>
                    </TouchableOpacity>
                    <View style={styles.spinnerValueContainer}>
                      <Text style={styles.spinnerValue}>{selectedTime.split(':')[0]}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.spinnerArrow}
                      onPress={() => {
                        const [h, m] = selectedTime.split(':').map(Number);
                        const newH = h === 23 ? 0 : h + 1;
                        setSelectedTime(`${newH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
                      }}
                    >
                      <Text style={styles.spinnerArrowText}>▼</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Minute Picker */}
                <View style={styles.wheelPickerColumn}>
                  <Text style={styles.wheelPickerLabel}>Minute</Text>
                  <View style={styles.spinnerContainer}>
                    <TouchableOpacity 
                      style={styles.spinnerArrow}
                      onPress={() => {
                        const [h, m] = selectedTime.split(':').map(Number);
                        const newM = m === 0 ? 59 : m - 1;
                        setSelectedTime(`${h.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`);
                      }}
                    >
                      <Text style={styles.spinnerArrowText}>▲</Text>
                    </TouchableOpacity>
                    <View style={styles.spinnerValueContainer}>
                      <Text style={styles.spinnerValue}>{selectedTime.split(':')[1]}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.spinnerArrow}
                      onPress={() => {
                        const [h, m] = selectedTime.split(':').map(Number);
                        const newM = m === 59 ? 0 : m + 1;
                        setSelectedTime(`${h.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`);
                      }}
                    >
                      <Text style={styles.spinnerArrowText}>▼</Text>
                    </TouchableOpacity>
                  </View>
                </View>
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
          <ScrollView style={styles.modalContent} contentContainerStyle={styles.dateGridContainer}>
            <View style={styles.dateGrid}>
              {dateOptions.map((date) => {
                const d = new Date(date.value);
                const dayNum = d.getDate();
                const dayName = d.toLocaleDateString('en-GB', { weekday: 'short' });
                const month = d.toLocaleDateString('en-GB', { month: 'short' });
                const isSelected = selectedDate === date.value;
                const isToday = date.value === new Date().toISOString().split('T')[0];
                return (
                  <TouchableOpacity
                    key={date.value}
                    style={[
                      styles.dateCard,
                      isSelected && styles.dateCardActive,
                    ]}
                    onPress={() => {
                      setSelectedDate(date.value);
                      setShowDatePicker(false);
                    }}
                  >
                    <Text style={[styles.dateDayName, isSelected && styles.dateTextActive]}>
                      {dayName}
                    </Text>
                    <Text style={[styles.dateDayNum, isSelected && styles.dateTextActive]}>
                      {dayNum}
                    </Text>
                    <Text style={[styles.dateMonth, isSelected && styles.dateTextActive]}>
                      {month}
                    </Text>
                    {isToday && <View style={[styles.todayDot, isSelected && styles.todayDotActive]} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Time Picker Modal - Wheel Style */}
      <Modal
        visible={showTimePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.wheelModalOverlay}>
          <View style={styles.wheelModalContent}>
            <View style={styles.wheelModalHeader}>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <Text style={styles.wheelModalCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.wheelModalTitle}>Select Time</Text>
              <TouchableOpacity onPress={confirmTime}>
                <Text style={styles.wheelModalDone}>Done</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.wheelContainer}>
              {/* Hour Column */}
              <View style={styles.wheelColumn}>
                <Text style={styles.wheelLabel}>Hour</Text>
                <ScrollView 
                  ref={hourScrollRef}
                  style={styles.wheelScroll}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={44}
                  decelerationRate="fast"
                >
                  <View style={{ height: 66 }} />
                  {hours.map((h) => (
                    <TouchableOpacity
                      key={h}
                      style={[styles.wheelItem, tempHour === h && styles.wheelItemActive]}
                      onPress={() => setTempHour(h)}
                    >
                      <Text style={[styles.wheelItemText, tempHour === h && styles.wheelItemTextActive]}>
                        {h}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <View style={{ height: 66 }} />
                </ScrollView>
              </View>

              {/* Minute Column */}
              <View style={styles.wheelColumn}>
                <Text style={styles.wheelLabel}>Min</Text>
                <ScrollView 
                  ref={minuteScrollRef}
                  style={styles.wheelScroll}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={44}
                  decelerationRate="fast"
                >
                  <View style={{ height: 66 }} />
                  {minutes.map((m) => (
                    <TouchableOpacity
                      key={m}
                      style={[styles.wheelItem, tempMinute === m && styles.wheelItemActive]}
                      onPress={() => setTempMinute(m)}
                    >
                      <Text style={[styles.wheelItemText, tempMinute === m && styles.wheelItemTextActive]}>
                        {m.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <View style={{ height: 66 }} />
                </ScrollView>
              </View>

              {/* AM/PM Column */}
              <View style={styles.wheelColumn}>
                <Text style={styles.wheelLabel}></Text>
                <View style={styles.amPmContainer}>
                  <TouchableOpacity
                    style={[styles.amPmButton, tempAmPm === 'AM' && styles.amPmButtonActive]}
                    onPress={() => setTempAmPm('AM')}
                  >
                    <Text style={[styles.amPmText, tempAmPm === 'AM' && styles.amPmTextActive]}>AM</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.amPmButton, tempAmPm === 'PM' && styles.amPmButtonActive]}
                    onPress={() => setTempAmPm('PM')}
                  >
                    <Text style={[styles.amPmText, tempAmPm === 'PM' && styles.amPmTextActive]}>PM</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Selection Indicator */}
            <View style={styles.wheelSelectionIndicator} pointerEvents="none" />
          </View>
        </View>
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
  contentContainer: { paddingBottom: 20 },
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

  dateGridContainer: { paddingVertical: 16 },
  dateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 10,
    paddingHorizontal: 4,
  },
  dateCard: {
    width: '22%',
    aspectRatio: 0.85,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  dateCardActive: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
  },
  dateDayName: { fontSize: 12, color: '#9ca3af', marginBottom: 2 },
  dateDayNum: { fontSize: 24, fontWeight: '700', color: '#fff' },
  dateMonth: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  dateTextActive: { color: '#fff' },
  todayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PRIMARY_COLOR,
    marginTop: 4,
  },
  todayDotActive: { backgroundColor: '#fff' },

  wheelModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  wheelModalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  wheelModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  wheelModalCancel: { fontSize: 16, color: '#9ca3af' },
  wheelModalTitle: { fontSize: 17, fontWeight: '600', color: '#fff' },
  wheelModalDone: { fontSize: 16, fontWeight: '600', color: PRIMARY_COLOR },
  wheelContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    height: 220,
  },
  wheelColumn: {
    flex: 1,
    alignItems: 'center',
    maxWidth: 100,
  },
  wheelLabel: { fontSize: 13, color: '#6b7280', marginBottom: 8, height: 18 },
  wheelScroll: {
    height: 176,
  },
  wheelItem: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelItemActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    borderRadius: 8,
  },
  wheelItemText: { fontSize: 22, color: '#6b7280' },
  wheelItemTextActive: { color: '#fff', fontWeight: '600' },
  wheelSelectionIndicator: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: 120,
    height: 44,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    pointerEvents: 'none',
  },
  amPmContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  amPmButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  amPmButtonActive: {
    backgroundColor: PRIMARY_COLOR,
  },
  amPmText: { fontSize: 16, color: '#6b7280', textAlign: 'center' },
  amPmTextActive: { color: '#fff', fontWeight: '600' },

  // Wheel Picker Styles
  wheelPickerRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  wheelPickerColumn: {
    flex: 1,
  },
  wheelPickerLabel: { fontSize: 13, color: '#9ca3af', marginBottom: 8 },
  wheelPickerContainer: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  wheelPickerScroll: {
    height: 48,
  },
  wheelPickerItem: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  wheelPickerItemActive: {
    backgroundColor: PRIMARY_COLOR,
  },
  wheelPickerText: { fontSize: 15, color: '#9ca3af' },
  wheelPickerTextActive: { color: '#fff', fontWeight: '600' },
  
  // Spinner Styles
  spinnerContainer: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  spinnerArrow: {
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  spinnerArrowText: {
    fontSize: 12,
    color: '#6b7280',
  },
  spinnerValueContainer: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  spinnerValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },

  // Inline Date Picker Styles
  inlineDateScroll: { marginTop: 8 },
  inlineDateContent: { paddingRight: 16, gap: 10 },
  inlineDateCard: {
    width: 70,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inlineDateCardActive: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
  },
  inlineDateDayName: { fontSize: 11, color: '#9ca3af', marginBottom: 2 },
  inlineDateDayNum: { fontSize: 22, fontWeight: '700', color: '#fff' },
  inlineDateMonth: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  inlineDateTextActive: { color: '#fff' },
  inlineTodayDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: PRIMARY_COLOR,
    marginTop: 4,
  },
  inlineTodayDotActive: { backgroundColor: '#fff' },

  // Inline Time Picker Styles
  inlineTimeContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  inlineTimeColumn: {
    flex: 1,
    alignItems: 'center',
  },
  inlineTimeLabel: { fontSize: 12, color: '#6b7280', marginBottom: 8, height: 16 },
  inlineTimeScroll: {
    height: 150,
  },
  inlineTimeItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginVertical: 2,
    borderRadius: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  inlineTimeItemActive: {
    backgroundColor: PRIMARY_COLOR,
  },
  inlineTimeText: { fontSize: 18, color: '#6b7280' },
  inlineTimeTextActive: { color: '#fff', fontWeight: '600' },
  inlineAmPmContainer: {
    gap: 8,
    paddingTop: 20,
  },
  inlineAmPmButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  inlineAmPmButtonActive: {
    backgroundColor: PRIMARY_COLOR,
  },
  inlineAmPmText: { fontSize: 15, color: '#6b7280', fontWeight: '500' },
  inlineAmPmTextActive: { color: '#fff', fontWeight: '600' },
  selectedTimeDisplay: {
    textAlign: 'center',
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 12,
  },

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
