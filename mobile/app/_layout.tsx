import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { QueryProvider } from '../src/context/QueryProvider';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { StripeProvider } from '@stripe/stripe-react-native';
import api from '../src/api/client';

const PRIMARY_COLOR = '#2563eb';

function RootNavigator() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(customer)" />
      <Stack.Screen name="(photographer)" />
    </Stack>
  );
}

function AppWithStripe() {
  const [publishableKey, setPublishableKey] = useState<string>('');
  const [isLoadingStripe, setIsLoadingStripe] = useState(true);
  const [stripeError, setStripeError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStripeConfig() {
      try {
        const response = await api.get('/stripe/config');
        if (response.data?.publishableKey) {
          setPublishableKey(response.data.publishableKey);
        } else if (response.data?.configured === false) {
          console.log('Stripe not configured yet');
        }
      } catch (error: any) {
        console.log('Failed to fetch Stripe config:', error?.message);
        setStripeError('Payment system unavailable');
      } finally {
        setIsLoadingStripe(false);
      }
    }
    fetchStripeConfig();
  }, []);

  if (isLoadingStripe) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }

  if (stripeError && !publishableKey) {
    console.log('Stripe error but continuing without payment:', stripeError);
  }

  return (
    <StripeProvider
      publishableKey={publishableKey || 'pk_test_placeholder'}
      merchantIdentifier="merchant.com.snapnow.app"
    >
      <AuthProvider>
        <StatusBar style="light" />
        <RootNavigator />
      </AuthProvider>
    </StripeProvider>
  );
}

export default function RootLayout() {
  return (
    <QueryProvider>
      <AppWithStripe />
    </QueryProvider>
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
