import React, { useState, useRef, useCallback } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';

interface PhotographerMarkerProps {
  id: number;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  imageUrl: string;
  hourlyRate: number;
  isAvailable: boolean;
  onPress: () => void;
  testID?: string;
}

export function PhotographerMarker({
  id,
  coordinate,
  imageUrl,
  hourlyRate,
  isAvailable,
  onPress,
  testID,
}: PhotographerMarkerProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const markerRef = useRef<any>(null);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageLoaded(true);
  }, []);

  return (
    <Marker
      ref={markerRef}
      coordinate={coordinate}
      onPress={onPress}
      testID={testID}
      tracksViewChanges={!imageLoaded}
      anchor={{ x: 0.5, y: 1 }}
    >
      <View style={styles.container}>
        <View style={[styles.imageWrapper, isAvailable && styles.availableBorder]}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            onLoad={handleImageLoad}
            onError={handleImageError}
            defaultSource={{ uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' }}
          />
        </View>
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>£{hourlyRate}</Text>
        </View>
      </View>
    </Marker>
  );
}

interface PhotoSpotMarkerProps {
  id: number;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  name: string;
  imageUrl: string;
  testID?: string;
}

export function PhotoSpotMarker({
  id,
  coordinate,
  name,
  imageUrl,
  testID,
}: PhotoSpotMarkerProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const markerRef = useRef<any>(null);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageLoaded(true);
  }, []);

  return (
    <Marker
      ref={markerRef}
      coordinate={coordinate}
      title={name}
      testID={testID}
      tracksViewChanges={!imageLoaded}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <View style={styles.spotContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.spotImage}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </View>
    </Marker>
  );
}

interface LiveLocationMarkerProps {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  onPress?: () => void;
  testID?: string;
}

export function LiveLocationMarker({
  coordinate,
  onPress,
  testID,
}: LiveLocationMarkerProps) {
  return (
    <Marker
      coordinate={coordinate}
      title="Photographer's Location"
      onPress={onPress}
      testID={testID}
      tracksViewChanges={false}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <View style={styles.liveContainer}>
        <View style={styles.livePulse} />
        <View style={styles.liveDot} />
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 56,
    height: 70,
  },
  imageWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#2563eb',
    backgroundColor: '#1e293b',
    overflow: 'hidden',
  },
  availableBorder: {
    borderColor: '#22c55e',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  priceTag: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: -6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  priceText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  spotContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#f59e0b',
    backgroundColor: '#1e293b',
  },
  spotImage: {
    width: '100%',
    height: '100%',
  },
  liveContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  livePulse: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
  },
  liveDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#fff',
  },
});
