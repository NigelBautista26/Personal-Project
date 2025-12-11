import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { MapPin, Camera } from 'lucide-react-native';

const PRIMARY_COLOR = '#2563eb';

const SAMPLE_SPOTS = [
  {
    id: 1,
    name: 'Tower Bridge',
    location: 'London, UK',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400',
  },
  {
    id: 2,
    name: 'Big Ben',
    location: 'Westminster, London',
    image: 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=400',
  },
  {
    id: 3,
    name: 'London Eye',
    location: 'South Bank, London',
    image: 'https://images.unsplash.com/photo-1520986606214-8b456906c813?w=400',
  },
  {
    id: 4,
    name: 'Buckingham Palace',
    location: 'Westminster, London',
    image: 'https://images.unsplash.com/photo-1587056753321-c3fef73bfc71?w=400',
  },
  {
    id: 5,
    name: 'St Pauls Cathedral',
    location: 'City of London',
    image: 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=400',
  },
  {
    id: 6,
    name: 'Trafalgar Square',
    location: 'Westminster, London',
    image: 'https://images.unsplash.com/photo-1533929736562-4937a4a16203?w=400',
  },
];

export default function SpotsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Photo Spots</Text>
        <Text style={styles.subtitle}>Popular photography locations near you</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {SAMPLE_SPOTS.map((spot) => (
            <TouchableOpacity
              key={spot.id}
              style={styles.spotCard}
              activeOpacity={0.8}
              testID={`card-spot-${spot.id}`}
            >
              <Image source={{ uri: spot.image }} style={styles.spotImage} />
              <View style={styles.spotOverlay}>
                <View style={styles.spotInfo}>
                  <Text style={styles.spotName}>{spot.name}</Text>
                  <View style={styles.spotLocation}>
                    <MapPin size={12} color="#9ca3af" />
                    <Text style={styles.spotLocationText}>{spot.location}</Text>
                  </View>
                </View>
                <View style={styles.cameraIcon}>
                  <Camera size={16} color="#fff" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
    padding: 20,
    paddingTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 100,
  },
  spotCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  spotImage: {
    width: '100%',
    height: '100%',
  },
  spotOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  spotInfo: {
    flex: 1,
  },
  spotName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  spotLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  spotLocationText: {
    color: '#9ca3af',
    fontSize: 11,
  },
  cameraIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(37,99,235,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
