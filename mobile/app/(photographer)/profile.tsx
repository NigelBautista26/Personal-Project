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
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { 
  ArrowLeft, 
  Camera, 
  Star, 
  MapPin, 
  ChevronRight, 
  MessageSquare, 
  Palette,
  LogOut,
  Edit,
} from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { API_URL } from '../../src/api/client';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PRIMARY_COLOR = '#2563eb';

export default function PhotographerProfileScreen() {
  const { user, photographerProfile, logout } = useAuth();

  const getImageUrl = (path?: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_URL}${path}`;
  };

  const profileImageUrl = getImageUrl(
    photographerProfile?.profileImageUrl || photographerProfile?.profilePicture || user?.profileImageUrl
  );

  const coverImageUrl = getImageUrl(
    photographerProfile?.portfolioImages?.[0] || photographerProfile?.profileImageUrl
  );

  const portfolioImages = photographerProfile?.portfolioImages || [];
  const rating = photographerProfile?.rating ? parseFloat(photographerProfile.rating.toString()) : null;
  const reviewCount = photographerProfile?.reviewCount || 0;

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
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Cover Photo with Profile */}
        <View style={styles.coverSection}>
          {coverImageUrl ? (
            <Image 
              source={{ uri: coverImageUrl }} 
              style={styles.coverImage}
              blurRadius={2}
            />
          ) : (
            <View style={styles.coverPlaceholder} />
          )}
          
          {/* Overlay Gradient */}
          <View style={styles.coverOverlay} />

          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color="#fff" />
          </TouchableOpacity>

          {/* Edit Button */}
          <TouchableOpacity style={styles.editButton}>
            <Edit size={14} color="#fff" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>

          {/* Profile Picture Overlay */}
          <View style={styles.profilePictureContainer}>
            {profileImageUrl ? (
              <Image source={{ uri: profileImageUrl }} style={styles.profilePicture} />
            ) : (
              <View style={styles.profilePicturePlaceholder}>
                <Camera size={40} color="#6b7280" />
              </View>
            )}
            <TouchableOpacity style={styles.cameraButton}>
              <Camera size={14} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Rating Badge */}
          <View style={styles.ratingBadge}>
            <Star size={12} color="#fbbf24" fill="#fbbf24" />
            <Text style={styles.ratingBadgeText}>
              {rating ? rating.toFixed(1) : 'New'}
            </Text>
            {reviewCount > 0 && (
              <Text style={styles.ratingBadgeCount}>({reviewCount})</Text>
            )}
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.fullName || 'Photographer'}</Text>
          <View style={styles.locationRow}>
            <MapPin size={14} color="#9ca3af" />
            <Text style={styles.locationText}>
              @{photographerProfile?.city || photographerProfile?.location || 'No location set'}
            </Text>
          </View>
          {photographerProfile?.bio && (
            <Text style={styles.bio}>{photographerProfile.bio}</Text>
          )}
        </View>

        {/* Portfolio Section */}
        {portfolioImages.length > 0 && (
          <View style={styles.portfolioSection}>
            <Text style={styles.sectionTitle}>Portfolio</Text>
            <View style={styles.portfolioGrid}>
              {portfolioImages.slice(0, 9).map((imageUrl: string, index: number) => (
                <TouchableOpacity key={index} style={styles.portfolioItem}>
                  <Image 
                    source={{ uri: getImageUrl(imageUrl)! }} 
                    style={styles.portfolioImage}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {/* Customer Reviews */}
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(37,99,235,0.2)' }]}>
                <MessageSquare size={20} color={PRIMARY_COLOR} />
              </View>
              <View>
                <Text style={styles.menuItemTitle}>Customer Reviews</Text>
                <View style={styles.menuItemSubtitle}>
                  <Star size={12} color="#fbbf24" fill="#fbbf24" />
                  <Text style={styles.menuItemSubtitleText}>
                    {rating ? `${rating.toFixed(1)} (${reviewCount})` : 'No reviews yet'}
                  </Text>
                </View>
              </View>
            </View>
            <ChevronRight size={20} color="#6b7280" />
          </TouchableOpacity>

          {/* Photo Editing Service */}
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(168,85,247,0.2)' }]}>
                <Palette size={20} color="#a855f7" />
              </View>
              <View>
                <Text style={styles.menuItemTitle}>Photo Editing Service</Text>
                <View style={styles.menuItemSubtitle}>
                  {photographerProfile?.editingEnabled ? (
                    <>
                      <View style={styles.activeBadge}>
                        <Text style={styles.activeBadgeText}>Active</Text>
                      </View>
                      <Text style={styles.menuItemSubtitleText}>
                        £{photographerProfile?.editingRatePerPhoto}/photo
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.menuItemSubtitleText}>Not enabled</Text>
                  )}
                </View>
              </View>
            </View>
            <ChevronRight size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          testID="button-logout"
        >
          <LogOut size={18} color="#ef4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  content: { flex: 1 },

  coverSection: {
    height: 200,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1a1a',
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  backButton: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  editButtonText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  
  profilePictureContainer: {
    position: 'absolute',
    bottom: -40,
    left: 20,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#0a0a0a',
  },
  profilePicturePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1a1a1a',
    borderWidth: 3,
    borderColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0a0a0a',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  ratingBadgeText: { fontSize: 14, fontWeight: '700', color: '#fbbf24' },
  ratingBadgeCount: { fontSize: 12, color: '#9ca3af' },

  profileInfo: {
    padding: 20,
    paddingTop: 52,
  },
  profileName: { fontSize: 24, fontWeight: '700', color: '#fff' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  locationText: { fontSize: 14, color: '#9ca3af' },
  bio: { fontSize: 14, color: '#d1d5db', lineHeight: 22, marginTop: 12 },

  portfolioSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 12 },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  portfolioItem: {
    width: (SCREEN_WIDTH - 48) / 3,
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  portfolioImage: {
    width: '100%',
    height: '100%',
  },

  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemTitle: { fontSize: 15, fontWeight: '600', color: '#fff' },
  menuItemSubtitle: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  menuItemSubtitleText: { fontSize: 13, color: '#9ca3af' },
  activeBadge: {
    backgroundColor: 'rgba(34,197,94,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 4,
  },
  activeBadgeText: { fontSize: 11, fontWeight: '600', color: '#22c55e' },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    backgroundColor: 'rgba(239,68,68,0.1)',
  },
  logoutText: { fontSize: 15, fontWeight: '600', color: '#ef4444' },
});
