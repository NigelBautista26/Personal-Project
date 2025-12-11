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
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
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
          <Text style={styles.name}>{user?.fullName || 'User'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={item.label} 
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.menuItemLast
              ]}
              onPress={item.onPress}
              testID={`button-${item.label.toLowerCase().replace(' ', '-')}`}
            >
              <View style={styles.menuItemLeft}>
                <item.icon size={20} color="#9ca3af" />
                <Text style={styles.menuItemText}>{item.label}</Text>
              </View>
              <ChevronRight size={18} color="#4b5563" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.logoutItem}
          onPress={handleLogout}
          testID="button-logout"
        >
          <View style={styles.menuItemLeft}>
            <LogOut size={20} color="#ef4444" />
            <Text style={styles.logoutText}>Log Out</Text>
          </View>
          <ChevronRight size={18} color="#4b5563" />
        </TouchableOpacity>

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

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  content: { flex: 1 },
  profileSection: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 32,
  },
  avatar: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  name: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 4 },
  email: { fontSize: 14, color: '#6b7280' },
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 14,
  },
  menuItemText: { fontSize: 16, color: '#fff' },
  logoutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  logoutText: { fontSize: 16, color: '#ef4444' },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    margin: 20,
    marginTop: 24,
    padding: 16,
    backgroundColor: 'rgba(37,99,235,0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(37,99,235,0.2)',
  },
  memberIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
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
    color: '#9ca3af',
    marginBottom: 8,
  },
  memberLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ef4444',
  },
});
