# SnapNow Mobile App - Complete Conversion Guide

This is a 100% complete guide to convert the SnapNow web application to a React Native/Expo mobile app.

**API Base URL:** `https://8ec47177-4071-40f8-9c7a-f64803516488-00-2z7o4xrlajvin.janeway.replit.dev`

> **Note:** This is the development URL. If it stops working, check with the Replit project owner for the current URL.

---

## Table of Contents

1. [CRITICAL: Architectural Patterns](#1-critical-architectural-patterns)
2. [Project Setup](#2-project-setup)
3. [Project Structure](#3-project-structure)
4. [Core Files](#4-core-files)
5. [Customer Screens](#5-customer-screens)
6. [Photographer Screens](#6-photographer-screens)
7. [Shared Components](#7-shared-components)
8. [API Endpoints Reference](#8-api-endpoints-reference)
9. [Design System](#9-design-system)
10. [Demo Accounts](#10-demo-accounts)

---

## 1. CRITICAL: Architectural Patterns

**READ THIS FIRST.** These patterns are essential for the app to work correctly.

### 1.1 Authentication Flow

The web app uses **session-based authentication**. For mobile, you have two options:

**Option A: Session cookies (simpler)**
```tsx
// In axios config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,  // Send cookies with requests
});
```

**Option B: Token-based (recommended for mobile)**
- Store auth token in SecureStore
- Send as Authorization header
- Backend would need JWT support added

### 1.2 Photographer Routing Decision (CRITICAL)

**The login screen should NOT decide where photographers go.** This is the most common mistake.

#### Why?
The login API response only tells you:
- `user.role` = 'photographer'
- `hasPhotographerProfile` = true/false

It does NOT tell you the `verificationStatus` (pending_review, verified, rejected). That comes from `/api/photographers/me`.

#### Correct Pattern:

**Step 1: Login handler - keep it simple**
```tsx
const handleLogin = async () => {
  const user = await api.post('/api/auth/login', { email, password });
  
  // Just route to role-based entry point - nothing more
  if (user.role === 'photographer') {
    router.replace('/(photographer)');  // Single entry point
  } else if (user.role === 'customer') {
    router.replace('/(customer)');
  } else if (user.role === 'admin') {
    router.replace('/(admin)');
  }
};
```

**Step 2: Photographer layout makes the routing decision**
```tsx
// app/(photographer)/_layout.tsx
import { Redirect, Slot } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

export default function PhotographerLayout() {
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['photographer-profile'],
    queryFn: async () => {
      const response = await api.get('/api/photographers/me');
      return response.data;
    },
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  // No profile exists = needs onboarding
  if (error || !profile) {
    return <Redirect href="/(photographer)/onboarding" />;
  }

  // Profile exists but not verified = show pending screen
  if (profile.verificationStatus === 'pending_review') {
    return <Redirect href="/(photographer)/pending" />;
  }

  // Profile was rejected
  if (profile.verificationStatus === 'rejected') {
    return <Redirect href="/(photographer)/rejected" />;
  }

  // Verified = show normal photographer screens
  return <Slot />;
}
```

**Step 3: Onboarding/Pending screens also check state**
```tsx
// app/(photographer)/onboarding.tsx
export default function OnboardingScreen() {
  const { data: profile } = useQuery({
    queryKey: ['photographer-profile'],
    queryFn: () => api.get('/api/photographers/me').then(r => r.data),
  });

  // If profile already exists, don't show onboarding
  if (profile) {
    return <Redirect href="/(photographer)" />;
  }

  // Show onboarding form...
}
```

This prevents:
- Anna (existing photographer) from seeing onboarding again
- Loops between screens
- Stale state issues

### 1.3 Customer Routing (Simpler)

Customers don't have verification, so routing is simpler:

```tsx
// app/(customer)/_layout.tsx
export default function CustomerLayout() {
  return <Slot />;  // Just render customer screens
}
```

### 1.4 Expo Router File Structure

For Expo Router, use this file structure:

```
app/
├── _layout.tsx           # Root layout (AuthProvider, QueryProvider)
├── index.tsx             # Redirect based on auth state
├── welcome.tsx           # Welcome screen (unauthenticated)
├── login.tsx             # Login screen
├── signup.tsx            # Signup screen
├── (customer)/           # Customer group
│   ├── _layout.tsx       # Customer layout with tabs
│   ├── index.tsx         # Home/Explore screen
│   ├── bookings.tsx      # Bookings list
│   ├── booking/[id].tsx  # Booking detail
│   ├── photographer/[id].tsx  # Photographer profile
│   └── profile.tsx       # Customer profile
├── (photographer)/       # Photographer group
│   ├── _layout.tsx       # THE GUARD - checks profile & verification
│   ├── index.tsx         # Dashboard (only if verified)
│   ├── bookings.tsx      # Bookings list
│   ├── booking/[id].tsx  # Booking detail
│   ├── earnings.tsx      # Earnings screen
│   ├── onboarding.tsx    # Onboarding (no profile yet)
│   └── pending.tsx       # Pending verification
```

### 1.5 Root Layout with Auth Check

```tsx
// app/_layout.tsx
import { Slot, useRouter, useSegments } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

export default function RootLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(customer)' || segments[0] === '(photographer)';

    if (!user && inAuthGroup) {
      // Not logged in but trying to access protected route
      router.replace('/welcome');
    } else if (user && !inAuthGroup) {
      // Logged in but on auth screens
      if (user.role === 'photographer') {
        router.replace('/(photographer)');
      } else {
        router.replace('/(customer)');
      }
    }
  }, [user, loading, segments]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Slot />
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

### 1.6 Image URL Handling

All image URLs from the API are **relative paths**. Always prepend the API base URL:

```tsx
// WRONG
<Image source={{ uri: photographer.profilePicture }} />

// CORRECT
const API_URL = 'https://8ec47177-4071-40f8-9c7a-f64803516488-00-2z7o4xrlajvin.janeway.replit.dev';
<Image source={{ uri: `${API_URL}${photographer.profilePicture}` }} />
```

### 1.7 Payment Flow

The web app uses Stripe with authorization holds:
1. Customer submits booking → Payment intent created (not charged)
2. Photographer accepts → Payment captured
3. Photographer declines/expires → Payment cancelled

For mobile, use `@stripe/stripe-react-native`:
```tsx
import { useStripe } from '@stripe/stripe-react-native';

const { confirmPayment } = useStripe();

// When booking
const { paymentIntent } = await api.post('/api/stripe/create-payment-intent', {
  amount: totalAmount,
  bookingId,
});

const { error } = await confirmPayment(paymentIntent.client_secret, {
  paymentMethodType: 'Card',
});
```

### 1.8 Error Handling Pattern

Always handle API errors consistently:

```tsx
const mutation = useMutation({
  mutationFn: async (data) => {
    const response = await api.post('/api/bookings', data);
    return response.data;
  },
  onSuccess: (data) => {
    queryClient.invalidateQueries({ queryKey: ['bookings'] });
    Alert.alert('Success', 'Booking created!');
    router.back();
  },
  onError: (error: any) => {
    const message = error.response?.data?.message || 'Something went wrong';
    Alert.alert('Error', message);
  },
});
```

### 1.9 Query Invalidation

When data changes, invalidate related queries:

```tsx
// After photographer accepts booking
queryClient.invalidateQueries({ queryKey: ['photographer-bookings'] });
queryClient.invalidateQueries({ queryKey: ['earnings'] });

// After uploading photos
queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
queryClient.invalidateQueries({ queryKey: ['booking-photos', bookingId] });
```

### 1.10 Platform Fee Calculations

**Customer pays:** Base price + 10% service fee
**Photographer receives:** Base price - 20% platform commission

```tsx
const hourlyRate = 100;
const duration = 2;

const basePrice = hourlyRate * duration;        // £200
const serviceFee = basePrice * 0.10;            // £20 (customer pays)
const totalCustomerPays = basePrice + serviceFee; // £220

const platformFee = basePrice * 0.20;           // £40 (platform takes)
const photographerEarnings = basePrice - platformFee; // £160
```

---

## 2. Project Setup

### Create Expo Project

```bash
npx create-expo-app SnapNowMobile --template blank-typescript
cd SnapNowMobile
```

### Install All Dependencies

```bash
# Navigation
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs

# Data fetching
npm install @tanstack/react-query axios

# Expo packages
npx expo install react-native-screens react-native-safe-area-context \
  expo-location expo-image-picker expo-secure-store react-native-maps \
  expo-camera expo-media-library react-native-gesture-handler \
  @react-native-async-storage/async-storage

# UI
npm install react-native-reanimated lucide-react-native
```

---

## 2. Project Structure

```
SnapNowMobile/
├── App.tsx
├── src/
│   ├── api/
│   │   └── client.ts
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── screens/
│   │   ├── customer/
│   │   │   ├── WelcomeScreen.tsx
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── SignupScreen.tsx
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── PhotographerProfileScreen.tsx
│   │   │   ├── BookingScreen.tsx
│   │   │   ├── CustomerBookingsScreen.tsx
│   │   │   ├── CustomerBookingDetailScreen.tsx
│   │   │   ├── CustomerProfileScreen.tsx
│   │   │   └── PhotoSpotsScreen.tsx
│   │   └── photographer/
│   │       ├── PhotographerOnboardingScreen.tsx
│   │       ├── PhotographerPendingScreen.tsx
│   │       ├── PhotographerDashboardScreen.tsx
│   │       ├── PhotographerBookingsScreen.tsx
│   │       ├── PhotographerBookingDetailScreen.tsx
│   │       ├── PhotographerProfileEditScreen.tsx
│   │       ├── PhotoUploadScreen.tsx
│   │       ├── EarningsScreen.tsx
│   │       └── EditingRequestsScreen.tsx
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Avatar.tsx
│   │   ├── StarRating.tsx
│   │   ├── MapView.tsx
│   │   └── PhotoGrid.tsx
│   └── types/
│       └── index.ts
```

---

## 3. Core Files

### App.tsx

```tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Customer screens
import WelcomeScreen from './src/screens/customer/WelcomeScreen';
import LoginScreen from './src/screens/customer/LoginScreen';
import SignupScreen from './src/screens/customer/SignupScreen';
import HomeScreen from './src/screens/customer/HomeScreen';
import PhotographerProfileScreen from './src/screens/customer/PhotographerProfileScreen';
import BookingScreen from './src/screens/customer/BookingScreen';
import CustomerBookingsScreen from './src/screens/customer/CustomerBookingsScreen';
import CustomerBookingDetailScreen from './src/screens/customer/CustomerBookingDetailScreen';
import CustomerProfileScreen from './src/screens/customer/CustomerProfileScreen';

// Photographer screens
import PhotographerOnboardingScreen from './src/screens/photographer/PhotographerOnboardingScreen';
import PhotographerPendingScreen from './src/screens/photographer/PhotographerPendingScreen';
import PhotographerDashboardScreen from './src/screens/photographer/PhotographerDashboardScreen';
import PhotographerBookingsScreen from './src/screens/photographer/PhotographerBookingsScreen';
import PhotographerBookingDetailScreen from './src/screens/photographer/PhotographerBookingDetailScreen';
import EarningsScreen from './src/screens/photographer/EarningsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const queryClient = new QueryClient();

function CustomerTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: '#0a0a0a', borderTopColor: '#333' } }}>
      <Tab.Screen name="Explore" component={HomeScreen} options={{ tabBarLabel: 'Explore' }} />
      <Tab.Screen name="Bookings" component={CustomerBookingsScreen} options={{ tabBarLabel: 'Bookings' }} />
      <Tab.Screen name="Profile" component={CustomerProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

function PhotographerTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: '#0a0a0a', borderTopColor: '#333' } }}>
      <Tab.Screen name="Dashboard" component={PhotographerDashboardScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Bookings" component={PhotographerBookingsScreen} options={{ tabBarLabel: 'Bookings' }} />
      <Tab.Screen name="Earnings" component={EarningsScreen} options={{ tabBarLabel: 'Earnings' }} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { user, photographerProfile, loading } = useAuth();
  
  if (loading) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      ) : user.role === 'photographer' ? (
        <>
          {!photographerProfile ? (
            <Stack.Screen name="Onboarding" component={PhotographerOnboardingScreen} />
          ) : photographerProfile.verificationStatus !== 'verified' ? (
            <Stack.Screen name="Pending" component={PhotographerPendingScreen} />
          ) : (
            <>
              <Stack.Screen name="PhotographerMain" component={PhotographerTabs} />
              <Stack.Screen name="PhotographerBookingDetail" component={PhotographerBookingDetailScreen} />
            </>
          )}
        </>
      ) : (
        <>
          <Stack.Screen name="CustomerMain" component={CustomerTabs} />
          <Stack.Screen name="PhotographerProfile" component={PhotographerProfileScreen} />
          <Stack.Screen name="Booking" component={BookingScreen} />
          <Stack.Screen name="CustomerBookingDetail" component={CustomerBookingDetailScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
```

### src/api/client.ts

```tsx
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://8ec47177-4071-40f8-9c7a-f64803516488-00-2z7o4xrlajvin.janeway.replit.dev';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('authToken');
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_URL };
```

### src/context/AuthContext.tsx

```tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../api/client';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'photographer' | 'admin';
  profilePicture?: string;
}

interface PhotographerProfile {
  id: number;
  userId: number;
  hourlyRate: number;
  city: string;
  latitude: number;
  longitude: number;
  bio?: string;
  portfolio: string[];
  verificationStatus: 'pending_review' | 'verified' | 'rejected';
  instagramUrl?: string;
  websiteUrl?: string;
}

interface AuthContextType {
  user: User | null;
  photographerProfile: PhotographerProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshPhotographerProfile: () => Promise<void>;
}

interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'photographer';
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [photographerProfile, setPhotographerProfile] = useState<PhotographerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const response = await api.get('/api/auth/me');
      setUser(response.data);
      return response.data;
    } catch {
      setUser(null);
      return null;
    }
  };

  const refreshPhotographerProfile = async () => {
    try {
      const response = await api.get('/api/photographers/me');
      setPhotographerProfile(response.data);
    } catch {
      setPhotographerProfile(null);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      const userData = await refreshUser();
      if (userData?.role === 'photographer') {
        await refreshPhotographerProfile();
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password });
    const userData = response.data;
    setUser(userData);
    if (userData.role === 'photographer') {
      await refreshPhotographerProfile();
    }
  };

  const signup = async (data: SignupData) => {
    const response = await api.post('/api/auth/register', data);
    setUser(response.data);
  };

  const logout = async () => {
    await api.post('/api/auth/logout');
    await SecureStore.deleteItemAsync('authToken');
    setUser(null);
    setPhotographerProfile(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      photographerProfile, 
      loading, 
      login, 
      signup, 
      logout, 
      refreshUser,
      refreshPhotographerProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

### src/types/index.ts

```tsx
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'photographer' | 'admin';
  profilePicture?: string;
}

export interface Photographer {
  id: number;
  userId: number;
  hourlyRate: number;
  city: string;
  latitude: number;
  longitude: number;
  bio?: string;
  portfolio: string[];
  profilePicture?: string;
  firstName: string;
  lastName: string;
  averageRating?: number;
  reviewCount?: number;
  verificationStatus: 'pending_review' | 'verified' | 'rejected';
  instagramUrl?: string;
  websiteUrl?: string;
}

export interface Booking {
  id: number;
  customerId: number;
  photographerId: number;
  sessionDate: string;
  sessionTime: string;
  duration: number;
  location: string;
  latitude: number;
  longitude: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'declined' | 'expired';
  totalAmount: number;
  platformFee: number;
  photographerEarnings: number;
  notes?: string;
  meetingPointLat?: number;
  meetingPointLng?: number;
  meetingPointNote?: string;
  photosUploaded?: boolean;
  photosDownloaded?: boolean;
  dismissed?: boolean;
  photographerDismissed?: boolean;
  expiresAt?: string;
  createdAt: string;
  photographer?: Photographer;
  customer?: User;
}

export interface Review {
  id: number;
  bookingId: number;
  customerId: number;
  photographerId: number;
  rating: number;
  comment?: string;
  photographerResponse?: string;
  createdAt: string;
  customer?: User;
}

export interface Earning {
  id: number;
  photographerId: number;
  bookingId: number;
  amount: number;
  platformFee: number;
  netAmount: number;
  status: 'held' | 'pending' | 'paid';
  createdAt: string;
}

export interface EditingRequest {
  id: number;
  bookingId: number;
  customerId: number;
  photographerId: number;
  status: 'requested' | 'accepted' | 'declined' | 'in_progress' | 'delivered' | 'revision_requested' | 'completed';
  photoCount: number;
  totalCost: number;
  platformFee: number;
  photographerEarnings: number;
  notes?: string;
  deliveredPhotos?: string[];
  revisionCount: number;
  createdAt: string;
}

export interface PhotoSpot {
  id: number;
  name: string;
  description: string;
  city: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  tags: string[];
}

export interface Message {
  id: number;
  bookingId: number;
  senderId: number;
  content: string;
  createdAt: string;
  isRead: boolean;
}
```

---

## 4. Customer Screens

### WelcomeScreen.tsx

```tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function WelcomeScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>📸</Text>
          <Text style={styles.title}>SnapNow</Text>
          <Text style={styles.subtitle}>Find professional photographers wherever you travel</Text>
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🌍</Text>
            <Text style={styles.featureText}>Discover local photographers</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>📅</Text>
            <Text style={styles.featureText}>Book instantly</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>💳</Text>
            <Text style={styles.featureText}>Secure payments</Text>
          </View>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={() => navigation.navigate('Signup' as never)}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Login' as never)}
          >
            <Text style={styles.secondaryButtonText}>I already have an account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  content: { flex: 1, padding: 24, justifyContent: 'space-between' },
  logoContainer: { alignItems: 'center', marginTop: 60 },
  logo: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#888', textAlign: 'center', paddingHorizontal: 20 },
  features: { gap: 16 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#1a1a1a', padding: 16, borderRadius: 12 },
  featureIcon: { fontSize: 24 },
  featureText: { fontSize: 16, color: '#fff' },
  buttons: { gap: 12, marginBottom: 20 },
  primaryButton: { backgroundColor: '#6366f1', padding: 16, borderRadius: 12, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  secondaryButton: { padding: 16, alignItems: 'center' },
  secondaryButtonText: { color: '#6366f1', fontSize: 16 },
});
```

### LoginScreen.tsx

```tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Signup' as never)}>
          <Text style={styles.linkText}>Don't have an account? Sign up</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  content: { flex: 1, padding: 24 },
  backButton: { marginBottom: 24 },
  backText: { color: '#6366f1', fontSize: 16 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#888', marginBottom: 32 },
  form: { gap: 16 },
  input: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: '#333' },
  button: { backgroundColor: '#6366f1', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  linkText: { color: '#6366f1', fontSize: 14, textAlign: 'center', marginTop: 24 },
});
```

### SignupScreen.tsx

```tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

export default function SignupScreen() {
  const navigation = useNavigation();
  const { signup } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'photographer'>('customer');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!firstName || !lastName || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signup({ firstName, lastName, email, password, role });
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Join SnapNow today</Text>

        <View style={styles.roleSelector}>
          <TouchableOpacity 
            style={[styles.roleButton, role === 'customer' && styles.roleButtonActive]}
            onPress={() => setRole('customer')}
          >
            <Text style={[styles.roleText, role === 'customer' && styles.roleTextActive]}>I need a photographer</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.roleButton, role === 'photographer' && styles.roleButtonActive]}
            onPress={() => setRole('photographer')}
          >
            <Text style={[styles.roleText, role === 'photographer' && styles.roleTextActive]}>I'm a photographer</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="First name"
              placeholderTextColor="#666"
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Last name"
              placeholderTextColor="#666"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
          <Text style={styles.linkText}>Already have an account? Sign in</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  content: { flex: 1, padding: 24 },
  backButton: { marginBottom: 24 },
  backText: { color: '#6366f1', fontSize: 16 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#888', marginBottom: 24 },
  roleSelector: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  roleButton: { flex: 1, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#333', alignItems: 'center' },
  roleButtonActive: { borderColor: '#6366f1', backgroundColor: '#6366f120' },
  roleText: { color: '#888', fontSize: 14 },
  roleTextActive: { color: '#6366f1' },
  form: { gap: 16 },
  row: { flexDirection: 'row', gap: 12 },
  input: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: '#333' },
  halfInput: { flex: 1 },
  button: { backgroundColor: '#6366f1', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  linkText: { color: '#6366f1', fontSize: 14, textAlign: 'center', marginTop: 24 },
});
```

### HomeScreen.tsx (Photographer Discovery)

```tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, SafeAreaView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import api, { API_URL } from '../../api/client';
import { Photographer } from '../../types';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');

  const { data: photographers, isLoading } = useQuery({
    queryKey: ['photographers'],
    queryFn: async () => {
      const response = await api.get('/api/photographers');
      return response.data as Photographer[];
    },
  });

  const filteredPhotographers = photographers?.filter(p => 
    p.city.toLowerCase().includes(search.toLowerCase()) ||
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  const renderPhotographer = ({ item }: { item: Photographer }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('PhotographerProfile' as never, { photographerId: item.id } as never)}
    >
      <Image 
        source={{ uri: item.profilePicture ? `${API_URL}${item.profilePicture}` : 'https://via.placeholder.com/100' }}
        style={styles.avatar}
      />
      <View style={styles.cardContent}>
        <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
        <Text style={styles.city}>📍 {item.city}</Text>
        <View style={styles.ratingRow}>
          {item.averageRating ? (
            <>
              <Text style={styles.rating}>⭐ {item.averageRating.toFixed(1)}</Text>
              <Text style={styles.reviews}>({item.reviewCount} reviews)</Text>
            </>
          ) : (
            <Text style={styles.noRating}>New photographer</Text>
          )}
        </View>
        <Text style={styles.price}>£{item.hourlyRate}/hour</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Find Photographers</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by city or name..."
          placeholderTextColor="#666"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#6366f1" style={styles.loader} />
      ) : (
        <FlatList
          data={filteredPhotographers}
          renderItem={renderPhotographer}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No photographers found</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#333' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  searchInput: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 14, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: '#333' },
  list: { padding: 16, gap: 16 },
  card: { backgroundColor: '#1a1a1a', borderRadius: 16, padding: 16, flexDirection: 'row', gap: 16 },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  cardContent: { flex: 1, justifyContent: 'center' },
  name: { fontSize: 18, fontWeight: '600', color: '#fff', marginBottom: 4 },
  city: { fontSize: 14, color: '#888', marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  rating: { fontSize: 14, color: '#fbbf24' },
  reviews: { fontSize: 12, color: '#666' },
  noRating: { fontSize: 12, color: '#888', fontStyle: 'italic' },
  price: { fontSize: 16, fontWeight: '600', color: '#6366f1' },
  loader: { marginTop: 40 },
  emptyText: { color: '#888', textAlign: 'center', marginTop: 40 },
});
```

### PhotographerProfileScreen.tsx

```tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, SafeAreaView, ActivityIndicator, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import api, { API_URL } from '../../api/client';
import { Photographer, Review } from '../../types';

const { width } = Dimensions.get('window');
const imageSize = (width - 48 - 8) / 3;

export default function PhotographerProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { photographerId } = route.params as { photographerId: number };

  const { data: photographer, isLoading } = useQuery({
    queryKey: ['photographer', photographerId],
    queryFn: async () => {
      const response = await api.get(`/api/photographers/${photographerId}`);
      return response.data as Photographer;
    },
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews', photographerId],
    queryFn: async () => {
      const response = await api.get(`/api/photographers/${photographerId}/reviews`);
      return response.data as Review[];
    },
  });

  if (isLoading || !photographer) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#6366f1" style={styles.loader} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.profileHeader}>
          <Image 
            source={{ uri: photographer.profilePicture ? `${API_URL}${photographer.profilePicture}` : 'https://via.placeholder.com/120' }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{photographer.firstName} {photographer.lastName}</Text>
          <Text style={styles.city}>📍 {photographer.city}</Text>
          
          {photographer.averageRating ? (
            <View style={styles.ratingRow}>
              <Text style={styles.rating}>⭐ {photographer.averageRating.toFixed(1)}</Text>
              <Text style={styles.reviews}>({photographer.reviewCount} reviews)</Text>
            </View>
          ) : (
            <Text style={styles.newPhotographer}>New photographer</Text>
          )}
        </View>

        {photographer.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bio}>{photographer.bio}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Portfolio</Text>
          <View style={styles.portfolio}>
            {photographer.portfolio?.map((url, index) => (
              <Image 
                key={index}
                source={{ uri: `${API_URL}${url}` }}
                style={styles.portfolioImage}
              />
            ))}
          </View>
        </View>

        {reviews && reviews.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            {reviews.slice(0, 3).map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>
                    {review.customer?.firstName} {review.customer?.lastName}
                  </Text>
                  <Text style={styles.reviewRating}>{'⭐'.repeat(review.rating)}</Text>
                </View>
                {review.comment && <Text style={styles.reviewComment}>{review.comment}</Text>}
              </View>
            ))}
          </View>
        )}

        <View style={styles.bookingSection}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Hourly Rate</Text>
            <Text style={styles.price}>£{photographer.hourlyRate}/hour</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.bookButton}
            onPress={() => navigation.navigate('Booking' as never, { photographerId: photographer.id } as never)}
          >
            <Text style={styles.bookButtonText}>Book Session</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  loader: { marginTop: 100 },
  backButton: { padding: 16 },
  backText: { color: '#6366f1', fontSize: 16 },
  profileHeader: { alignItems: 'center', padding: 16 },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 16 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  city: { fontSize: 16, color: '#888', marginBottom: 8 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rating: { fontSize: 16, color: '#fbbf24' },
  reviews: { fontSize: 14, color: '#666' },
  newPhotographer: { fontSize: 14, color: '#888', fontStyle: 'italic' },
  section: { padding: 16, borderTopWidth: 1, borderTopColor: '#333' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#fff', marginBottom: 12 },
  bio: { fontSize: 14, color: '#ccc', lineHeight: 22 },
  portfolio: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  portfolioImage: { width: imageSize, height: imageSize, borderRadius: 8 },
  reviewCard: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 12, marginBottom: 8 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  reviewerName: { fontSize: 14, fontWeight: '600', color: '#fff' },
  reviewRating: { fontSize: 12 },
  reviewComment: { fontSize: 14, color: '#ccc' },
  bookingSection: { padding: 16, marginBottom: 40 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  priceLabel: { fontSize: 16, color: '#888' },
  price: { fontSize: 20, fontWeight: 'bold', color: '#6366f1' },
  bookButton: { backgroundColor: '#6366f1', padding: 16, borderRadius: 12, alignItems: 'center' },
  bookButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
```

### BookingScreen.tsx

```tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import api from '../../api/client';
import { Photographer } from '../../types';

export default function BookingScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const queryClient = useQueryClient();
  const { photographerId } = route.params as { photographerId: number };

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(1);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const { data: photographer, isLoading } = useQuery({
    queryKey: ['photographer', photographerId],
    queryFn: async () => {
      const response = await api.get(`/api/photographers/${photographerId}`);
      return response.data as Photographer;
    },
  });

  const bookMutation = useMutation({
    mutationFn: async () => {
      if (!coords) throw new Error('Please set a location');
      
      const totalAmount = (photographer?.hourlyRate || 0) * duration;
      const serviceFee = totalAmount * 0.1;
      const platformFee = totalAmount * 0.2;
      const photographerEarnings = totalAmount - platformFee;

      const response = await api.post('/api/bookings', {
        photographerId,
        sessionDate: date,
        sessionTime: time,
        duration,
        location,
        latitude: coords.lat,
        longitude: coords.lng,
        totalAmount: totalAmount + serviceFee,
        platformFee,
        photographerEarnings,
        notes,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      Alert.alert('Success', 'Booking request sent!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Booking failed');
    },
  });

  const useCurrentLocation = async () => {
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
    
    if (address) {
      setLocation(`${address.street || ''}, ${address.city || ''}`);
    }
  };

  if (isLoading || !photographer) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#6366f1" style={styles.loader} />
      </SafeAreaView>
    );
  }

  const totalAmount = photographer.hourlyRate * duration;
  const serviceFee = totalAmount * 0.1;
  const grandTotal = totalAmount + serviceFee;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>Book Session</Text>
          <Text style={styles.subtitle}>with {photographer.firstName} {photographer.lastName}</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="2025-01-15"
              placeholderTextColor="#666"
              value={date}
              onChangeText={setDate}
            />

            <Text style={styles.label}>Time (HH:MM)</Text>
            <TextInput
              style={styles.input}
              placeholder="14:00"
              placeholderTextColor="#666"
              value={time}
              onChangeText={setTime}
            />

            <Text style={styles.label}>Duration (hours)</Text>
            <View style={styles.durationRow}>
              {[1, 2, 3, 4].map((h) => (
                <TouchableOpacity
                  key={h}
                  style={[styles.durationButton, duration === h && styles.durationButtonActive]}
                  onPress={() => setDuration(h)}
                >
                  <Text style={[styles.durationText, duration === h && styles.durationTextActive]}>{h}h</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder="Meeting point"
              placeholderTextColor="#666"
              value={location}
              onChangeText={setLocation}
            />
            <TouchableOpacity style={styles.locationButton} onPress={useCurrentLocation}>
              <Text style={styles.locationButtonText}>📍 Use Current Location</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Notes (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Any special requests..."
              placeholderTextColor="#666"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Booking Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Session ({duration}h × £{photographer.hourlyRate})</Text>
              <Text style={styles.summaryValue}>£{totalAmount}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Service fee (10%)</Text>
              <Text style={styles.summaryValue}>£{serviceFee.toFixed(2)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>£{grandTotal.toFixed(2)}</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.bookButton, bookMutation.isPending && styles.buttonDisabled]} 
            onPress={() => bookMutation.mutate()}
            disabled={bookMutation.isPending}
          >
            {bookMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.bookButtonText}>Send Booking Request</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.paymentNote}>
            You will only be charged if the photographer accepts your request
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  loader: { marginTop: 100 },
  backButton: { padding: 16 },
  backText: { color: '#6366f1', fontSize: 16 },
  content: { padding: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 16, color: '#888', marginBottom: 24 },
  form: { gap: 12 },
  label: { fontSize: 14, color: '#ccc', marginBottom: 4 },
  input: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 14, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: '#333' },
  textArea: { height: 80, textAlignVertical: 'top' },
  durationRow: { flexDirection: 'row', gap: 8 },
  durationButton: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#333', alignItems: 'center' },
  durationButtonActive: { borderColor: '#6366f1', backgroundColor: '#6366f120' },
  durationText: { color: '#888', fontSize: 16 },
  durationTextActive: { color: '#6366f1' },
  locationButton: { backgroundColor: '#1a1a1a', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  locationButtonText: { color: '#6366f1', fontSize: 14 },
  summary: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginTop: 24 },
  summaryTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { color: '#888', fontSize: 14 },
  summaryValue: { color: '#fff', fontSize: 14 },
  totalRow: { borderTopWidth: 1, borderTopColor: '#333', paddingTop: 8, marginTop: 8 },
  totalLabel: { color: '#fff', fontSize: 16, fontWeight: '600' },
  totalValue: { color: '#6366f1', fontSize: 18, fontWeight: 'bold' },
  bookButton: { backgroundColor: '#6366f1', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  buttonDisabled: { opacity: 0.6 },
  bookButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  paymentNote: { color: '#888', fontSize: 12, textAlign: 'center', marginTop: 12 },
});
```

### CustomerBookingsScreen.tsx

```tsx
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import { Booking } from '../../types';

const statusColors: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#22c55e',
  completed: '#6366f1',
  cancelled: '#ef4444',
  declined: '#ef4444',
  expired: '#888',
};

export default function CustomerBookingsScreen() {
  const navigation = useNavigation();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['customer-bookings'],
    queryFn: async () => {
      const response = await api.get('/api/customer/bookings');
      return response.data as Booking[];
    },
  });

  const renderBooking = ({ item }: { item: Booking }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('CustomerBookingDetail' as never, { bookingId: item.id } as never)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.photographerName}>
          {item.photographer?.firstName} {item.photographer?.lastName}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] + '20' }]}>
          <Text style={[styles.statusText, { color: statusColors[item.status] }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
      
      <View style={styles.cardDetails}>
        <Text style={styles.date}>📅 {item.sessionDate} at {item.sessionTime}</Text>
        <Text style={styles.location}>📍 {item.location}</Text>
        <Text style={styles.duration}>{item.duration}h session</Text>
      </View>
      
      <View style={styles.cardFooter}>
        <Text style={styles.total}>£{item.totalAmount}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#6366f1" style={styles.loader} />
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBooking}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📷</Text>
              <Text style={styles.emptyTitle}>No bookings yet</Text>
              <Text style={styles.emptyText}>Find a photographer and book your first session!</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#333' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  list: { padding: 16, gap: 12 },
  card: { backgroundColor: '#1a1a1a', borderRadius: 16, padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  photographerName: { fontSize: 18, fontWeight: '600', color: '#fff' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600' },
  cardDetails: { gap: 4, marginBottom: 12 },
  date: { fontSize: 14, color: '#ccc' },
  location: { fontSize: 14, color: '#888' },
  duration: { fontSize: 14, color: '#888' },
  cardFooter: { borderTopWidth: 1, borderTopColor: '#333', paddingTop: 12 },
  total: { fontSize: 18, fontWeight: 'bold', color: '#6366f1' },
  loader: { marginTop: 40 },
  emptyState: { alignItems: 'center', marginTop: 60, padding: 20 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#fff', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#888', textAlign: 'center' },
});
```

### CustomerBookingDetailScreen.tsx

```tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, Image, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { API_URL } from '../../api/client';
import { Booking } from '../../types';

const { width } = Dimensions.get('window');
const imageSize = (width - 48 - 8) / 3;

export default function CustomerBookingDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const queryClient = useQueryClient();
  const { bookingId } = route.params as { bookingId: number };

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      const response = await api.get(`/api/customer/bookings`);
      const bookings = response.data as Booking[];
      return bookings.find(b => b.id === bookingId);
    },
  });

  const { data: photos } = useQuery({
    queryKey: ['booking-photos', bookingId],
    queryFn: async () => {
      const response = await api.get(`/api/bookings/${bookingId}/photos`);
      return response.data;
    },
    enabled: booking?.status === 'completed' && booking?.photosUploaded,
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      await api.patch(`/api/bookings/${bookingId}/status`, { status: 'cancelled' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
      Alert.alert('Success', 'Booking cancelled');
      navigation.goBack();
    },
  });

  if (isLoading || !booking) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#6366f1" style={styles.loader} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.statusHeader}>
            <Text style={styles.title}>Booking Details</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Photographer</Text>
            <Text style={styles.photographerName}>
              {booking.photographer?.firstName} {booking.photographer?.lastName}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Session Details</Text>
            <Text style={styles.detail}>📅 {booking.sessionDate} at {booking.sessionTime}</Text>
            <Text style={styles.detail}>⏱️ {booking.duration} hour{booking.duration > 1 ? 's' : ''}</Text>
            <Text style={styles.detail}>📍 {booking.location}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Payment</Text>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Total paid</Text>
              <Text style={styles.paymentValue}>£{booking.totalAmount}</Text>
            </View>
            {booking.status === 'pending' && (
              <Text style={styles.paymentNote}>Payment will be charged when photographer accepts</Text>
            )}
          </View>

          {booking.status === 'completed' && booking.photosUploaded && photos && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Your Photos</Text>
              <View style={styles.photoGrid}>
                {photos.map((photo: any, index: number) => (
                  <Image 
                    key={index}
                    source={{ uri: `${API_URL}${photo.url}` }}
                    style={styles.photo}
                  />
                ))}
              </View>
            </View>
          )}

          {booking.status === 'pending' && (
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => {
                Alert.alert('Cancel Booking', 'Are you sure you want to cancel?', [
                  { text: 'No' },
                  { text: 'Yes, Cancel', style: 'destructive', onPress: () => cancelMutation.mutate() }
                ]);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel Booking</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: '#f59e0b',
    confirmed: '#22c55e',
    completed: '#6366f1',
    cancelled: '#ef4444',
    declined: '#ef4444',
    expired: '#888',
  };
  return colors[status] || '#888';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  loader: { marginTop: 100 },
  backButton: { padding: 16 },
  backText: { color: '#6366f1', fontSize: 16 },
  content: { padding: 16 },
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontSize: 14, fontWeight: '600' },
  card: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 12 },
  cardTitle: { fontSize: 14, color: '#888', marginBottom: 8 },
  photographerName: { fontSize: 18, fontWeight: '600', color: '#fff' },
  detail: { fontSize: 16, color: '#ccc', marginBottom: 4 },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between' },
  paymentLabel: { fontSize: 16, color: '#888' },
  paymentValue: { fontSize: 18, fontWeight: 'bold', color: '#6366f1' },
  paymentNote: { fontSize: 12, color: '#888', marginTop: 8 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 8 },
  photo: { width: imageSize, height: imageSize, borderRadius: 8 },
  cancelButton: { borderWidth: 1, borderColor: '#ef4444', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  cancelButtonText: { color: '#ef4444', fontSize: 16, fontWeight: '600' },
});
```

### CustomerProfileScreen.tsx

```tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../api/client';

export default function CustomerProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.profileCard}>
          <Image 
            source={{ uri: user?.profilePicture ? `${API_URL}${user.profilePicture}` : 'https://via.placeholder.com/80' }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Edit Profile</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Payment Methods</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Notifications</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Help & Support</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#333' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  content: { padding: 16 },
  profileCard: { alignItems: 'center', padding: 24, backgroundColor: '#1a1a1a', borderRadius: 16, marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 12 },
  name: { fontSize: 20, fontWeight: '600', color: '#fff', marginBottom: 4 },
  email: { fontSize: 14, color: '#888' },
  menu: { backgroundColor: '#1a1a1a', borderRadius: 16, overflow: 'hidden', marginBottom: 24 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#333' },
  menuText: { fontSize: 16, color: '#fff' },
  menuArrow: { fontSize: 16, color: '#888' },
  logoutButton: { borderWidth: 1, borderColor: '#ef4444', padding: 16, borderRadius: 12, alignItems: 'center' },
  logoutText: { color: '#ef4444', fontSize: 16, fontWeight: '600' },
});
```

---

## 5. Photographer Screens

### PhotographerOnboardingScreen.tsx

```tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import * as Location from 'expo-location';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function PhotographerOnboardingScreen() {
  const { refreshPhotographerProfile } = useAuth();
  const [hourlyRate, setHourlyRate] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!coords) throw new Error('Please set your location');
      if (!hourlyRate) throw new Error('Please set your hourly rate');
      if (!instagramUrl) throw new Error('Instagram URL is required for verification');

      await api.post('/api/photographers', {
        hourlyRate: parseInt(hourlyRate),
        city,
        latitude: coords.lat,
        longitude: coords.lng,
        bio,
        instagramUrl,
        websiteUrl: websiteUrl || null,
      });
    },
    onSuccess: async () => {
      await refreshPhotographerProfile();
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to create profile');
    },
  });

  const useCurrentLocation = async () => {
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
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>Set up your photographer profile to start accepting bookings</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Hourly Rate (£)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 75"
            placeholderTextColor="#666"
            value={hourlyRate}
            onChangeText={setHourlyRate}
            keyboardType="numeric"
          />

          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. London"
            placeholderTextColor="#666"
            value={city}
            onChangeText={setCity}
          />
          <TouchableOpacity style={styles.locationButton} onPress={useCurrentLocation}>
            <Text style={styles.locationButtonText}>📍 Use Current Location</Text>
          </TouchableOpacity>
          {coords && <Text style={styles.coordsText}>Location set ✓</Text>}

          <Text style={styles.label}>Bio (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell clients about yourself..."
            placeholderTextColor="#666"
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Instagram URL (required for verification)</Text>
          <TextInput
            style={styles.input}
            placeholder="https://instagram.com/yourprofile"
            placeholderTextColor="#666"
            value={instagramUrl}
            onChangeText={setInstagramUrl}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Website URL (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="https://yourwebsite.com"
            placeholderTextColor="#666"
            value={websiteUrl}
            onChangeText={setWebsiteUrl}
            autoCapitalize="none"
          />

          <TouchableOpacity 
            style={[styles.submitButton, createMutation.isPending && styles.buttonDisabled]}
            onPress={() => createMutation.mutate()}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Submit for Review</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  content: { flex: 1, padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#888', marginBottom: 32 },
  form: { gap: 12 },
  label: { fontSize: 14, color: '#ccc', marginTop: 8 },
  input: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 14, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: '#333' },
  textArea: { height: 100, textAlignVertical: 'top' },
  locationButton: { backgroundColor: '#1a1a1a', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  locationButtonText: { color: '#6366f1', fontSize: 14 },
  coordsText: { color: '#22c55e', fontSize: 12, marginTop: 4 },
  submitButton: { backgroundColor: '#6366f1', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24, marginBottom: 40 },
  buttonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
```

### PhotographerPendingScreen.tsx

```tsx
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function PhotographerPendingScreen() {
  const { logout, photographerProfile } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel' },
      { text: 'Logout', onPress: logout }
    ]);
  };

  const isRejected = photographerProfile?.verificationStatus === 'rejected';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>{isRejected ? '❌' : '⏳'}</Text>
        <Text style={styles.title}>
          {isRejected ? 'Application Rejected' : 'Under Review'}
        </Text>
        <Text style={styles.description}>
          {isRejected 
            ? 'Unfortunately, your application was not approved. Please contact support for more information.'
            : 'Your photographer application is being reviewed by our team. This usually takes 1-2 business days. We\'ll notify you once approved.'
          }
        </Text>

        <View style={styles.checklistCard}>
          <Text style={styles.checklistTitle}>What we look for:</Text>
          <Text style={styles.checklistItem}>✓ Professional portfolio on Instagram</Text>
          <Text style={styles.checklistItem}>✓ Quality photography work</Text>
          <Text style={styles.checklistItem}>✓ Complete profile information</Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  content: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  icon: { fontSize: 64, marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 16, textAlign: 'center' },
  description: { fontSize: 16, color: '#888', textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  checklistCard: { backgroundColor: '#1a1a1a', borderRadius: 16, padding: 20, width: '100%', marginBottom: 32 },
  checklistTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 12 },
  checklistItem: { fontSize: 14, color: '#ccc', marginBottom: 8 },
  logoutButton: { padding: 16 },
  logoutText: { color: '#ef4444', fontSize: 16 },
});
```

### PhotographerDashboardScreen.tsx

```tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Booking } from '../../types';

export default function PhotographerDashboardScreen() {
  const navigation = useNavigation();
  const { user, photographerProfile } = useAuth();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['photographer-bookings'],
    queryFn: async () => {
      const response = await api.get('/api/photographer/bookings');
      return response.data as Booking[];
    },
  });

  const { data: earnings } = useQuery({
    queryKey: ['earnings-summary', photographerProfile?.id],
    queryFn: async () => {
      const response = await api.get(`/api/earnings/photographer/${photographerProfile?.id}/summary`);
      return response.data;
    },
    enabled: !!photographerProfile?.id,
  });

  const pendingBookings = bookings?.filter(b => b.status === 'pending') || [];
  const confirmedBookings = bookings?.filter(b => b.status === 'confirmed') || [];
  const needsPhotoUpload = bookings?.filter(b => b.status === 'confirmed' && !b.photosUploaded) || [];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#6366f1" style={styles.loader} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {user?.firstName}!</Text>
          <Text style={styles.subtitle}>Here's your dashboard</Text>
        </View>

        {/* Earnings Summary */}
        <View style={styles.earningsCard}>
          <Text style={styles.cardTitle}>Earnings</Text>
          <View style={styles.earningsGrid}>
            <View style={styles.earningsItem}>
              <Text style={styles.earningsValue}>£{earnings?.total || 0}</Text>
              <Text style={styles.earningsLabel}>Total Earned</Text>
            </View>
            <View style={styles.earningsItem}>
              <Text style={styles.earningsValue}>£{earnings?.held || 0}</Text>
              <Text style={styles.earningsLabel}>Held</Text>
            </View>
            <View style={styles.earningsItem}>
              <Text style={[styles.earningsValue, { color: '#22c55e' }]}>£{earnings?.available || 0}</Text>
              <Text style={styles.earningsLabel}>Available</Text>
            </View>
          </View>
        </View>

        {/* Action Items */}
        {(pendingBookings.length > 0 || needsPhotoUpload.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚡ Action Required</Text>
            
            {pendingBookings.length > 0 && (
              <TouchableOpacity 
                style={styles.alertCard}
                onPress={() => navigation.navigate('Bookings' as never)}
              >
                <Text style={styles.alertIcon}>📥</Text>
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>{pendingBookings.length} pending request{pendingBookings.length > 1 ? 's' : ''}</Text>
                  <Text style={styles.alertDescription}>Respond before they expire</Text>
                </View>
              </TouchableOpacity>
            )}

            {needsPhotoUpload.length > 0 && (
              <TouchableOpacity 
                style={styles.alertCard}
                onPress={() => navigation.navigate('Bookings' as never)}
              >
                <Text style={styles.alertIcon}>📷</Text>
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>{needsPhotoUpload.length} session{needsPhotoUpload.length > 1 ? 's' : ''} awaiting photos</Text>
                  <Text style={styles.alertDescription}>Upload photos to release payment</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Upcoming Sessions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
          {confirmedBookings.length > 0 ? (
            confirmedBookings.slice(0, 3).map(booking => (
              <TouchableOpacity 
                key={booking.id} 
                style={styles.bookingCard}
                onPress={() => navigation.navigate('PhotographerBookingDetail' as never, { bookingId: booking.id } as never)}
              >
                <View style={styles.bookingHeader}>
                  <Text style={styles.customerName}>
                    {booking.customer?.firstName} {booking.customer?.lastName}
                  </Text>
                  <Text style={styles.bookingEarnings}>£{booking.photographerEarnings}</Text>
                </View>
                <Text style={styles.bookingDate}>📅 {booking.sessionDate} at {booking.sessionTime}</Text>
                <Text style={styles.bookingLocation}>📍 {booking.location}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No upcoming sessions</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  loader: { marginTop: 100 },
  header: { padding: 16 },
  greeting: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 16, color: '#888', marginTop: 4 },
  earningsCard: { backgroundColor: '#1a1a1a', margin: 16, borderRadius: 16, padding: 16 },
  cardTitle: { fontSize: 14, color: '#888', marginBottom: 12 },
  earningsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  earningsItem: { alignItems: 'center' },
  earningsValue: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  earningsLabel: { fontSize: 12, color: '#888', marginTop: 4 },
  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#fff', marginBottom: 12 },
  alertCard: { backgroundColor: '#f59e0b20', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  alertIcon: { fontSize: 24 },
  alertContent: { flex: 1 },
  alertTitle: { fontSize: 16, fontWeight: '600', color: '#f59e0b' },
  alertDescription: { fontSize: 12, color: '#f59e0b80' },
  bookingCard: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 8 },
  bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  customerName: { fontSize: 16, fontWeight: '600', color: '#fff' },
  bookingEarnings: { fontSize: 16, fontWeight: 'bold', color: '#22c55e' },
  bookingDate: { fontSize: 14, color: '#ccc', marginBottom: 4 },
  bookingLocation: { fontSize: 14, color: '#888' },
  emptyCard: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 24, alignItems: 'center' },
  emptyText: { color: '#888' },
});
```

### PhotographerBookingsScreen.tsx

```tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import { Booking } from '../../types';

const tabs = ['Pending', 'Confirmed', 'Completed'];

export default function PhotographerBookingsScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('Pending');

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['photographer-bookings'],
    queryFn: async () => {
      const response = await api.get('/api/photographer/bookings');
      return response.data as Booking[];
    },
  });

  const filteredBookings = bookings?.filter(b => {
    if (activeTab === 'Pending') return b.status === 'pending';
    if (activeTab === 'Confirmed') return b.status === 'confirmed';
    if (activeTab === 'Completed') return b.status === 'completed';
    return true;
  }) || [];

  const renderBooking = ({ item }: { item: Booking }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('PhotographerBookingDetail' as never, { bookingId: item.id } as never)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.customerName}>
          {item.customer?.firstName} {item.customer?.lastName}
        </Text>
        <Text style={styles.earnings}>£{item.photographerEarnings}</Text>
      </View>
      
      <View style={styles.cardDetails}>
        <Text style={styles.date}>📅 {item.sessionDate} at {item.sessionTime}</Text>
        <Text style={styles.location}>📍 {item.location}</Text>
        <Text style={styles.duration}>{item.duration}h session</Text>
      </View>

      {item.status === 'pending' && item.expiresAt && (
        <View style={styles.expiryBadge}>
          <Text style={styles.expiryText}>Expires soon - respond now</Text>
        </View>
      )}

      {item.status === 'confirmed' && !item.photosUploaded && (
        <View style={[styles.expiryBadge, { backgroundColor: '#6366f120' }]}>
          <Text style={[styles.expiryText, { color: '#6366f1' }]}>📷 Upload photos</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bookings</Text>
      </View>

      <View style={styles.tabs}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#6366f1" style={styles.loader} />
      ) : (
        <FlatList
          data={filteredBookings}
          renderItem={renderBooking}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No {activeTab.toLowerCase()} bookings</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { padding: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  tab: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#1a1a1a', alignItems: 'center' },
  tabActive: { backgroundColor: '#6366f1' },
  tabText: { color: '#888', fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  list: { padding: 16, gap: 12 },
  card: { backgroundColor: '#1a1a1a', borderRadius: 16, padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  customerName: { fontSize: 18, fontWeight: '600', color: '#fff' },
  earnings: { fontSize: 18, fontWeight: 'bold', color: '#22c55e' },
  cardDetails: { gap: 4 },
  date: { fontSize: 14, color: '#ccc' },
  location: { fontSize: 14, color: '#888' },
  duration: { fontSize: 14, color: '#888' },
  expiryBadge: { backgroundColor: '#f59e0b20', padding: 8, borderRadius: 8, marginTop: 12, alignItems: 'center' },
  expiryText: { color: '#f59e0b', fontSize: 12, fontWeight: '600' },
  loader: { marginTop: 40 },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#888', fontSize: 16 },
});
```

### PhotographerBookingDetailScreen.tsx

```tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import api from '../../api/client';
import { Booking } from '../../types';

export default function PhotographerBookingDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const queryClient = useQueryClient();
  const { bookingId } = route.params as { bookingId: number };

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      const response = await api.get('/api/photographer/bookings');
      const bookings = response.data as Booking[];
      return bookings.find(b => b.id === bookingId);
    },
  });

  const statusMutation = useMutation({
    mutationFn: async (status: string) => {
      await api.patch(`/api/bookings/${bookingId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photographer-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
    },
  });

  const handleAccept = () => {
    Alert.alert('Accept Booking', 'Accept this booking request?', [
      { text: 'Cancel' },
      { text: 'Accept', onPress: () => statusMutation.mutate('confirmed') }
    ]);
  };

  const handleDecline = () => {
    Alert.alert('Decline Booking', 'Are you sure you want to decline?', [
      { text: 'Cancel' },
      { text: 'Decline', style: 'destructive', onPress: () => statusMutation.mutate('declined') }
    ]);
  };

  const handleUploadPhotos = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      Alert.alert('Uploading', `Uploading ${result.assets.length} photos...`);
      // Implementation for uploading photos would go here
      // After upload, call: await api.post(`/api/bookings/${bookingId}/photos`, { photos: uploadedUrls });
    }
  };

  if (isLoading || !booking) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#6366f1" style={styles.loader} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>Booking Details</Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Customer</Text>
            <Text style={styles.customerName}>
              {booking.customer?.firstName} {booking.customer?.lastName}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Session Details</Text>
            <Text style={styles.detail}>📅 {booking.sessionDate} at {booking.sessionTime}</Text>
            <Text style={styles.detail}>⏱️ {booking.duration} hour{booking.duration > 1 ? 's' : ''}</Text>
            <Text style={styles.detail}>📍 {booking.location}</Text>
            {booking.notes && <Text style={styles.notes}>📝 {booking.notes}</Text>}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Earnings</Text>
            <View style={styles.earningsRow}>
              <Text style={styles.earningsLabel}>Your earnings</Text>
              <Text style={styles.earningsValue}>£{booking.photographerEarnings}</Text>
            </View>
            <Text style={styles.platformNote}>After 20% platform fee</Text>
          </View>

          {booking.status === 'pending' && (
            <View style={styles.actions}>
              <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
                <Text style={styles.acceptButtonText}>Accept Booking</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.declineButton} onPress={handleDecline}>
                <Text style={styles.declineButtonText}>Decline</Text>
              </TouchableOpacity>
            </View>
          )}

          {booking.status === 'confirmed' && !booking.photosUploaded && (
            <TouchableOpacity style={styles.uploadButton} onPress={handleUploadPhotos}>
              <Text style={styles.uploadButtonText}>📷 Upload Photos</Text>
            </TouchableOpacity>
          )}

          {booking.status === 'confirmed' && booking.photosUploaded && (
            <View style={styles.successCard}>
              <Text style={styles.successText}>✅ Photos delivered</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  loader: { marginTop: 100 },
  backButton: { padding: 16 },
  backText: { color: '#6366f1', fontSize: 16 },
  content: { padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  card: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 12 },
  cardTitle: { fontSize: 14, color: '#888', marginBottom: 8 },
  customerName: { fontSize: 18, fontWeight: '600', color: '#fff' },
  detail: { fontSize: 16, color: '#ccc', marginBottom: 4 },
  notes: { fontSize: 14, color: '#888', marginTop: 8, fontStyle: 'italic' },
  earningsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  earningsLabel: { fontSize: 16, color: '#888' },
  earningsValue: { fontSize: 24, fontWeight: 'bold', color: '#22c55e' },
  platformNote: { fontSize: 12, color: '#888', marginTop: 4 },
  actions: { gap: 12, marginTop: 24 },
  acceptButton: { backgroundColor: '#22c55e', padding: 16, borderRadius: 12, alignItems: 'center' },
  acceptButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  declineButton: { borderWidth: 1, borderColor: '#ef4444', padding: 16, borderRadius: 12, alignItems: 'center' },
  declineButtonText: { color: '#ef4444', fontSize: 16, fontWeight: '600' },
  uploadButton: { backgroundColor: '#6366f1', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  uploadButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  successCard: { backgroundColor: '#22c55e20', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  successText: { color: '#22c55e', fontSize: 16, fontWeight: '600' },
});
```

### EarningsScreen.tsx

```tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Earning } from '../../types';

export default function EarningsScreen() {
  const { photographerProfile } = useAuth();

  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['earnings-summary', photographerProfile?.id],
    queryFn: async () => {
      const response = await api.get(`/api/earnings/photographer/${photographerProfile?.id}/summary`);
      return response.data;
    },
    enabled: !!photographerProfile?.id,
  });

  const { data: earnings, isLoading: loadingEarnings } = useQuery({
    queryKey: ['earnings', photographerProfile?.id],
    queryFn: async () => {
      const response = await api.get(`/api/earnings/photographer/${photographerProfile?.id}`);
      return response.data as Earning[];
    },
    enabled: !!photographerProfile?.id,
  });

  if (loadingSummary || loadingEarnings) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#6366f1" style={styles.loader} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Earnings</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>£{summary?.total || 0}</Text>
              <Text style={styles.summaryLabel}>Total Earned</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: '#f59e0b' }]}>£{summary?.held || 0}</Text>
              <Text style={styles.summaryLabel}>Held</Text>
            </View>
          </View>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: '#22c55e' }]}>£{summary?.available || 0}</Text>
              <Text style={styles.summaryLabel}>Available</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: '#6366f1' }]}>£{summary?.paid || 0}</Text>
              <Text style={styles.summaryLabel}>Paid Out</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          {earnings && earnings.length > 0 ? (
            earnings.map(earning => (
              <View key={earning.id} style={styles.transactionCard}>
                <View style={styles.transactionHeader}>
                  <Text style={styles.transactionAmount}>£{earning.netAmount}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(earning.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(earning.status) }]}>
                      {earning.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.transactionDate}>
                  {new Date(earning.createdAt).toLocaleDateString()}
                </Text>
                <Text style={styles.platformFee}>Platform fee: £{earning.platformFee}</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No earnings yet</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    held: '#f59e0b',
    pending: '#22c55e',
    paid: '#6366f1',
  };
  return colors[status] || '#888';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  loader: { marginTop: 100 },
  header: { padding: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  summaryCard: { backgroundColor: '#1a1a1a', margin: 16, borderRadius: 16, padding: 20, gap: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
  summaryItem: { alignItems: 'center' },
  summaryValue: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  summaryLabel: { fontSize: 12, color: '#888', marginTop: 4 },
  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#fff', marginBottom: 12 },
  transactionCard: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 8 },
  transactionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  transactionAmount: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  transactionDate: { fontSize: 14, color: '#888' },
  platformFee: { fontSize: 12, color: '#666', marginTop: 4 },
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#888', fontSize: 16 },
});
```

---

## 6. Shared Components

### components/Button.tsx

```tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
}

export default function Button({ title, onPress, variant = 'primary', loading, disabled }: ButtonProps) {
  const buttonStyle = [
    styles.button,
    variant === 'secondary' && styles.secondary,
    variant === 'danger' && styles.danger,
    (loading || disabled) && styles.disabled,
  ];

  const textStyle = [
    styles.text,
    variant === 'secondary' && styles.secondaryText,
    variant === 'danger' && styles.dangerText,
  ];

  return (
    <TouchableOpacity style={buttonStyle} onPress={onPress} disabled={loading || disabled}>
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={textStyle}>{title}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { backgroundColor: '#6366f1', padding: 16, borderRadius: 12, alignItems: 'center' },
  secondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#333' },
  danger: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#ef4444' },
  disabled: { opacity: 0.6 },
  text: { color: '#fff', fontSize: 16, fontWeight: '600' },
  secondaryText: { color: '#fff' },
  dangerText: { color: '#ef4444' },
});
```

### components/Input.tsx

```tsx
import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export default function Input({ label, error, ...props }: InputProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholderTextColor="#666"
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: { fontSize: 14, color: '#ccc', marginBottom: 6 },
  input: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 14, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: '#333' },
  inputError: { borderColor: '#ef4444' },
  error: { color: '#ef4444', fontSize: 12, marginTop: 4 },
});
```

### components/Card.tsx

```tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#1a1a1a', borderRadius: 16, padding: 16 },
});
```

### components/StarRating.tsx

```tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface StarRatingProps {
  rating: number;
  onRate?: (rating: number) => void;
  size?: number;
}

export default function StarRating({ rating, onRate, size = 24 }: StarRatingProps) {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map(star => (
        <TouchableOpacity
          key={star}
          onPress={() => onRate?.(star)}
          disabled={!onRate}
        >
          <Text style={[styles.star, { fontSize: size }]}>
            {star <= rating ? '⭐' : '☆'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 4 },
  star: { color: '#fbbf24' },
});
```

---

## 7. API Endpoints Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| PATCH | `/api/users/me` | Update user profile |
| POST | `/api/users/me/change-password` | Change password |
| POST | `/api/users/me/profile-picture` | Update profile picture |

### Photographers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/photographers` | List all verified photographers |
| GET | `/api/photographers/:id` | Get photographer by ID |
| GET | `/api/photographers/me` | Get current photographer profile |
| POST | `/api/photographers` | Create photographer profile |
| PATCH | `/api/photographers/me` | Update photographer profile |
| POST | `/api/photographers/me/portfolio` | Add portfolio image |
| DELETE | `/api/photographers/me/portfolio` | Remove portfolio image |
| PUT | `/api/photographers/me/portfolio/reorder` | Reorder portfolio |

### Bookings

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create booking |
| GET | `/api/customer/bookings` | Get customer's bookings |
| GET | `/api/photographer/bookings` | Get photographer's bookings |
| PATCH | `/api/bookings/:id/status` | Update booking status |
| POST | `/api/bookings/:id/dismiss` | Dismiss booking notification |

### Photos

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings/:id/photos` | Get booking photos |
| POST | `/api/bookings/:id/photos` | Upload photos |
| POST | `/api/bookings/:id/photos/downloaded` | Mark photos downloaded |

### Reviews

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/photographers/:id/reviews` | Get photographer reviews |
| POST | `/api/bookings/:id/reviews` | Create review |
| POST | `/api/reviews/:id/respond` | Respond to review |

### Earnings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/earnings/photographer/:id` | Get earnings history |
| GET | `/api/earnings/photographer/:id/summary` | Get earnings summary |

### Editing Services

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/editing-services/:photographerId` | Get editing service settings |
| PUT | `/api/editing-services/me/settings` | Update editing settings |
| POST | `/api/editing-requests` | Create editing request |
| GET | `/api/editing-requests/booking/:id` | Get editing request for booking |
| PATCH | `/api/editing-requests/:id/status` | Update request status |
| POST | `/api/editing-requests/:id/deliver` | Deliver edited photos |

### Messages

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings/:id/messages` | Get booking messages |
| POST | `/api/bookings/:id/messages` | Send message |
| GET | `/api/messages/unread-count` | Get unread message count |
| POST | `/api/bookings/:id/messages/mark-read` | Mark messages as read |

### Live Location

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings/:id/live-location` | Update live location |
| GET | `/api/bookings/:id/live-location` | Get live locations |
| DELETE | `/api/bookings/:id/live-location` | Stop sharing location |

### Stripe Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stripe/config` | Get Stripe config |
| POST | `/api/stripe/create-payment-intent` | Create payment intent |
| POST | `/api/stripe/confirm-payment` | Confirm payment |
| POST | `/api/stripe/cancel-payment-intent` | Cancel payment |

---

## 8. Design System

### Colors

```tsx
const colors = {
  background: '#0a0a0a',
  card: '#1a1a1a',
  border: '#333333',
  primary: '#6366f1',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  textPrimary: '#ffffff',
  textSecondary: '#888888',
  textMuted: '#666666',
};
```

### Typography

```tsx
const typography = {
  h1: { fontSize: 32, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16 },
  caption: { fontSize: 14 },
  small: { fontSize: 12 },
};
```

### Spacing

```tsx
const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};
```

### Border Radius

```tsx
const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
};
```

---

## 9. Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Customer | customer@test.com | password |
| Photographer | anna@snapnow.com | password |
| Admin | admin@snapnow.com | admin123 |

---

## Additional Notes

### Session-based Auth
The web app uses session-based authentication. For mobile, you may need to:
1. Use `withCredentials: true` in axios
2. Or implement JWT tokens on the backend

### Image URLs
All image URLs from the API are relative. Prepend the API base URL:
```tsx
const fullUrl = `${API_URL}${relativeUrl}`;
```

### Platform Fees
- Customer pays: Base price + 10% service fee
- Photographer receives: Base price - 20% platform commission

### Booking Statuses
- `pending` - Awaiting photographer response
- `confirmed` - Photographer accepted, awaiting session
- `completed` - Session done, photos may be pending
- `cancelled` - Cancelled by customer
- `declined` - Declined by photographer
- `expired` - No response within time window

### Verification Statuses
- `pending_review` - Awaiting admin approval
- `verified` - Approved to accept bookings
- `rejected` - Application rejected

---

**End of Guide**
