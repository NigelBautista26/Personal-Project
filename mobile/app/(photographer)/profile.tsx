import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { User, Settings, Camera, Instagram, Globe, LogOut, ChevronRight, Star } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { API_URL } from '../../src/api/client';

export default function PhotographerProfileScreen() {
  const { user, photographerProfile, logout } = useAuth();

  const getImageUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_URL}${path}`;
  };

  const handleLogout = () => {
    Alert.alert(
      'Log out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          {photographerProfile?.profilePicture || user?.profileImageUrl ? (
            <Image
              source={{ uri: getImageUrl(photographerProfile?.profilePicture || user?.profileImageUrl) }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Camera size={40} color="#6b7280" />
            </View>
          )}
          <Text style={styles.name}>{user?.fullName || 'Photographer'}</Text>
          <Text style={styles.city}>{photographerProfile?.city}</Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>£{photographerProfile?.hourlyRate}</Text>
              <Text style={styles.statLabel}>/hour</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <View style={styles.ratingRow}>
                <Star size={16} color="#fbbf24" fill="#fbbf24" />
                <Text style={styles.statValue}>
                  {photographerProfile?.rating?.toFixed(1) || 'New'}
                </Text>
              </View>
              <Text style={styles.statLabel}>
                {photographerProfile?.reviewCount || 0} reviews
              </Text>
            </View>
          </View>
        </View>

        {photographerProfile?.bio && (
          <View style={styles.bioCard}>
            <Text style={styles.bioTitle}>About</Text>
            <Text style={styles.bioText}>{photographerProfile.bio}</Text>
          </View>
        )}

        <View style={styles.menuSection}>
          {photographerProfile?.instagramUrl && (
            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Instagram size={20} color="#e1306c" />
                <Text style={styles.menuItemText}>Instagram</Text>
              </View>
              <Text style={styles.menuItemValue} numberOfLines={1}>
                {photographerProfile.instagramUrl.replace('https://instagram.com/', '@')}
              </Text>
            </View>
          )}

          {photographerProfile?.websiteUrl && (
            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Globe size={20} color="#6366f1" />
                <Text style={styles.menuItemText}>Website</Text>
              </View>
              <Text style={styles.menuItemValue} numberOfLines={1}>
                {photographerProfile.websiteUrl.replace('https://', '')}
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.menuItem} testID="button-settings">
            <View style={styles.menuItemLeft}>
              <Settings size={20} color="#9ca3af" />
              <Text style={styles.menuItemText}>Settings</Text>
            </View>
            <ChevronRight size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          testID="button-logout"
        >
          <LogOut size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { padding: 20, paddingBottom: 0 },
  title: { fontSize: 28, fontWeight: '700', color: '#fff' },
  content: { flex: 1, padding: 20 },
  profileCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 16 },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: { fontSize: 24, fontWeight: '600', color: '#fff', marginBottom: 4 },
  city: { fontSize: 16, color: '#9ca3af', marginBottom: 20 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  stat: { alignItems: 'center', paddingHorizontal: 24 },
  statDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.1)' },
  statValue: { fontSize: 20, fontWeight: '600', color: '#fff' },
  statLabel: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  bioCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  bioTitle: { fontSize: 14, fontWeight: '600', color: '#9ca3af', marginBottom: 8 },
  bioText: { fontSize: 14, color: '#d1d5db', lineHeight: 22 },
  menuSection: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuItemText: { fontSize: 16, color: '#fff' },
  menuItemValue: { fontSize: 14, color: '#9ca3af', maxWidth: 150 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ef4444',
    marginBottom: 40,
  },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#ef4444' },
});
