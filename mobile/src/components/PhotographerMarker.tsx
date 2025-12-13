import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Image, Text, StyleSheet, Platform } from 'react-native';
import { Marker } from 'react-native-maps';
import { Camera } from 'lucide-react-native';

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
  const [renderKey, setRenderKey] = useState(0);
  const markerRef = useRef<any>(null);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    // Force marker to redraw with the loaded image
    setRenderKey(k => k + 1);
    // Then stop tracking after a brief delay
    setTimeout(() => {
      if (markerRef.current) {
        markerRef.current.redraw?.();
      }
    }, 100);
  }, []);

  const handleImageError = useCallback(() => {
    setImageLoaded(true);
    setRenderKey(k => k + 1);
  }, []);

  // Force initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      if (markerRef.current) {
        markerRef.current.redraw?.();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Marker
      ref={markerRef}
      key={`marker-${id}-${renderKey}`}
      coordinate={coordinate}
      onPress={onPress}
      testID={testID}
      tracksViewChanges={!imageLoaded}
      anchor={{ x: 0.5, y: 1 }}
    >
      <View style={styles.container}>
        <View style={[styles.imageWrapper, isAvailable && styles.availableBorder]}>
          {!imageLoaded && (
            <View style={styles.placeholder}>
              <Camera size={20} color="#fff" />
            </View>
          )}
          <Image
            source={{ uri: imageUrl }}
            style={[styles.image, !imageLoaded && styles.hiddenImage]}
            onLoad={handleImageLoad}
            onError={handleImageError}
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
  const [renderKey, setRenderKey] = useState(0);
  const markerRef = useRef<any>(null);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    setRenderKey(k => k + 1);
    setTimeout(() => {
      if (markerRef.current) {
        markerRef.current.redraw?.();
      }
    }, 100);
  }, []);

  const handleImageError = useCallback(() => {
    setImageLoaded(true);
    setRenderKey(k => k + 1);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (markerRef.current) {
        markerRef.current.redraw?.();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Marker
      ref={markerRef}
      key={`spot-${id}-${renderKey}`}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  availableBorder: {
    borderColor: '#22c55e',
  },
  placeholder: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e293b',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  hiddenImage: {
    opacity: 0,
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
