import React, { useEffect, useRef } from 'react';
import { Stack, useSegments, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { QueryProvider } from '../src/context/QueryProvider';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const PRIMARY_COLOR = '#2563eb';

function useProtectedRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const segments = useSegments();
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (isLoading) {
      hasNavigated.current = false;
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inProtectedGroup = segments[0] === '(customer)' || segments[0] === '(photographer)';

    // Not authenticated and trying to access protected route
    if (!isAuthenticated && inProtectedGroup && !hasNavigated.current) {
      hasNavigated.current = true;
      router.replace('/');
      return;
    }

    // Reset navigation flag when on welcome/auth screens
    if (!inProtectedGroup) {
      hasNavigated.current = false;
    }
  }, [isAuthenticated, isLoading, segments, user]);
}

function RootNavigator() {
  const { isLoading } = useAuth();
  useProtectedRoute();

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

export default function RootLayout() {
  return (
    <QueryProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <RootNavigator />
      </AuthProvider>
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
