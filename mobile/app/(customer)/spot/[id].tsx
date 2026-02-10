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
import { MapPin, Camera, Users, Clock, Star } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PRIMARY_COLOR = '#2563eb';

const ALL_SPOTS_DATA: { [key: number]: {
  id: number;
  name: string;
  location: string;
  city: string;
  description: string;
  image: string;
  gallery: string[];
  bestTime: string;
  photographersNearby: number;
  rating: number;
  tips: string[];
}} = {
  1: {
    id: 1, name: 'Tower Bridge', location: 'London, UK', city: 'London',
    description: 'One of London\'s most iconic landmarks, Tower Bridge offers stunning photo opportunities from multiple angles. The Victorian Gothic architecture and the River Thames create a perfect backdrop.',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600', 'https://images.unsplash.com/photo-1520986606214-8b456906c813?w=600'],
    bestTime: 'Golden Hour', photographersNearby: 4, rating: 4.8,
    tips: ['Visit during blue hour for bridge lights', 'South bank offers best angles', 'Bridge opens occasionally - rare photo opportunity!'],
  },
  2: {
    id: 2, name: 'Big Ben', location: 'Westminster, London', city: 'London',
    description: 'The Elizabeth Tower, commonly known as Big Ben, is a symbol of London. Its Gothic Revival architecture makes it a must-visit for photographers.',
    image: 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=600', 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=600'],
    bestTime: 'Early Morning', photographersNearby: 5, rating: 4.9,
    tips: ['Westminster Bridge offers great angles', 'Night photography captures illuminated clock', 'Check for Parliament sitting times'],
  },
  3: {
    id: 3, name: 'London Eye', location: 'South Bank, London', city: 'London',
    description: 'The London Eye offers panoramic views and stunning photo opportunities from afar or inside the capsules.',
    image: 'https://images.unsplash.com/photo-1520986606214-8b456906c813?w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1520986606214-8b456906c813?w=600', 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600'],
    bestTime: 'Sunset', photographersNearby: 3, rating: 4.7,
    tips: ['Jubilee Gardens offers great angles', 'Long exposure at night creates light trails', 'Combine with Big Ben in shots'],
  },
  4: {
    id: 4, name: 'Buckingham Palace', location: 'Westminster, London', city: 'London',
    description: 'The official residence of the UK\'s sovereigns, Buckingham Palace is a magnificent backdrop for photos.',
    image: 'https://images.unsplash.com/photo-1533856493584-0c6ca8ca9ce3?w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1533856493584-0c6ca8ca9ce3?w=600', 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=600'],
    bestTime: 'Morning', photographersNearby: 2, rating: 4.6,
    tips: ['Arrive early for Changing of the Guard', 'Victoria Memorial offers elevation', 'St James\'s Park provides natural frames'],
  },
  5: {
    id: 5, name: 'Eiffel Tower', location: 'Paris, France', city: 'Paris',
    description: 'The iconic symbol of Paris and one of the most photographed structures in the world. Perfect for romantic and architectural shots.',
    image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=600', 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600'],
    bestTime: 'Sunset/Night', photographersNearby: 6, rating: 4.9,
    tips: ['Trocadero offers the classic front view', 'Light show starts every hour after dark', 'Champ de Mars for picnic shots'],
  },
  6: {
    id: 6, name: 'Louvre Museum', location: 'Paris, France', city: 'Paris',
    description: 'The world\'s largest art museum featuring the iconic glass pyramid entrance. Perfect blend of classical and modern architecture.',
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600', 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=600'],
    bestTime: 'Blue Hour', photographersNearby: 4, rating: 4.8,
    tips: ['Pyramid reflections work best after rain', 'Visit before opening for empty courtyard', 'Night illumination is stunning'],
  },
  7: {
    id: 7, name: 'Notre Dame', location: 'Paris, France', city: 'Paris',
    description: 'Historic medieval Catholic cathedral known for its Gothic architecture and stunning rose windows.',
    image: 'https://images.unsplash.com/photo-1478391679764-b2d8b3cd1e94?w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1478391679764-b2d8b3cd1e94?w=600', 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600'],
    bestTime: 'Morning', photographersNearby: 3, rating: 4.7,
    tips: ['Seine riverbanks offer unique angles', 'Currently under restoration - check access', 'Square Jean XXIII for garden shots'],
  },
  8: {
    id: 8, name: 'Statue of Liberty', location: 'New York, USA', city: 'New York',
    description: 'A colossal neoclassical sculpture symbolizing freedom. Best captured from the ferry or Liberty Island.',
    image: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=600', 'https://images.unsplash.com/photo-1496588152823-86ff7695e68f?w=600'],
    bestTime: 'Sunset', photographersNearby: 3, rating: 4.8,
    tips: ['Staten Island Ferry is free and offers great views', 'Book crown tickets months ahead', 'Golden hour from Brooklyn'],
  },
  9: {
    id: 9, name: 'Central Park', location: 'Manhattan, NY', city: 'New York',
    description: 'An urban oasis in Manhattan offering endless photo opportunities through all seasons.',
    image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600', 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=600'],
    bestTime: 'Morning/Autumn', photographersNearby: 5, rating: 4.7,
    tips: ['Bow Bridge is most photogenic', 'Fall foliage peaks in late October', 'Bethesda Fountain for classic shots'],
  },
  10: {
    id: 10, name: 'Brooklyn Bridge', location: 'New York, USA', city: 'New York',
    description: 'Historic suspension bridge connecting Manhattan and Brooklyn, offering iconic NYC skyline views.',
    image: 'https://images.unsplash.com/photo-1496588152823-86ff7695e68f?w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1496588152823-86ff7695e68f?w=600', 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600'],
    bestTime: 'Sunrise', photographersNearby: 4, rating: 4.9,
    tips: ['DUMBO offers the famous Manhattan view', 'Walk at sunrise for fewer crowds', 'Brooklyn Bridge Park for skyline shots'],
  },
  11: {
    id: 11, name: 'Tokyo Tower', location: 'Tokyo, Japan', city: 'Tokyo',
    description: 'Iconic red and white communications tower inspired by the Eiffel Tower, offering panoramic city views.',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600', 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600'],
    bestTime: 'Night', photographersNearby: 4, rating: 4.6,
    tips: ['Zojo-ji Temple provides traditional foreground', 'Shiba Park for classic angles', 'Night illumination changes seasonally'],
  },
  12: {
    id: 12, name: 'Senso-ji Temple', location: 'Asakusa, Tokyo', city: 'Tokyo',
    description: 'Tokyo\'s oldest and most significant temple, featuring the iconic Thunder Gate and five-story pagoda.',
    image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600'],
    bestTime: 'Early Morning', photographersNearby: 5, rating: 4.8,
    tips: ['Visit before 7am for empty shots', 'Nakamise Street is photogenic', 'New Year period has special decorations'],
  },
  13: {
    id: 13, name: 'Shibuya Crossing', location: 'Shibuya, Tokyo', city: 'Tokyo',
    description: 'The world\'s busiest pedestrian crossing, a symbol of Tokyo\'s energy and urban life.',
    image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=600', 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600'],
    bestTime: 'Night', photographersNearby: 6, rating: 4.7,
    tips: ['Starbucks 2F offers elevated view', 'Long exposure captures crowd flow', 'Neon signs brightest after 7pm'],
  },
  14: {
    id: 14, name: 'Burj Khalifa', location: 'Dubai, UAE', city: 'Dubai',
    description: 'The world\'s tallest building, a modern architectural marvel rising 828 meters into the sky.',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600', 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=600'],
    bestTime: 'Sunset/Night', photographersNearby: 5, rating: 4.9,
    tips: ['Dubai Fountain show starts at 6pm', 'Observation deck for aerial shots', 'Burj Park for reflection photos'],
  },
  15: {
    id: 15, name: 'Palm Jumeirah', location: 'Dubai, UAE', city: 'Dubai',
    description: 'Iconic man-made island in the shape of a palm tree, featuring luxury resorts and stunning views.',
    image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1518684079-3c830dcef090?w=600', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600'],
    bestTime: 'Golden Hour', photographersNearby: 3, rating: 4.6,
    tips: ['Helicopter tours for aerial perspective', 'Atlantis makes dramatic backdrop', 'Boardwalk at sunset is magical'],
  },
  16: {
    id: 16, name: 'Dubai Marina', location: 'Dubai, UAE', city: 'Dubai',
    description: 'Stunning waterfront development with skyscrapers, yachts, and a vibrant promenade.',
    image: 'https://images.unsplash.com/photo-1533395427226-788cee25cc7b?w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1533395427226-788cee25cc7b?w=600', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600'],
    bestTime: 'Blue Hour', photographersNearby: 4, rating: 4.7,
    tips: ['Marina Walk for promenade shots', 'Yacht reflections at dusk', 'JBR Beach for beach + skyline'],
  },
  17: {
    id: 17, name: 'Sagrada Familia', location: 'Barcelona, Spain', city: 'Barcelona',
    description: 'Gaudí\'s masterpiece basilica, an extraordinary blend of Gothic and Art Nouveau architecture.',
    image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600', 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600'],
    bestTime: 'Morning Light', photographersNearby: 5, rating: 4.9,
    tips: ['Interior light best 9-11am', 'Plaça de Gaudí for pond reflections', 'Book tower access for aerial views'],
  },
  18: {
    id: 18, name: 'Park Guell', location: 'Barcelona, Spain', city: 'Barcelona',
    description: 'Whimsical public park featuring Gaudí\'s colorful mosaic work and unique architectural elements.',
    image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600', 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600'],
    bestTime: 'Sunrise', photographersNearby: 4, rating: 4.8,
    tips: ['First entry slot has fewest crowds', 'Dragon fountain is most famous spot', 'Terrace offers city panorama'],
  },
  19: {
    id: 19, name: 'La Barceloneta', location: 'Barcelona, Spain', city: 'Barcelona',
    description: 'Barcelona\'s most famous beach neighborhood, perfect for beach life and sunset photography.',
    image: 'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=600', 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600'],
    bestTime: 'Sunset', photographersNearby: 3, rating: 4.5,
    tips: ['W Hotel makes dramatic backdrop', 'Golden hour beach portraits', 'Chiringuitos add local flavor'],
  },
  20: {
    id: 20, name: 'Colosseum', location: 'Rome, Italy', city: 'Rome',
    description: 'Ancient Roman amphitheater, one of the most iconic landmarks of the ancient world.',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600', 'https://images.unsplash.com/photo-1525874684015-58379d421a52?w=600'],
    bestTime: 'Golden Hour', photographersNearby: 6, rating: 4.9,
    tips: ['Early morning for no crowds', 'Night illumination is magical', 'Via dei Fori Imperiali for classic angle'],
  },
  21: {
    id: 21, name: 'Trevi Fountain', location: 'Rome, Italy', city: 'Rome',
    description: 'Baroque masterpiece and one of the most famous fountains in the world.',
    image: 'https://images.unsplash.com/photo-1525874684015-58379d421a52?w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1525874684015-58379d421a52?w=600', 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600'],
    bestTime: 'Dawn', photographersNearby: 4, rating: 4.8,
    tips: ['Visit before 7am for empty shots', 'Night lighting is romantic', 'Throw a coin for tradition'],
  },
  22: {
    id: 22, name: 'Vatican City', location: 'Vatican City', city: 'Rome',
    description: 'The smallest country in the world, home to St. Peter\'s Basilica and the Sistine Chapel.',
    image: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=600', 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600'],
    bestTime: 'Morning', photographersNearby: 5, rating: 4.9,
    tips: ['St. Peter\'s Square at dawn', 'Dome climb for aerial views', 'Wednesday papal audiences add atmosphere'],
  },
  23: {
    id: 23, name: 'Opera House', location: 'Sydney, Australia', city: 'Sydney',
    description: 'UNESCO World Heritage site and one of the most distinctive buildings of the 20th century.',
    image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600', 'https://images.unsplash.com/photo-1524293581917-878a6d017c71?w=600'],
    bestTime: 'Golden Hour', photographersNearby: 5, rating: 4.9,
    tips: ['Mrs Macquaries Chair for Opera House + Bridge', 'Vivid Sydney for light projections', 'Circular Quay for front views'],
  },
  24: {
    id: 24, name: 'Harbour Bridge', location: 'Sydney, Australia', city: 'Sydney',
    description: 'Iconic steel arch bridge connecting Sydney CBD to the North Shore.',
    image: 'https://images.unsplash.com/photo-1524293581917-878a6d017c71?w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1524293581917-878a6d017c71?w=600', 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600'],
    bestTime: 'Sunset', photographersNearby: 4, rating: 4.8,
    tips: ['Milsons Point for close-ups', 'BridgeClimb for unique perspective', 'NYE fireworks from the harbour'],
  },
  25: {
    id: 25, name: 'Bondi Beach', location: 'Sydney, Australia', city: 'Sydney',
    description: 'Australia\'s most famous beach, known for its golden sand and iconic coastal walk.',
    image: 'https://images.unsplash.com/photo-1523428096881-5bd79d043006?w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1523428096881-5bd79d043006?w=600', 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600'],
    bestTime: 'Sunrise', photographersNearby: 3, rating: 4.6,
    tips: ['Bondi to Coogee walk is scenic', 'Icebergs Pool is iconic', 'Surf culture makes great portraits'],
  },
};

export default function SpotDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const spotId = parseInt(id || '1', 10);
  const spot = ALL_SPOTS_DATA[spotId];

  if (!spot) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Spot not found</Text>
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
          <SafeAreaView style={styles.headerSafe} />
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
              <Text style={styles.statLabel}>Nearby</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Clock size={18} color="#22c55e" />
              <Text style={styles.statValue} numberOfLines={1}>{spot.bestTime.split('/')[0]}</Text>
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
          <Text style={styles.bookButtonText}>Find Photographers in {spot.city}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#fff', fontSize: 18, marginBottom: 16 },
  heroContainer: { height: 280, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
  headerSafe: { position: 'absolute', top: 0, left: 0, right: 0 },
  heroContent: { position: 'absolute', bottom: 20, left: 20, right: 20 },
  heroTitle: { color: '#fff', fontSize: 26, fontWeight: '700', marginBottom: 8 },
  heroLocation: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroLocationText: { color: '#fff', fontSize: 14, opacity: 0.9 },
  content: { padding: 20 },
  statsRow: { flexDirection: 'row', backgroundColor: '#1a1a1a', borderRadius: 16, padding: 16, marginBottom: 24 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { color: '#fff', fontSize: 16, fontWeight: '600', marginTop: 6 },
  statLabel: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  section: { marginBottom: 24 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 12 },
  description: { color: '#9ca3af', fontSize: 14, lineHeight: 22 },
  bestTimeCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#1a1a1a', padding: 16, borderRadius: 12 },
  bestTimeText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  tipItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: '#1a1a1a', padding: 14, borderRadius: 12, marginBottom: 8 },
  tipText: { color: '#9ca3af', fontSize: 14, flex: 1, lineHeight: 20 },
  gallery: { marginHorizontal: -20, paddingHorizontal: 20 },
  galleryImage: { width: 180, height: 120, borderRadius: 12, marginRight: 12 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 36, backgroundColor: '#0a0a0a', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  bookButton: { backgroundColor: PRIMARY_COLOR, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 12 },
  bookButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
