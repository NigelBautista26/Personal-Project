import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import PhotoBackground from '../src/components/PhotoBackground';
import { useAuth } from '../src/context/AuthContext';

const PRIMARY_COLOR = '#2563eb';

export default function WelcomeScreen() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [hasCheckedAuth, setHasCheckedAuth] = React.useState(false);

  React.useEffect(() => {
    if (!isLoading && !hasCheckedAuth) {
      setHasCheckedAuth(true);
      if (isAuthenticated && user) {
        if (user.role === 'photographer') {
          router.replace('/(photographer)');
        } else {
          router.replace('/(customer)');
        }
      }
    }
  }, [isLoading, isAuthenticated, user, hasCheckedAuth]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PhotoBackground />
      <SafeAreaView style={styles.content}>
        <View style={styles.spacer} />
        
        <View style={styles.centerContent}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.tagline}>
            Get professional photos,{'\n'}anytime & anywhere you travel.
          </Text>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/(auth)/signup')}
            activeOpacity={0.9}
            testID="button-get-started"
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/login')}
              style={styles.loginLink}
              testID="button-login"
            >
              <Text style={styles.loginLinkText}>Log in</Text>
              <ChevronRight size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
  },
  spacer: {
    flex: 1,
  },
  centerContent: {
    alignItems: 'center',
    flex: 2,
    justifyContent: 'center',
  },
  logoContainer: {
    width: 128,
    height: 128,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 32,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 40,
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  tagline: {
    fontSize: 18,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 28,
  },
  buttons: {
    gap: 16,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  loginLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});
