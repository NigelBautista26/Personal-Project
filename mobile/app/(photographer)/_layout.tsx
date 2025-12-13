import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import PhotographerOnboardingScreen from '../../src/screens/PhotographerOnboarding';
import PendingVerificationScreen from '../../src/screens/PendingVerification';
import RejectedScreen from '../../src/screens/Rejected';

const PRIMARY_COLOR = '#2563eb';

export default function PhotographerLayout() {
  const { photographerProfile, isLoading, user, isAuthenticated, isProfileLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'photographer') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }

  if (!user.hasPhotographerProfile) {
    return <PhotographerOnboardingScreen />;
  }

  if (photographerProfile) {
    if (photographerProfile.verificationStatus === 'pending_review') {
      return <PendingVerificationScreen />;
    }
    if (photographerProfile.verificationStatus === 'rejected') {
      return <RejectedScreen />;
    }
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="booking/[id]" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
});
