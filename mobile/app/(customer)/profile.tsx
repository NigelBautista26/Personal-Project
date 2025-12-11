import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { User, Shield, Settings, HelpCircle, LogOut, ChevronRight } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { API_URL } from '../../src/api/client';

const PRIMARY_COLOR = '#2563eb';

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
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header with gradient background */}
        <View style={styles.headerContainer}>
          <View style={styles.headerGradient} />
          
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

        {/* Menu items in glass panel */}
        <View style={styles.menuContainer}>
          <View style={styles.glassPanel}>
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
                    color={item.isDestructive ? '#ef4444' : '#9ca3af'} 
                  />
                  <Text style={[
                    styles.menuItemText, 
                    item.isDestructive && styles.menuItemTextDestructive
                  ]}>
                    {item.label}
                  </Text>
                </View>
                <ChevronRight size={16} color="rgba(107, 114, 128, 0.5)" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* SnapNow Member Card */}
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  content: { flex: 1 },
  
  headerContainer: {
    height: 160,
    position: 'relative',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 160,
    backgroundColor: 'rgba(30, 58, 138, 0.4)',
  },
  avatarContainer: {
    position: 'absolute',
    bottom: -48,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  avatar: { 
    width: 96, 
    height: 96, 
    borderRadius: 48, 
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#1a1a1a',
    backgroundColor: '#1a1a1a',
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#1a1a1a',
  },
  name: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 4 },
  email: { fontSize: 14, color: '#6b7280' },
  
  menuContainer: {
    marginTop: 72,
    paddingHorizontal: 24,
  },
  glassPanel: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  menuItemLeft: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12,
  },
  menuItemText: { fontSize: 15, fontWeight: '500', color: '#fff' },
  menuItemTextDestructive: { color: '#ef4444' },
  
  memberCardContainer: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: 'rgba(37,99,235,0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(37,99,235,0.2)',
  },
  memberIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(37,99,235,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  memberContent: {
    flex: 1,
  },
  memberTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  memberSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
  },
  memberLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ef4444',
  },
});
