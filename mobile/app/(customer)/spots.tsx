import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { router } from 'expo-router';
import { MapPin, Camera } from 'lucide-react-native';
import { useCity } from '../../src/context/CityContext';

const PRIMARY_COLOR = '#2563eb';

const ALL_SPOTS: { [city: string]: { id: number; name: string; location: string; image: string; latitude: number; longitude: number }[] } = {
  London: [
    { id: 1, name: 'Tower Bridge', location: 'London, UK', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80', latitude: 51.5055, longitude: -0.0754 },
    { id: 2, name: 'Big Ben', location: 'Westminster, London', image: 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=800&q=80', latitude: 51.5007, longitude: -0.1246 },
    { id: 3, name: 'London Eye', location: 'South Bank, London', image: 'https://images.unsplash.com/photo-1520986606214-8b456906c813?w=800&q=80', latitude: 51.5033, longitude: -0.1195 },
    { id: 4, name: 'Buckingham Palace', location: 'Westminster, London', image: 'https://images.unsplash.com/photo-1533856493584-0c6ca8ca9ce3?w=800&q=80', latitude: 51.5014, longitude: -0.1419 },
  ],
  Paris: [
    { id: 5, name: 'Eiffel Tower', location: 'Paris, France', image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&q=80', latitude: 48.8584, longitude: 2.2945 },
    { id: 6, name: 'Louvre Museum', location: 'Paris, France', image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80', latitude: 48.8606, longitude: 2.3376 },
    { id: 7, name: 'Notre Dame', location: 'Paris, France', image: 'https://images.unsplash.com/photo-1478391679764-b2d8b3cd1e94?w=800&q=80', latitude: 48.8530, longitude: 2.3499 },
  ],
  'New York': [
    { id: 8, name: 'Statue of Liberty', location: 'New York, USA', image: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=800&q=80', latitude: 40.6892, longitude: -74.0445 },
    { id: 9, name: 'Central Park', location: 'Manhattan, NY', image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&q=80', latitude: 40.7829, longitude: -73.9654 },
    { id: 10, name: 'Brooklyn Bridge', location: 'New York, USA', image: 'https://images.unsplash.com/photo-1496588152823-86ff7695e68f?w=800&q=80', latitude: 40.7061, longitude: -73.9969 },
  ],
  Tokyo: [
    { id: 11, name: 'Tokyo Tower', location: 'Tokyo, Japan', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80', latitude: 35.6586, longitude: 139.7454 },
    { id: 12, name: 'Senso-ji Temple', location: 'Asakusa, Tokyo', image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&q=80', latitude: 35.7148, longitude: 139.7967 },
    { id: 13, name: 'Shibuya Crossing', location: 'Shibuya, Tokyo', image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&q=80', latitude: 35.6595, longitude: 139.7004 },
  ],
  Dubai: [
    { id: 14, name: 'Burj Khalifa', location: 'Dubai, UAE', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80', latitude: 25.1972, longitude: 55.2744 },
    { id: 15, name: 'Palm Jumeirah', location: 'Dubai, UAE', image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&q=80', latitude: 25.1124, longitude: 55.1390 },
    { id: 16, name: 'Dubai Marina', location: 'Dubai, UAE', image: 'https://images.unsplash.com/photo-1533395427226-788cee25cc7b?w=800&q=80', latitude: 25.0805, longitude: 55.1403 },
  ],
  Barcelona: [
    { id: 17, name: 'Sagrada Familia', location: 'Barcelona, Spain', image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80', latitude: 41.4036, longitude: 2.1744 },
    { id: 18, name: 'Park Guell', location: 'Barcelona, Spain', image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80', latitude: 41.4145, longitude: 2.1527 },
    { id: 19, name: 'La Barceloneta', location: 'Barcelona, Spain', image: 'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=800&q=80', latitude: 41.3784, longitude: 2.1925 },
  ],
  Rome: [
    { id: 20, name: 'Colosseum', location: 'Rome, Italy', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80', latitude: 41.8902, longitude: 12.4922 },
    { id: 21, name: 'Trevi Fountain', location: 'Rome, Italy', image: 'https://images.unsplash.com/photo-1525874684015-58379d421a52?w=800&q=80', latitude: 41.9009, longitude: 12.4833 },
    { id: 22, name: 'Vatican City', location: 'Vatican City', image: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=800&q=80', latitude: 41.9029, longitude: 12.4534 },
  ],
  Sydney: [
    { id: 23, name: 'Opera House', location: 'Sydney, Australia', image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&q=80', latitude: -33.8568, longitude: 151.2153 },
    { id: 24, name: 'Harbour Bridge', location: 'Sydney, Australia', image: 'https://images.unsplash.com/photo-1524293581917-878a6d017c71?w=800&q=80', latitude: -33.8523, longitude: 151.2108 },
    { id: 25, name: 'Bondi Beach', location: 'Sydney, Australia', image: 'https://images.unsplash.com/photo-1523428096881-5bd79d043006?w=800&q=80', latitude: -33.8908, longitude: 151.2743 },
  ],
};

export default function SpotsScreen() {
  const { selectedCity } = useCity();

  const getSpots = () => {
    const cityName = selectedCity.name;
    if (ALL_SPOTS[cityName]) {
      return ALL_SPOTS[cityName];
    }
    return [];
  };

  const spots = getSpots();

  const handleSpotPress = (spotId: number) => {
    router.push(`/(customer)/spot/${spotId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Photo Spots</Text>
        <Text style={styles.subtitle}>Popular spots in {selectedCity.name}</Text>
      </View>

      <View style={styles.cityIndicator}>
        <MapPin size={16} color={PRIMARY_COLOR} />
        <Text style={styles.cityIndicatorText}>{selectedCity.name}</Text>
        <Text style={styles.cityHint}>Change city from Map tab</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {spots.length === 0 ? (
          <View style={styles.emptyState}>
            <MapPin size={48} color="#4b5563" />
            <Text style={styles.emptyTitle}>No spots available</Text>
            <Text style={styles.emptyText}>
              We don't have photo spots for {selectedCity.name} yet. Try selecting a different city from the Map tab.
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {spots.map((spot) => (
              <TouchableOpacity
                key={spot.id}
                style={styles.spotCard}
                activeOpacity={0.8}
                onPress={() => handleSpotPress(spot.id)}
                testID={`card-spot-${spot.id}`}
              >
                <ImageBackground 
                  source={{ uri: spot.image }} 
                  style={styles.spotImage}
                  imageStyle={{ borderRadius: 16 }}
                >
                  <View style={styles.spotOverlay}>
                    <View style={styles.spotInfo}>
                      <Text style={styles.spotName} numberOfLines={1}>{spot.name}</Text>
                      <View style={styles.spotLocation}>
                        <MapPin size={12} color="#9ca3af" />
                        <Text style={styles.spotLocationText} numberOfLines={1}>{spot.location}</Text>
                      </View>
                    </View>
                    <View style={styles.cameraIcon}>
                      <Camera size={16} color="#fff" />
                    </View>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View style={{ height: 100 }} />
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
    paddingBottom: 8,
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
  cityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cityIndicatorText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  cityHint: {
    marginLeft: 'auto',
    color: '#6b7280',
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
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
    justifyContent: 'flex-end',
  },
  spotOverlay: {
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  spotInfo: {
    flex: 1,
    marginRight: 8,
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
    flex: 1,
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
