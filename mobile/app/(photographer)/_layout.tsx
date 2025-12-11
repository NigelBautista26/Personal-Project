import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Tabs, router } from 'expo-router';
import { Home, Calendar, DollarSign, User } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import PhotographerOnboardingScreen from '../../src/screens/PhotographerOnboarding';
import PendingVerificationScreen from '../../src/screens/PendingVerification';
import RejectedScreen from '../../src/screens/Rejected';

const PRIMARY_COLOR = '#2563eb';

export default function PhotographerLayout() {
  const { photographerProfile, isLoading, user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user)) {
      router.replace('/');
    }
  }, [isLoading, isAuthenticated, user]);

  if (isLoading || !isAuthenticated || !user || user.role !== 'photographer') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }

  if (!photographerProfile || photographerProfile.verificationStatus === undefined) {
    return <PhotographerOnboardingScreen />;
  }

  if (photographerProfile.verificationStatus === 'pending_review') {
    return <PendingVerificationScreen />;
  }

  if (photographerProfile.verificationStatus === 'rejected') {
    return <RejectedScreen />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#000',
          borderTopColor: 'rgba(37,99,235,0.3)',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
        },
        tabBarActiveTintColor: PRIMARY_COLOR,
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: 'Earnings',
          tabBarIcon: ({ color, size }) => <DollarSign size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
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
