import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { MapPin, Calendar, CreditCard } from 'lucide-react-native';
import PhotoBackground from '../src/components/PhotoBackground';
import { useAuth } from '../src/context/AuthContext';

export default function WelcomeScreen() {
  const { isAuthenticated, user, isLoading } = useAuth();

  React.useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === 'photographer') {
        router.replace('/(photographer)');
      } else {
        router.replace('/(customer)');
      }
    }
  }, [isLoading, isAuthenticated, user]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PhotoBackground />
      <SafeAreaView style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <MapPin size={32} color="#fff" />
          </View>
          <Text style={styles.logoText}>SNAPNOW</Text>
          <Text style={styles.tagline}>
            Get professional photos,{'\n'}anytime & anywhere you travel.
          </Text>
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <MapPin size={24} color="#6366f1" />
            <Text style={styles.featureText}>Find photographers nearby</Text>
          </View>
          <View style={styles.feature}>
            <Calendar size={24} color="#6366f1" />
            <Text style={styles.featureText}>Book sessions instantly</Text>
          </View>
          <View style={styles.feature}>
            <CreditCard size={24} color="#6366f1" />
            <Text style={styles.featureText}>Secure payments</Text>
          </View>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/(auth)/signup')}
            testID="button-get-started"
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/(auth)/login')}
            testID="button-login"
          >
            <Text style={styles.secondaryButtonText}>Already have an account? Log in</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  logoIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 2,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 18,
    color: '#d1d5db',
    textAlign: 'center',
    lineHeight: 26,
  },
  features: {
    gap: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  featureText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  buttons: {
    gap: 12,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#9ca3af',
    fontSize: 16,
  },
});
