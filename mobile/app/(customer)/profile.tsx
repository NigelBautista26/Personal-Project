import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Shield, Settings, HelpCircle, LogOut, ChevronRight } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { API_URL } from '../../src/api/client';

const PRIMARY_COLOR = '#2563eb';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CustomerProfileScreen() {
  const { user, logout } = useAuth();

  const getImageUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_URL}${path}`;
  };

  const handleLogout = async () => {
    await logout();
  };

  const menuItems = [
    { icon: User, label: 'Account Details', onPress: () => {} },
    { icon: Shield, label: 'Security', onPress: () => {} },
    { icon: Settings, label: 'Preferences', onPress: () => {} },
    { icon: HelpCircle, label: 'Support', onPress: () => {} },
    { icon: LogOut, label: 'Log Out', onPress: handleLogout, isDestructive: true },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header with layered gradients */}
          <View style={styles.headerContainer}>
            {/* Base gradient - transitions to background */}
            <LinearGradient
              colors={['#0f172a', '#111827', '#0d0f14']}
              locations={[0, 0.5, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.baseGradient}
            />
            
            {/* Subtle blue accent glow */}
            <LinearGradient
              colors={['rgba(37,99,235,0.25)', 'rgba(59,130,246,0.12)', 'transparent']}
              locations={[0, 0.5, 1]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.accentGradient}
            />
            
            {/* Avatar positioned at bottom of header */}
            <View style={styles.avatarContainer}>
              {user?.profileImageUrl ? (
                <Image
                  source={{ uri: getImageUrl(user.profileImageUrl) }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <User size={48} color="#6b7280" />
                </View>
              )}
              <Text style={styles.name} testID="text-username">{user?.fullName || 'Guest'}</Text>
              <Text style={styles.email} testID="text-email">{user?.email || ''}</Text>
            </View>
          </View>

          {/* Menu items - no card wrapper, directly on background */}
          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              <TouchableOpacity 
                key={item.label} 
                style={[
                  styles.menuItem,
                  index !== menuItems.length - 1 && styles.menuItemBorder
                ]}
                onPress={item.onPress}
                testID={`button-${item.label.toLowerCase().replace(' ', '-')}`}
              >
                <View style={styles.menuItemLeft}>
                  <item.icon 
                    size={20} 
                    color={item.isDestructive ? '#ef4444' : '#6b7280'} 
                  />
                  <Text style={[
                    styles.menuItemText, 
                    item.isDestructive && styles.menuItemTextDestructive
                  ]}>
                    {item.label}
                  </Text>
                </View>
                <ChevronRight size={16} color="rgba(107, 114, 128, 0.4)" />
              </TouchableOpacity>
            ))}
          </View>

          {/* SnapNow Member Card - subtle styling */}
          <View style={styles.memberCardContainer}>
            <View style={styles.memberCard}>
              <View style={styles.memberIcon}>
                <Shield size={24} color={PRIMARY_COLOR} />
              </View>
              <View style={styles.memberContent}>
                <Text style={styles.memberTitle}>SnapNow Member</Text>
                <Text style={styles.memberSubtitle}>Book photographers anywhere you travel.</Text>
                <TouchableOpacity>
                  <Text style={styles.memberLink}>Explore Features</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0f14' },
  safeArea: { flex: 1 },
  content: { flex: 1 },
  
  headerContainer: {
    height: 180,
    position: 'relative',
    overflow: 'hidden',
  },
  baseGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
  },
  accentGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
  },
  avatarContainer: {
    position: 'absolute',
    bottom: -48,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  avatar: { 
    width: 88, 
    height: 88, 
    borderRadius: 44, 
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#0d0f14',
    backgroundColor: '#1f2937',
  },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#0d0f14',
  },
  name: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 2 },
  email: { fontSize: 14, color: '#6b7280' },
  
  menuContainer: {
    marginTop: 72,
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  menuItemLeft: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 14,
  },
  menuItemText: { fontSize: 15, fontWeight: '500', color: '#fff' },
  menuItemTextDestructive: { color: '#ef4444' },
  
  memberCardContainer: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: 'rgba(37,99,235,0.08)',
    borderRadius: 14,
    borderWidth: 0,
  },
  memberIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(37,99,235,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  memberContent: {
    flex: 1,
  },
  memberTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  memberSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 10,
  },
  memberLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ef4444',
  },
});
