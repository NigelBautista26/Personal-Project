import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, MapPin, Camera, Users, Clock, Star } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PRIMARY_COLOR = '#2563eb';

const SPOTS_DATA: { [key: number]: {
  id: number;
  name: string;
  location: string;
  description: string;
  image: string;
  gallery: string[];
  bestTime: string;
  photographersNearby: number;
  rating: number;
  tips: string[];
}} = {
  1: {
    id: 1,
    name: 'Tower Bridge',
    location: 'London, UK',
    description: 'One of London\'s most iconic landmarks, Tower Bridge offers stunning photo opportunities from multiple angles. The Victorian Gothic architecture and the River Thames create a perfect backdrop for portrait and landscape photography.',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80',
      'https://images.unsplash.com/photo-1533929736562-4937a4a16203?w=600&q=80',
      'https://images.unsplash.com/photo-1520986606214-8b456906c813?w=600&q=80',
    ],
    bestTime: 'Golden Hour (Sunrise/Sunset)',
    photographersNearby: 3,
    rating: 4.8,
    tips: ['Visit during blue hour for stunning bridge lights', 'Try shooting from the south bank for the best angles', 'The bridge opens occasionally - a rare photo opportunity!'],
  },
  2: {
    id: 2,
    name: 'Big Ben',
    location: 'Westminster, London',
    description: 'The Elizabeth Tower, commonly known as Big Ben, is a symbol of London and the United Kingdom. Its Gothic Revival architecture and iconic clock face make it a must-visit for photographers.',
    image: 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=600&q=80',
      'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=600&q=80',
      'https://images.unsplash.com/photo-1533929736562-4937a4a16203?w=600&q=80',
    ],
    bestTime: 'Early Morning or Evening',
    photographersNearby: 4,
    rating: 4.9,
    tips: ['Westminster Bridge offers great angles', 'Night photography captures the illuminated clock face', 'Check for Parliament sitting times - flag flying adds interest'],
  },
  3: {
    id: 3,
    name: 'London Eye',
    location: 'South Bank, London',
    description: 'The London Eye offers panoramic views and stunning photo opportunities. Whether capturing it from afar or taking photos from inside the capsules, this giant observation wheel is a photographer\'s delight.',
    image: 'https://images.unsplash.com/photo-1520986606214-8b456906c813?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1520986606214-8b456906c813?w=600&q=80',
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80',
      'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=600&q=80',
    ],
    bestTime: 'Sunset',
    photographersNearby: 5,
    rating: 4.7,
    tips: ['Jubilee Gardens offers great angles', 'Long exposure at night creates stunning light trails', 'Combine with Big Ben in your shots from the right angle'],
  },
  4: {
    id: 4,
    name: 'Buckingham Palace',
    location: 'Westminster, London',
    description: 'The official London residence of the UK\'s sovereigns, Buckingham Palace is a magnificent backdrop for photos. The Changing of the Guard ceremony adds extra photographic interest.',
    image: 'https://images.unsplash.com/photo-1533856493584-0c6ca8ca9ce3?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1533856493584-0c6ca8ca9ce3?w=600&q=80',
      'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=600&q=80',
      'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=600&q=80',
    ],
    bestTime: 'Morning (for Changing of the Guard)',
    photographersNearby: 2,
    rating: 4.6,
    tips: ['Arrive early for Changing of the Guard', 'The Victoria Memorial offers great elevation', 'St James\'s Park provides beautiful natural frames'],
  },
  5: {
    id: 5,
    name: 'St Pauls Cathedral',
    location: 'City of London',
    description: 'Sir Christopher Wren\'s masterpiece, St Paul\'s Cathedral features one of the most recognizable domes in the world. The cathedral\'s baroque architecture offers countless photo opportunities.',
    image: 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=600&q=80',
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80',
      'https://images.unsplash.com/photo-1520986606214-8b456906c813?w=600&q=80',
    ],
    bestTime: 'Golden Hour',
    photographersNearby: 3,
    rating: 4.8,
    tips: ['Millennium Bridge provides the classic angle', 'The interior is stunning for architecture shots', 'One New Change rooftop offers a unique perspective'],
  },
  6: {
    id: 6,
    name: 'Trafalgar Square',
    location: 'Westminster, London',
    description: 'The heart of London, Trafalgar Square features Nelson\'s Column, the famous lion statues, and the National Gallery. It\'s a vibrant location for street and architectural photography.',
    image: 'https://images.unsplash.com/photo-1533929736562-4937a4a16203?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1533929736562-4937a4a16203?w=600&q=80',
      'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=600&q=80',
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80',
    ],
    bestTime: 'Late Afternoon',
    photographersNearby: 6,
    rating: 4.5,
    tips: ['The fountains make great foreground elements', 'Visit during events for dynamic shots', 'The National Gallery steps offer elevated views'],
  },
};

export default function SpotDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const spotId = parseInt(id || '1', 10);
  const spot = SPOTS_DATA[spotId];

  if (!spot) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Spot not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroContainer}>
          <Image source={{ uri: spot.image }} style={styles.heroImage} />
          <View style={styles.heroOverlay} />
          <SafeAreaView style={styles.headerSafe}>
            <TouchableOpacity 
              style={styles.backIcon} 
              onPress={() => router.back()}
              testID="button-back"
            >
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
          </SafeAreaView>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>{spot.name}</Text>
            <View style={styles.heroLocation}>
              <MapPin size={16} color="#fff" />
              <Text style={styles.heroLocationText}>{spot.location}</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Star size={18} color="#fbbf24" fill="#fbbf24" />
              <Text style={styles.statValue}>{spot.rating}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Users size={18} color={PRIMARY_COLOR} />
              <Text style={styles.statValue}>{spot.photographersNearby}</Text>
              <Text style={styles.statLabel}>Photographers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Clock size={18} color="#22c55e" />
              <Text style={styles.statValue} numberOfLines={1}>{spot.bestTime.split(' ')[0]}</Text>
              <Text style={styles.statLabel}>Best Time</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About This Location</Text>
            <Text style={styles.description}>{spot.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Best Time to Visit</Text>
            <View style={styles.bestTimeCard}>
              <Clock size={20} color={PRIMARY_COLOR} />
              <Text style={styles.bestTimeText}>{spot.bestTime}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photography Tips</Text>
            {spot.tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Camera size={16} color={PRIMARY_COLOR} />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gallery</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gallery}>
              {spot.gallery.map((img, index) => (
                <Image 
                  key={index} 
                  source={{ uri: img }} 
                  style={styles.galleryImage} 
                />
              ))}
            </ScrollView>
          </View>

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => router.push('/(customer)/photographers')}
          testID="button-find-photographers"
        >
          <Camera size={20} color="#fff" />
          <Text style={styles.bookButtonText}>Find Photographers Nearby</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  heroContainer: {
    height: 300,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  headerSafe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  backIcon: {
    margin: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  heroLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroLocationText: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
  content: {
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 6,
  },
  statLabel: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    color: '#9ca3af',
    fontSize: 14,
    lineHeight: 22,
  },
  bestTimeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
  },
  bestTimeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#1a1a1a',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  tipText: {
    color: '#9ca3af',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  gallery: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  galleryImage: {
    width: 200,
    height: 140,
    borderRadius: 12,
    marginRight: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 36,
    backgroundColor: '#0a0a0a',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  bookButton: {
    backgroundColor: PRIMARY_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
