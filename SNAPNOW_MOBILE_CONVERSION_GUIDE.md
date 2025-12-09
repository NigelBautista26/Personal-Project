# SnapNow Mobile App - Complete Conversion Guide for Codex

## Overview

This guide provides everything needed to convert the SnapNow web app to a React Native/Expo mobile app. The mobile app will connect to the existing Replit backend API.

**API Base URL:** `https://snapnow-nigelbautista26.replit.app`

---

## Step 1: Project Setup

### Create New Expo Project

```bash
npx create-expo-app SnapNowMobile --template blank-typescript
cd SnapNowMobile
```

### Install Dependencies

```bash
# Navigation
npm install @react-navigation/native @react-navigation/native-stack

# Data fetching
npm install @tanstack/react-query axios

# Expo packages
npx expo install react-native-screens react-native-safe-area-context expo-location expo-image-picker @react-native-async-storage/async-storage
```

### Project Structure

Create this folder structure:

```
SnapNowMobile/
├── App.tsx
├── src/
│   ├── api/
│   │   └── client.ts
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── screens/
│   │   ├── WelcomeScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── SignupScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── PhotographerProfileScreen.tsx
│   │   ├── BookingScreen.tsx
│   │   ├── BookingsScreen.tsx
│   │   └── BookingDetailScreen.tsx
│   ├── components/
│   │   └── (shared components)
│   └── types/
│       └── index.ts
```

---

## Step 2: Core Files

### App.tsx

```tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import HomeScreen from './src/screens/HomeScreen';
import PhotographerProfileScreen from './src/screens/PhotographerProfileScreen';
import BookingScreen from './src/screens/BookingScreen';
import BookingsScreen from './src/screens/BookingsScreen';
import BookingDetailScreen from './src/screens/BookingDetailScreen';

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

function AppNavigator() {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="PhotographerProfile" component={PhotographerProfileScreen} />
          <Stack.Screen name="Booking" component={BookingScreen} />
          <Stack.Screen name="Bookings" component={BookingsScreen} />
          <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

### src/api/client.ts

```tsx
import axios from 'axios';

const API_URL = 'https://snapnow-nigelbautista26.replit.app';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: true,
});

export default api;
export { API_URL };
```

### src/context/AuthContext.tsx

```tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'photographer' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('user').then(stored => {
      if (stored) setUser(JSON.parse(stored));
      setLoading(false);
    });
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/api/login', { email, password });
    const userData = res.data.user;
    setUser(userData);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    await api.post('/api/logout');
    setUser(null);
    await AsyncStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be within AuthProvider');
  return context;
};
```

### src/types/index.ts

```tsx
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'photographer' | 'admin';
  profileImage?: string;
}

export interface Photographer {
  id: number;
  userId: number;
  bio?: string;
  hourlyRate: number;
  city: string;
  latitude: number;
  longitude: number;
  portfolioImages: string[];
  rating?: number;
  reviewCount: number;
  user?: User;
}

export interface Booking {
  id: number;
  customerId: number;
  photographerId: number;
  date: string;
  time: string;
  duration: number;
  status: 'requested' | 'accepted' | 'declined' | 'completed' | 'expired';
  totalAmount: string;
  photoUrls: string[];
  photographer?: Photographer;
}

export interface Review {
  id: number;
  bookingId: number;
  rating: number;
  comment: string;
  customer?: User;
}
```

---

## Step 3: Screens

### src/screens/WelcomeScreen.tsx

```tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>📸</Text>
          <Text style={styles.title}>SnapNow</Text>
          <Text style={styles.subtitle}>Find professional photographers nearby</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Login' as never)}
          >
            <Text style={styles.primaryButtonText}>Log In</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Signup' as never)}
          >
            <Text style={styles.secondaryButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#0a0a0a',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

### src/screens/LoginScreen.tsx

```tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    
    setLoading(true);
    try {
      await login(email, password);
    } catch (error: any) {
      Alert.alert('Login Failed', error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#0a0a0a" />
            ) : (
              <Text style={styles.buttonText}>Log In</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.demoContainer}>
          <Text style={styles.demoTitle}>Demo Accounts:</Text>
          <Text style={styles.demoText}>Customer: customer@test.com / password</Text>
          <Text style={styles.demoText}>Photographer: anna@snapnow.com / password</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  backButton: {
    color: '#888',
    fontSize: 16,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888888',
    marginBottom: 32,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#ffffff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  button: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#0a0a0a',
    fontSize: 16,
    fontWeight: '600',
  },
  demoContainer: {
    marginTop: 40,
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
  },
  demoTitle: {
    color: '#888',
    fontSize: 12,
    marginBottom: 8,
  },
  demoText: {
    color: '#666',
    fontSize: 12,
    marginBottom: 4,
  },
});
```

### src/screens/SignupScreen.tsx

```tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function SignupScreen() {
  const navigation = useNavigation();
  const { login } = useAuth();
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
      await api.post('/api/register', {
        firstName,
        lastName,
        email,
        password,
        role,
      });
      await login(email, password);
    } catch (error: any) {
      Alert.alert('Signup Failed', error.response?.data?.message || 'Could not create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Create Account</Text>

        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[styles.roleButton, role === 'customer' && styles.roleButtonActive]}
            onPress={() => setRole('customer')}
          >
            <Text style={[styles.roleText, role === 'customer' && styles.roleTextActive]}>
              I need photos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleButton, role === 'photographer' && styles.roleButtonActive]}
            onPress={() => setRole('photographer')}
          >
            <Text style={[styles.roleText, role === 'photographer' && styles.roleTextActive]}>
              I'm a photographer
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                placeholder="John"
                placeholderTextColor="#666"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Doe"
                placeholderTextColor="#666"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#0a0a0a" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  backButton: {
    color: '#888',
    fontSize: 16,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 24,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  roleButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  roleButtonActive: {
    borderColor: '#ffffff',
    backgroundColor: '#1a1a1a',
  },
  roleText: {
    color: '#888',
    fontSize: 14,
  },
  roleTextActive: {
    color: '#ffffff',
  },
  form: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#ffffff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  button: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#0a0a0a',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

### src/screens/HomeScreen.tsx

```tsx
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Photographer } from '../types';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuth();

  const { data: photographers, isLoading } = useQuery({
    queryKey: ['photographers'],
    queryFn: async () => {
      const res = await api.get('/api/photographers');
      return res.data as Photographer[];
    },
  });

  const renderPhotographer = ({ item }: { item: Photographer }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('PhotographerProfile' as never, { id: item.id } as never)}
    >
      <Image
        source={{ uri: item.user?.profileImage || 'https://via.placeholder.com/100' }}
        style={styles.avatar}
      />
      <View style={styles.cardContent}>
        <Text style={styles.name}>
          {item.user?.firstName} {item.user?.lastName}
        </Text>
        <Text style={styles.city}>📍 {item.city}</Text>
        <View style={styles.ratingRow}>
          <Text style={styles.rating}>
            ⭐ {item.rating?.toFixed(1) || 'New'} ({item.reviewCount} reviews)
          </Text>
          <Text style={styles.price}>£{item.hourlyRate}/hr</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.firstName} 👋</Text>
          <Text style={styles.subtitle}>Find your photographer</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Bookings' as never)}>
          <Text style={styles.bookingsButton}>My Bookings</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={photographers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPhotographer}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navTextActive}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Bookings' as never)}
        >
          <Text style={styles.navIcon}>📅</Text>
          <Text style={styles.navText}>Bookings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={logout}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  bookingsButton: {
    color: '#888',
    fontSize: 14,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#333',
  },
  cardContent: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  city: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rating: {
    fontSize: 13,
    color: '#888',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#222',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0a0a0a',
  },
  navItem: {
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  navText: {
    color: '#666',
    fontSize: 12,
  },
  navTextActive: {
    color: '#fff',
    fontSize: 12,
  },
});
```

### src/screens/PhotographerProfileScreen.tsx

```tsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';

export default function PhotographerProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params as { id: number };

  const { data: photographer, isLoading } = useQuery({
    queryKey: ['photographer', id],
    queryFn: async () => {
      const res = await api.get(`/api/photographers/${id}`);
      return res.data;
    },
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews', id],
    queryFn: async () => {
      const res = await api.get(`/api/photographers/${id}/reviews`);
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          <Image
            source={{ uri: photographer?.user?.profileImage || 'https://via.placeholder.com/120' }}
            style={styles.avatar}
          />
          <Text style={styles.name}>
            {photographer?.user?.firstName} {photographer?.user?.lastName}
          </Text>
          <Text style={styles.city}>📍 {photographer?.city}</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>⭐ {photographer?.rating?.toFixed(1) || 'New'}</Text>
              <Text style={styles.statLabel}>{photographer?.reviewCount} reviews</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>£{photographer?.hourlyRate}</Text>
              <Text style={styles.statLabel}>per hour</Text>
            </View>
          </View>
        </View>

        {photographer?.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bio}>{photographer.bio}</Text>
          </View>
        )}

        {photographer?.portfolioImages?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Portfolio</Text>
            <FlatList
              data={photographer.portfolioImages}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <Image source={{ uri: item }} style={styles.portfolioImage} />
              )}
              contentContainerStyle={{ gap: 8 }}
            />
          </View>
        )}

        {reviews?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            {reviews.slice(0, 3).map((review: any) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>
                    {review.customer?.firstName} {review.customer?.lastName}
                  </Text>
                  <Text style={styles.reviewRating}>{'⭐'.repeat(review.rating)}</Text>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => navigation.navigate('Booking' as never, { id } as never)}
        >
          <Text style={styles.bookButtonText}>Book Session - £{photographer?.hourlyRate}/hr</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    padding: 24,
  },
  backButton: {
    color: '#888',
    fontSize: 16,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#333',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  city: {
    fontSize: 16,
    color: '#888',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 40,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
  },
  section: {
    padding: 24,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  bio: {
    fontSize: 14,
    color: '#aaa',
    lineHeight: 22,
  },
  portfolioImage: {
    width: 150,
    height: 150,
    borderRadius: 12,
    backgroundColor: '#333',
  },
  reviewCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewerName: {
    color: '#fff',
    fontWeight: '500',
  },
  reviewRating: {
    fontSize: 12,
  },
  reviewComment: {
    color: '#aaa',
    fontSize: 14,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: '#0a0a0a',
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  bookButton: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#0a0a0a',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

### src/screens/BookingScreen.tsx

```tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../api/client';

export default function BookingScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params as { id: number };
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(1);

  const { data: photographer } = useQuery({
    queryKey: ['photographer', id],
    queryFn: async () => {
      const res = await api.get(`/api/photographers/${id}`);
      return res.data;
    },
  });

  const bookMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/api/bookings', {
        photographerId: id,
        date: selectedDate,
        time: selectedTime,
        duration,
      });
      return res.data;
    },
    onSuccess: () => {
      Alert.alert('Success', 'Booking request sent!', [
        { text: 'OK', onPress: () => navigation.navigate('Bookings' as never) }
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Could not create booking');
    },
  });

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      value: date.toISOString().split('T')[0],
      day: date.toLocaleDateString('en-GB', { weekday: 'short' }),
      date: date.getDate(),
    };
  });

  // Time slots
  const times = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

  const hourlyRate = photographer?.hourlyRate || 0;
  const subtotal = hourlyRate * duration;
  const serviceFee = subtotal * 0.1;
  const total = subtotal + serviceFee;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Book Session</Text>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.datesRow}>
              {dates.map((d) => (
                <TouchableOpacity
                  key={d.value}
                  style={[styles.dateCard, selectedDate === d.value && styles.dateCardActive]}
                  onPress={() => setSelectedDate(d.value)}
                >
                  <Text style={[styles.dateDay, selectedDate === d.value && styles.dateTextActive]}>{d.day}</Text>
                  <Text style={[styles.dateNum, selectedDate === d.value && styles.dateTextActive]}>{d.date}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Time</Text>
          <View style={styles.timesGrid}>
            {times.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.timeCard, selectedTime === t && styles.timeCardActive]}
                onPress={() => setSelectedTime(t)}
              >
                <Text style={[styles.timeText, selectedTime === t && styles.timeTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Duration Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Duration</Text>
          <View style={styles.durationRow}>
            <TouchableOpacity
              style={styles.durationButton}
              onPress={() => setDuration(Math.max(1, duration - 1))}
            >
              <Text style={styles.durationButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.durationValue}>{duration} hour{duration > 1 ? 's' : ''}</Text>
            <TouchableOpacity
              style={styles.durationButton}
              onPress={() => setDuration(Math.min(8, duration + 1))}
            >
              <Text style={styles.durationButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Price Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Summary</Text>
          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>£{hourlyRate} × {duration} hour{duration > 1 ? 's' : ''}</Text>
              <Text style={styles.priceValue}>£{subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Service fee (10%)</Text>
              <Text style={styles.priceValue}>£{serviceFee.toFixed(2)}</Text>
            </View>
            <View style={[styles.priceRow, styles.priceTotal]}>
              <Text style={styles.priceTotalLabel}>Total</Text>
              <Text style={styles.priceTotalValue}>£{total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Book Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.bookButton, (!selectedDate || !selectedTime || bookMutation.isPending) && styles.bookButtonDisabled]}
          onPress={() => bookMutation.mutate()}
          disabled={!selectedDate || !selectedTime || bookMutation.isPending}
        >
          {bookMutation.isPending ? (
            <ActivityIndicator color="#0a0a0a" />
          ) : (
            <Text style={styles.bookButtonText}>Request Booking - £{total.toFixed(2)}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    padding: 24,
  },
  backButton: {
    color: '#888',
    fontSize: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  datesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dateCard: {
    width: 60,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
  },
  dateCardActive: {
    backgroundColor: '#ffffff',
  },
  dateDay: {
    color: '#888',
    fontSize: 12,
    marginBottom: 4,
  },
  dateNum: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  dateTextActive: {
    color: '#0a0a0a',
  },
  timesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeCard: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
  },
  timeCardActive: {
    backgroundColor: '#ffffff',
  },
  timeText: {
    color: '#fff',
    fontSize: 14,
  },
  timeTextActive: {
    color: '#0a0a0a',
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  durationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationButtonText: {
    color: '#fff',
    fontSize: 24,
  },
  durationValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    minWidth: 80,
    textAlign: 'center',
  },
  priceCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    color: '#888',
    fontSize: 14,
  },
  priceValue: {
    color: '#fff',
    fontSize: 14,
  },
  priceTotal: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 0,
  },
  priceTotalLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  priceTotalValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: '#0a0a0a',
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  bookButton: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    opacity: 0.5,
  },
  bookButtonText: {
    color: '#0a0a0a',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

### src/screens/BookingsScreen.tsx

```tsx
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { Booking } from '../types';

export default function BookingsScreen() {
  const navigation = useNavigation();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const res = await api.get('/api/bookings');
      return res.data as Booking[];
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return '#22c55e';
      case 'completed': return '#3b82f6';
      case 'requested': return '#f59e0b';
      case 'declined':
      case 'expired': return '#ef4444';
      default: return '#888';
    }
  };

  const renderBooking = ({ item }: { item: Booking }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('BookingDetail' as never, { id: item.id } as never)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.photographerName}>
          {item.photographer?.user?.firstName} {item.photographer?.user?.lastName}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>
      <Text style={styles.date}>📅 {item.date} at {item.time}</Text>
      <Text style={styles.duration}>⏱ {item.duration} hour(s) • £{item.totalAmount}</Text>
      {item.photoUrls?.length > 0 && (
        <Text style={styles.photos}>📷 {item.photoUrls.length} photos delivered</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Bookings</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 40 }} />
      ) : bookings?.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No bookings yet</Text>
          <TouchableOpacity
            style={styles.findButton}
            onPress={() => navigation.navigate('Home' as never)}
          >
            <Text style={styles.findButtonText}>Find a Photographer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderBooking}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    padding: 24,
  },
  backButton: {
    color: '#888',
    fontSize: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  photographerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  date: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 4,
  },
  duration: {
    color: '#888',
    fontSize: 14,
  },
  photos: {
    color: '#22c55e',
    fontSize: 14,
    marginTop: 8,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    marginBottom: 16,
  },
  findButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  findButtonText: {
    color: '#0a0a0a',
    fontWeight: '600',
  },
});
```

### src/screens/BookingDetailScreen.tsx

```tsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, ActivityIndicator, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';

const { width } = Dimensions.get('window');

export default function BookingDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params as { id: number };

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn: async () => {
      const res = await api.get(`/api/bookings/${id}`);
      return res.data;
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return '#22c55e';
      case 'completed': return '#3b82f6';
      case 'requested': return '#f59e0b';
      case 'declined':
      case 'expired': return '#ef4444';
      default: return '#888';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
        </View>

        {/* Status */}
        <View style={styles.statusSection}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking?.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(booking?.status) }]}>
              {booking?.status}
            </Text>
          </View>
        </View>

        {/* Photographer Info */}
        <View style={styles.section}>
          <View style={styles.photographerCard}>
            <Image
              source={{ uri: booking?.photographer?.user?.profileImage || 'https://via.placeholder.com/60' }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.photographerName}>
                {booking?.photographer?.user?.firstName} {booking?.photographer?.user?.lastName}
              </Text>
              <Text style={styles.photographerCity}>📍 {booking?.photographer?.city}</Text>
            </View>
          </View>
        </View>

        {/* Booking Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{booking?.date}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>{booking?.time}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>{booking?.duration} hour(s)</Text>
            </View>
            <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.detailLabel}>Total Paid</Text>
              <Text style={styles.detailValueBold}>£{booking?.totalAmount}</Text>
            </View>
          </View>
        </View>

        {/* Photos */}
        {booking?.photoUrls?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Photos ({booking.photoUrls.length})</Text>
            <FlatList
              data={booking.photoUrls}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <Image source={{ uri: item }} style={styles.photo} />
              )}
              contentContainerStyle={{ gap: 8 }}
            />
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    padding: 24,
  },
  backButton: {
    color: '#888',
    fontSize: 16,
  },
  statusSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  photographerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#333',
  },
  photographerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  photographerCity: {
    fontSize: 14,
    color: '#888',
  },
  detailsCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  detailLabel: {
    color: '#888',
    fontSize: 14,
  },
  detailValue: {
    color: '#fff',
    fontSize: 14,
  },
  detailValueBold: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  photo: {
    width: width - 64,
    height: (width - 64) * 0.75,
    borderRadius: 12,
    backgroundColor: '#333',
  },
});
```

---

## Step 4: Run the App

```bash
# Start Expo
npx expo start --clear

# Scan QR code with Expo Go app on your phone
```

---

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/register` | POST | Create account |
| `/api/login` | POST | Login |
| `/api/logout` | POST | Logout |
| `/api/user` | GET | Get current user |
| `/api/photographers` | GET | List photographers |
| `/api/photographers/:id` | GET | Get photographer |
| `/api/photographers/:id/reviews` | GET | Get reviews |
| `/api/bookings` | GET | Get user bookings |
| `/api/bookings/:id` | GET | Get booking detail |
| `/api/bookings` | POST | Create booking |

---

## Demo Accounts

- **Customer:** customer@test.com / password
- **Photographer:** anna@snapnow.com / password

---

## Design System

- **Background:** #0a0a0a
- **Cards:** #1a1a1a
- **Border:** #333333
- **Text Primary:** #ffffff
- **Text Secondary:** #888888
- **Success:** #22c55e
- **Warning:** #f59e0b
- **Error:** #ef4444
- **Primary Button:** #ffffff background, #0a0a0a text
