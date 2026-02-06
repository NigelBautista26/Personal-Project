import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  ActivityIndicator,
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
  Plus,
  Trash2,
  X,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../../src/context/AuthContext';
import { API_URL } from '../../../src/api/client';
import { ThemedAlert } from '../../../src/components/ThemedAlert';
import { snapnowApi } from '../../../src/api/snapnowApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PRIMARY_COLOR = '#2563eb';

export default function PhotographerProfileScreen() {
  const { user, photographerProfile, logout, refreshPhotographerProfile } = useAuth();
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploadingProfilePic, setIsUploadingProfilePic] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

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
    setShowLogoutAlert(true);
  };

  const confirmLogout = async () => {
    setShowLogoutAlert(false);
    await logout();
    router.dismissAll();
  };

  const handleAddPhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (result.canceled || !result.assets?.[0]?.uri || !result.assets?.[0]?.base64) {
        return;
      }

      setIsUploading(true);

      const { uploadURL, objectPath } = await snapnowApi.getUploadUrl();
      
      // Convert base64 to binary for upload
      const base64Data = result.assets[0].base64;
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Upload using XMLHttpRequest with binary data
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadURL);
        xhr.setRequestHeader('Content-Type', result.assets[0].mimeType || 'image/jpeg');
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload failed with status ${xhr.status}`));
        };
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(bytes.buffer);
      });

      await snapnowApi.addPortfolioPhoto(objectPath);
      await refreshPhotographerProfile?.();
    } catch (error) {
      console.error('Failed to upload photo:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = (imageUrl: string) => {
    setPhotoToDelete(imageUrl);
    setShowDeleteAlert(true);
  };

  const confirmDeletePhoto = async () => {
    if (!photoToDelete) return;
    
    try {
      await snapnowApi.deletePortfolioPhoto(photoToDelete);
      await refreshPhotographerProfile?.();
    } catch (error) {
      console.error('Failed to delete photo:', error);
    } finally {
      setShowDeleteAlert(false);
      setPhotoToDelete(null);
    }
  };

  const handleUpdateProfilePicture = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (result.canceled || !result.assets?.[0]?.uri || !result.assets?.[0]?.base64) {
        return;
      }

      setIsUploadingProfilePic(true);

      const { uploadURL, objectPath } = await snapnowApi.getUploadUrl();
      
      // Convert base64 to binary for upload
      const base64Data = result.assets[0].base64;
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Upload using XMLHttpRequest with binary data
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadURL);
        xhr.setRequestHeader('Content-Type', result.assets[0].mimeType || 'image/jpeg');
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload failed with status ${xhr.status}`));
        };
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(bytes.buffer);
      });

      await snapnowApi.updateProfilePicture(objectPath);
      await refreshPhotographerProfile?.();
    } catch (error) {
      console.error('Failed to update profile picture:', error);
    } finally {
      setIsUploadingProfilePic(false);
    }
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
          <TouchableOpacity 
            style={[styles.editButton, isEditMode && styles.editButtonActive]}
            onPress={() => setIsEditMode(!isEditMode)}
            testID="button-toggle-edit-mode"
          >
            {isEditMode ? (
              <>
                <X size={14} color="#fff" />
                <Text style={styles.editButtonText}>Done</Text>
              </>
            ) : (
              <>
                <Edit size={14} color="#fff" />
                <Text style={styles.editButtonText}>Edit</Text>
              </>
            )}
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
            <TouchableOpacity 
              style={styles.cameraButton}
              onPress={handleUpdateProfilePicture}
              disabled={isUploadingProfilePic}
              testID="button-update-profile-picture"
            >
              {isUploadingProfilePic ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Camera size={14} color="#fff" />
              )}
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
        <View style={styles.portfolioSection}>
          <View style={styles.portfolioHeader}>
            <Text style={styles.sectionTitle}>Portfolio</Text>
            {isEditMode && (
              <TouchableOpacity 
                style={styles.addPhotoButton}
                onPress={handleAddPhoto}
                disabled={isUploading}
                testID="button-add-portfolio-photo"
              >
                {isUploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Plus size={16} color="#fff" />
                    <Text style={styles.addPhotoButtonText}>Add</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
          
          {portfolioImages.length > 0 ? (
            <View style={styles.portfolioGrid}>
              {portfolioImages.map((imageUrl: string, index: number) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.portfolioItem}
                  onPress={() => setSelectedImage(getImageUrl(imageUrl))}
                  testID={`button-portfolio-image-${index}`}
                >
                  <Image 
                    source={{ uri: getImageUrl(imageUrl)! }} 
                    style={styles.portfolioImage}
                  />
                  {isEditMode && (
                    <TouchableOpacity 
                      style={styles.deletePhotoButton}
                      onPress={() => handleDeletePhoto(imageUrl)}
                      testID={`button-delete-photo-${index}`}
                    >
                      <Trash2 size={12} color="#fff" />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyPortfolio}>
              <Camera size={32} color="#6b7280" />
              <Text style={styles.emptyPortfolioText}>Add photos to showcase your work</Text>
            </View>
          )}
        </View>

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

      <ThemedAlert
        visible={showLogoutAlert}
        title="Log out"
        message="Are you sure you want to log out?"
        icon="logout"
        onDismiss={() => setShowLogoutAlert(false)}
        buttons={[
          { text: 'Cancel', style: 'cancel', onPress: () => setShowLogoutAlert(false) },
          { text: 'Log out', style: 'destructive', onPress: confirmLogout },
        ]}
      />

      <ThemedAlert
        visible={showDeleteAlert}
        title="Delete photo"
        message="Are you sure you want to remove this photo from your portfolio?"
        icon="delete"
        onDismiss={() => setShowDeleteAlert(false)}
        buttons={[
          { text: 'Cancel', style: 'cancel', onPress: () => setShowDeleteAlert(false) },
          { text: 'Delete', style: 'destructive', onPress: confirmDeletePhoto },
        ]}
      />

      {/* Lightbox Modal */}
      <Modal
        visible={!!selectedImage}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.lightboxOverlay}>
          <TouchableOpacity 
            style={styles.lightboxCloseButton}
            onPress={() => setSelectedImage(null)}
            testID="button-close-lightbox"
          >
            <X size={24} color="#fff" />
          </TouchableOpacity>
          {selectedImage && (
            <Image 
              source={{ uri: selectedImage }} 
              style={styles.lightboxImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
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
  editButtonActive: {
    backgroundColor: PRIMARY_COLOR,
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
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: PRIMARY_COLOR,
  },
  addPhotoButtonText: { fontSize: 13, fontWeight: '600', color: '#fff' },
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
    position: 'relative',
  },
  portfolioImage: {
    width: '100%',
    height: '100%',
  },
  deletePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyPortfolio: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
  },
  emptyPortfolioText: { fontSize: 14, color: '#6b7280', textAlign: 'center' },

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

  lightboxOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxCloseButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  lightboxImage: {
    width: SCREEN_WIDTH - 40,
    height: SCREEN_WIDTH - 40,
    borderRadius: 12,
  },
});
