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
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Clock, MapPin, MessageSquare } from 'lucide-react-native';
import { snapnowApi } from '../../../src/api/snapnowApi';

const PRIMARY_COLOR = '#2563eb';

export default function BookingScreen() {
  const { id, duration: durationParam } = useLocalSearchParams<{ id: string; duration?: string }>();
  const queryClient = useQueryClient();
  
  const [duration, setDuration] = useState(Number(durationParam) || 1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const { data: photographer, isLoading } = useQuery({
    queryKey: ['photographer', id],
    queryFn: () => snapnowApi.getPhotographer(Number(id)),
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

  const totalPrice = (photographer?.hourlyRate || 0) * duration;
  const dateOptions = generateDateOptions();

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
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color={PRIMARY_COLOR} />
            <Text style={styles.sectionTitle}>Select Date</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.dateGrid}>
              {dateOptions.map((date) => (
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

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={20} color={PRIMARY_COLOR} />
            <Text style={styles.sectionTitle}>Select Time</Text>
          </View>
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

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={20} color={PRIMARY_COLOR} />
            <Text style={styles.sectionTitle}>Duration</Text>
          </View>
          <View style={styles.durationGrid}>
            {[1, 2, 3, 4].map((hours) => (
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
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color={PRIMARY_COLOR} />
            <Text style={styles.sectionTitle}>Location</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Enter meeting location..."
            placeholderTextColor="#6b7280"
            value={location}
            onChangeText={setLocation}
            testID="input-location"
          />
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
            numberOfLines={4}
            textAlignVertical="top"
            testID="input-notes"
          />
        </View>

        <View style={styles.priceSummary}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Rate</Text>
            <Text style={styles.priceValue}>£{photographer?.hourlyRate}/hour</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Duration</Text>
            <Text style={styles.priceValue}>{duration} hour{duration > 1 ? 's' : ''}</Text>
          </View>
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>£{totalPrice}</Text>
          </View>
        </View>
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
            <Text style={styles.submitButtonText}>Request Booking - £{totalPrice}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  loader: { marginTop: 100 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: { padding: 4 },
  title: { fontSize: 18, fontWeight: '600', color: '#fff' },
  placeholder: { width: 32 },
  content: { flex: 1, padding: 20 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#fff' },
  dateGrid: { flexDirection: 'row', gap: 10 },
  dateOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  dateOptionActive: {
    backgroundColor: 'rgba(37,99,235,0.2)',
    borderColor: PRIMARY_COLOR,
  },
  dateText: { fontSize: 14, color: '#9ca3af' },
  dateTextActive: { color: '#fff', fontWeight: '500' },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  timeOption: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  timeOptionActive: {
    backgroundColor: 'rgba(37,99,235,0.2)',
    borderColor: PRIMARY_COLOR,
  },
  timeText: { fontSize: 14, color: '#9ca3af' },
  timeTextActive: { color: '#fff', fontWeight: '500' },
  durationGrid: { flexDirection: 'row', gap: 10 },
  durationOption: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  durationOptionActive: {
    backgroundColor: 'rgba(37,99,235,0.2)',
    borderColor: PRIMARY_COLOR,
  },
  durationText: { fontSize: 14, color: '#9ca3af' },
  durationTextActive: { color: '#fff', fontWeight: '500' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  textArea: { height: 100, paddingTop: 16 },
  priceSummary: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
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
    marginBottom: 0,
  },
  totalLabel: { fontSize: 16, fontWeight: '600', color: '#fff' },
  totalValue: { fontSize: 20, fontWeight: '700', color: PRIMARY_COLOR },
  footer: {
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  submitButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
