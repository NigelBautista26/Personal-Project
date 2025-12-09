import { Printer, ArrowLeft, Code, Smartphone, Server, Database } from "lucide-react";
import { Link } from "wouter";

export default function MobileGuide() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100" style={{ minWidth: '900px' }}>
      <style>{`
        @media print {
          body {
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print { display: none !important; }
          .print-wrapper {
            background: white !important;
            padding: 20px !important;
          }
          pre {
            background: #f3f4f6 !important;
            color: #1f2937 !important;
            border: 1px solid #d1d5db !important;
            font-size: 11px !important;
          }
          code {
            background: #e5e7eb !important;
            color: #1f2937 !important;
          }
          h1, h2, h3, h4 { color: #111827 !important; }
          p, li { color: #374151 !important; }
          .section { page-break-inside: avoid; }
        }
      `}</style>

      <div className="print-wrapper max-w-6xl mx-auto w-full">
        <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 p-4 flex items-center justify-between no-print">
          <Link href="/">
            <span className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
              Back to App
            </span>
          </Link>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-medium transition-colors"
            data-testid="button-download-pdf"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </button>
        </div>

        <div className="p-6 space-y-8">
          <header className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">SnapNow Mobile App</h1>
            <p className="text-xl text-indigo-400">Complete Conversion Guide for Codex</p>
          </header>

          <section className="section bg-slate-800/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-indigo-400" />
              Overview
            </h2>
            <p className="text-gray-300 mb-4">
              This guide provides everything needed to convert the SnapNow web app to a React Native/Expo mobile app. 
              The mobile app will connect to the existing Replit backend API.
            </p>
            <div className="bg-slate-900 rounded-lg p-4">
              <p className="text-sm text-gray-400">API Base URL:</p>
              <code className="text-indigo-400 text-lg">https://snapnow-nigelbautista26.replit.app</code>
            </div>
          </section>

          <section className="section bg-slate-800/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-indigo-400" />
              Step 1: Project Setup
            </h2>
            <h3 className="font-semibold text-white mb-2">Create New Expo Project</h3>
            <pre className="bg-slate-900 text-gray-300 p-4 rounded-lg text-sm overflow-x-auto mb-4">
{`npx create-expo-app SnapNowMobile --template blank-typescript
cd SnapNowMobile`}
            </pre>

            <h3 className="font-semibold text-white mb-2">Install Dependencies</h3>
            <pre className="bg-slate-900 text-gray-300 p-4 rounded-lg text-sm overflow-x-auto mb-4">
{`# Navigation
npm install @react-navigation/native @react-navigation/native-stack

# Data fetching
npm install @tanstack/react-query axios

# Expo packages
npx expo install react-native-screens react-native-safe-area-context \\
  expo-location expo-image-picker @react-native-async-storage/async-storage`}
            </pre>

            <h3 className="font-semibold text-white mb-2">Project Structure</h3>
            <pre className="bg-slate-900 text-gray-300 p-4 rounded-lg text-sm overflow-x-auto">
{`SnapNowMobile/
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
│   └── types/
│       └── index.ts`}
            </pre>
          </section>

          <section className="section bg-slate-800/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Code className="w-5 h-5 text-indigo-400" />
              Step 2: App.tsx
            </h2>
            <pre className="bg-slate-900 text-gray-300 p-4 rounded-lg text-sm overflow-x-auto">
{`import { NavigationContainer } from '@react-navigation/native';
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
}`}
            </pre>
          </section>

          <section className="section bg-slate-800/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Code className="w-5 h-5 text-indigo-400" />
              src/api/client.ts
            </h2>
            <pre className="bg-slate-900 text-gray-300 p-4 rounded-lg text-sm overflow-x-auto">
{`import axios from 'axios';

const API_URL = 'https://snapnow-nigelbautista26.replit.app';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: true,
});

export default api;
export { API_URL };`}
            </pre>
          </section>

          <section className="section bg-slate-800/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Code className="w-5 h-5 text-indigo-400" />
              src/context/AuthContext.tsx
            </h2>
            <pre className="bg-slate-900 text-gray-300 p-4 rounded-lg text-sm overflow-x-auto">
{`import React, { createContext, useContext, useState, useEffect } from 'react';
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
};`}
            </pre>
          </section>

          <section className="section bg-slate-800/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Code className="w-5 h-5 text-indigo-400" />
              src/types/index.ts
            </h2>
            <pre className="bg-slate-900 text-gray-300 p-4 rounded-lg text-sm overflow-x-auto">
{`export interface User {
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
}`}
            </pre>
          </section>

          <section className="section bg-slate-800/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-indigo-400" />
              src/screens/WelcomeScreen.tsx
            </h2>
            <pre className="bg-slate-900 text-gray-300 p-4 rounded-lg text-sm overflow-x-auto">
{`import React from 'react';
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
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  content: { flex: 1, justifyContent: 'space-between', padding: 24, paddingTop: 80, paddingBottom: 40 },
  logoContainer: { alignItems: 'center' },
  logoText: { fontSize: 80, marginBottom: 16 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#ffffff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#888888', textAlign: 'center' },
  buttonContainer: { gap: 12 },
  primaryButton: { backgroundColor: '#ffffff', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  primaryButtonText: { color: '#0a0a0a', fontSize: 16, fontWeight: '600' },
  secondaryButton: { backgroundColor: 'transparent', paddingVertical: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#333333' },
  secondaryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
});`}
            </pre>
          </section>

          <section className="section bg-slate-800/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-indigo-400" />
              src/screens/LoginScreen.tsx
            </h2>
            <pre className="bg-slate-900 text-gray-300 p-4 rounded-lg text-sm overflow-x-auto">
{`import React, { useState } from 'react';
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
            <TextInput style={styles.input} placeholder="your@email.com" 
              placeholderTextColor="#666" value={email} onChangeText={setEmail} 
              keyboardType="email-address" autoCapitalize="none" />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput style={styles.input} placeholder="••••••••" 
              placeholderTextColor="#666" value={password} onChangeText={setPassword} 
              secureTextEntry />
          </View>

          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#0a0a0a" /> : 
              <Text style={styles.buttonText}>Log In</Text>}
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
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  content: { flex: 1, padding: 24 },
  backButton: { color: '#888', fontSize: 16, marginBottom: 32 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#ffffff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#888888', marginBottom: 32 },
  form: { gap: 20 },
  inputContainer: { gap: 8 },
  label: { color: '#ffffff', fontSize: 14, fontWeight: '500' },
  input: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, color: '#ffffff', fontSize: 16, borderWidth: 1, borderColor: '#333' },
  button: { backgroundColor: '#ffffff', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#0a0a0a', fontSize: 16, fontWeight: '600' },
  demoContainer: { marginTop: 40, padding: 16, backgroundColor: '#1a1a1a', borderRadius: 12 },
  demoTitle: { color: '#888', fontSize: 12, marginBottom: 8 },
  demoText: { color: '#666', fontSize: 12, marginBottom: 4 },
});`}
            </pre>
          </section>

          <section className="section bg-slate-800/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-indigo-400" />
              src/screens/HomeScreen.tsx
            </h2>
            <pre className="bg-slate-900 text-gray-300 p-4 rounded-lg text-sm overflow-x-auto">
{`import React from 'react';
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
    <TouchableOpacity style={styles.card} 
      onPress={() => navigation.navigate('PhotographerProfile' as never, { id: item.id } as never)}>
      <Image source={{ uri: item.user?.profileImage || 'https://via.placeholder.com/100' }} 
        style={styles.avatar} />
      <View style={styles.cardContent}>
        <Text style={styles.name}>{item.user?.firstName} {item.user?.lastName}</Text>
        <Text style={styles.city}>📍 {item.city}</Text>
        <View style={styles.ratingRow}>
          <Text style={styles.rating}>⭐ {item.rating?.toFixed(1) || 'New'} ({item.reviewCount} reviews)</Text>
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
        <FlatList data={photographers} keyExtractor={(item) => item.id.toString()} 
          renderItem={renderPhotographer} contentContainerStyle={styles.list} 
          showsVerticalScrollIndicator={false} />
      )}

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navTextActive}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Bookings' as never)}>
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
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingBottom: 16 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#ffffff' },
  subtitle: { fontSize: 14, color: '#888', marginTop: 4 },
  bookingsButton: { color: '#888', fontSize: 14 },
  list: { padding: 16, paddingBottom: 100 },
  card: { flexDirection: 'row', backgroundColor: '#1a1a1a', borderRadius: 16, padding: 16, marginBottom: 12 },
  avatar: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#333' },
  cardContent: { flex: 1, marginLeft: 16, justifyContent: 'center' },
  name: { fontSize: 18, fontWeight: '600', color: '#ffffff', marginBottom: 4 },
  city: { fontSize: 14, color: '#888', marginBottom: 8 },
  ratingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rating: { fontSize: 13, color: '#888' },
  price: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', padding: 16, borderTopWidth: 1, borderTopColor: '#222', position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#0a0a0a' },
  navItem: { alignItems: 'center' },
  navIcon: { fontSize: 24, marginBottom: 4 },
  navText: { color: '#666', fontSize: 12 },
  navTextActive: { color: '#fff', fontSize: 12 },
});`}
            </pre>
          </section>

          <section className="section bg-slate-800/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-400" />
              API Reference
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 text-gray-400">Endpoint</th>
                    <th className="text-left py-2 text-gray-400">Method</th>
                    <th className="text-left py-2 text-gray-400">Description</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-b border-slate-700/50"><td className="py-2">/api/register</td><td>POST</td><td>Create account</td></tr>
                  <tr className="border-b border-slate-700/50"><td className="py-2">/api/login</td><td>POST</td><td>Login</td></tr>
                  <tr className="border-b border-slate-700/50"><td className="py-2">/api/logout</td><td>POST</td><td>Logout</td></tr>
                  <tr className="border-b border-slate-700/50"><td className="py-2">/api/user</td><td>GET</td><td>Get current user</td></tr>
                  <tr className="border-b border-slate-700/50"><td className="py-2">/api/photographers</td><td>GET</td><td>List photographers</td></tr>
                  <tr className="border-b border-slate-700/50"><td className="py-2">/api/photographers/:id</td><td>GET</td><td>Get photographer</td></tr>
                  <tr className="border-b border-slate-700/50"><td className="py-2">/api/photographers/:id/reviews</td><td>GET</td><td>Get reviews</td></tr>
                  <tr className="border-b border-slate-700/50"><td className="py-2">/api/bookings</td><td>GET</td><td>Get user bookings</td></tr>
                  <tr className="border-b border-slate-700/50"><td className="py-2">/api/bookings/:id</td><td>GET</td><td>Get booking detail</td></tr>
                  <tr><td className="py-2">/api/bookings</td><td>POST</td><td>Create booking</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="section bg-slate-800/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Demo Accounts</h2>
            <ul className="text-gray-300 space-y-2">
              <li><strong>Customer:</strong> customer@test.com / password</li>
              <li><strong>Photographer:</strong> anna@snapnow.com / password</li>
            </ul>
          </section>

          <section className="section bg-slate-800/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Design System</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-400">Background:</span> <code className="text-indigo-400">#0a0a0a</code></div>
              <div><span className="text-gray-400">Cards:</span> <code className="text-indigo-400">#1a1a1a</code></div>
              <div><span className="text-gray-400">Border:</span> <code className="text-indigo-400">#333333</code></div>
              <div><span className="text-gray-400">Text Primary:</span> <code className="text-indigo-400">#ffffff</code></div>
              <div><span className="text-gray-400">Text Secondary:</span> <code className="text-indigo-400">#888888</code></div>
              <div><span className="text-gray-400">Success:</span> <code className="text-green-400">#22c55e</code></div>
              <div><span className="text-gray-400">Warning:</span> <code className="text-yellow-400">#f59e0b</code></div>
              <div><span className="text-gray-400">Error:</span> <code className="text-red-400">#ef4444</code></div>
            </div>
          </section>

          <section className="section bg-slate-800/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Run the App</h2>
            <pre className="bg-slate-900 text-gray-300 p-4 rounded-lg text-sm overflow-x-auto">
{`# Start Expo
npx expo start --clear

# Scan QR code with Expo Go app on your phone`}
            </pre>
          </section>

        </div>
      </div>
    </div>
  );
}
