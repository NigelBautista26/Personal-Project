import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet";
import L from "leaflet";
import { Link } from "wouter";
import { Navigation, Layers, MapIcon, Satellite, Map as MapViewIcon } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { motion, AnimatePresence } from "framer-motion";

interface City {
  name: string;
  country: string;
  lat: number;
  lng: number;
}

interface Photographer {
  id: string;
  fullName?: string | null;
  latitude: string;
  longitude: string;
  hourlyRate: string;
  profileImageUrl?: string | null;
}

interface PhotoSpot {
  id: string;
  name: string;
  latitude: string;
  longitude: string;
  category: string;
  imageUrl: string;
}

interface RealMapProps {
  selectedCity: City;
  photographers: Photographer[];
  photoSpots?: PhotoSpot[];
}

type MapStyle = 'dark' | 'satellite' | 'street';

const MAP_STYLES = {
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    name: "Dark",
    icon: MapViewIcon,
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; Esri, Maxar, Earthstar Geographics',
    name: "Satellite",
    icon: Satellite,
  },
  street: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    name: "Street",
    icon: MapIcon,
  },
};

function MapController({ center, shouldFollowUser, userPosition }: { center: [number, number]; shouldFollowUser: boolean; userPosition: [number, number] | null }) {
  const map = useMap();

  useEffect(() => {
    if (shouldFollowUser && userPosition) {
      map.setView(userPosition, 14);
    } else {
      map.setView(center, 12);
    }
  }, [center, shouldFollowUser, userPosition, map]);

  return null;
}

function UserLocationMarker({ userPosition }: { userPosition: [number, number] | null }) {
  const userIcon = L.divIcon({
    className: "user-location-marker",
    html: `
      <div style="position: relative;">
        <div style="
          position: absolute;
          width: 60px;
          height: 60px;
          background: rgba(59, 130, 246, 0.2);
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: pulse 2s infinite;
        "></div>
        <div style="
          width: 24px;
          height: 24px;
          background: #3b82f6;
          border: 4px solid white;
          border-radius: 50%;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.6);
          position: relative;
          z-index: 10;
        "></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  return userPosition ? (
    <>
      <Marker position={userPosition} icon={userIcon}>
        <Popup className="photographer-popup">
          <div className="text-center p-1">
            <div className="font-bold text-sm">You are here</div>
          </div>
        </Popup>
      </Marker>
      <Circle 
        center={userPosition} 
        radius={100} 
        pathOptions={{ 
          color: '#3b82f6', 
          fillColor: '#3b82f6', 
          fillOpacity: 0.1,
          weight: 2
        }} 
      />
    </>
  ) : null;
}

interface PhotographerMarkerProps {
  id: string;
  name: string;
  lat: number;
  lng: number;
  price: string;
  image: string;
}

function PhotographerMarker({ id, name, lat, lng, price, image }: PhotographerMarkerProps) {
  const icon = L.divIcon({
    className: "photographer-marker",
    html: `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        transform: translate(-50%, -100%);
        animation: markerBounce 0.5s ease-out;
      ">
        <div style="
          width: 52px;
          height: 52px;
          border-radius: 50%;
          border: 3px solid #3b82f6;
          overflow: hidden;
          background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4), 0 0 0 2px rgba(59, 130, 246, 0.2);
          animation: markerGlow 2s ease-in-out infinite;
        ">
          <img src="${image}" alt="${name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://via.placeholder.com/52?text=P'" />
        </div>
        <div style="
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          font-size: 11px;
          font-weight: bold;
          padding: 3px 10px;
          border-radius: 999px;
          margin-top: -10px;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5);
          z-index: 10;
          position: relative;
        ">${price}</div>
        <div style="
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 10px solid #2563eb;
          margin-top: 2px;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        "></div>
      </div>
    `,
    iconSize: [52, 85],
    iconAnchor: [26, 85],
  });

  return (
    <Marker position={[lat, lng]} icon={icon}>
      <Popup className="photographer-popup">
        <Link href={`/photographer/${id}`}>
          <div className="flex items-center gap-3 cursor-pointer p-2 min-w-[180px]">
            <img src={image} alt={name} className="w-12 h-12 rounded-full object-cover border-2 border-blue-500" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48?text=P'; }} />
            <div>
              <div className="font-bold text-sm text-white">{name}</div>
              <div className="text-xs text-blue-400">{price}/hour</div>
              <div className="text-xs text-gray-400 mt-1">Tap to view profile</div>
            </div>
          </div>
        </Link>
      </Popup>
    </Marker>
  );
}

function PhotoSpotMarker({ spot }: { spot: PhotoSpot }) {
  const icon = L.divIcon({
    className: "photo-spot-marker",
    html: `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        transform: translate(-50%, -100%);
      ">
        <div style="
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: 2px solid #f59e0b;
          overflow: hidden;
          background: #1f2937;
          box-shadow: 0 2px 10px rgba(245, 158, 11, 0.3);
        ">
          <img src="${spot.imageUrl}" alt="${spot.name}" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <div style="
          width: 0;
          height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 6px solid #f59e0b;
          margin-top: 2px;
        "></div>
      </div>
    `,
    iconSize: [36, 50],
    iconAnchor: [18, 50],
  });

  return (
    <Marker position={[parseFloat(spot.latitude), parseFloat(spot.longitude)]} icon={icon}>
      <Popup className="photographer-popup">
        <Link href={`/photo-spots/${spot.id}`}>
          <div className="flex items-center gap-3 cursor-pointer p-2 min-w-[160px]">
            <img src={spot.imageUrl} alt={spot.name} className="w-10 h-10 rounded-lg object-cover border border-amber-500" />
            <div>
              <div className="font-bold text-sm text-white">{spot.name}</div>
              <div className="text-xs text-amber-400 capitalize">{spot.category}</div>
              <div className="text-xs text-gray-400 mt-1">Photo Spot</div>
            </div>
          </div>
        </Link>
      </Popup>
    </Marker>
  );
}

export function RealMap({ selectedCity, photographers, photoSpots = [] }: RealMapProps) {
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [shouldFollowUser, setShouldFollowUser] = useState(false);
  const [mapStyle, setMapStyle] = useState<MapStyle>('dark');
  const [showStylePicker, setShowStylePicker] = useState(false);

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPosition([position.coords.latitude, position.coords.longitude]);
        setShouldFollowUser(true);
        setIsLocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationError("Location access denied");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (position) => {
        setUserPosition([position.coords.latitude, position.coords.longitude]);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    setShouldFollowUser(false);
  }, [selectedCity]);

  const mapCenter: [number, number] = [selectedCity.lat, selectedCity.lng];
  const currentStyle = MAP_STYLES[mapStyle];

  return (
    <div className="absolute inset-0 w-full h-full z-0">
      <style>{`
        .leaflet-container {
          background: ${mapStyle === 'satellite' ? '#1a3a1a' : '#0a0a0a'};
        }
        .leaflet-popup-content-wrapper {
          background: rgba(17, 24, 39, 0.95);
          backdrop-filter: blur(10px);
          color: white;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .leaflet-popup-tip {
          background: rgba(17, 24, 39, 0.95);
        }
        .leaflet-popup-close-button {
          color: white !important;
        }
        .leaflet-control-zoom {
          border: none !important;
        }
        .leaflet-control-zoom a {
          background: rgba(0,0,0,0.8) !important;
          color: white !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          backdrop-filter: blur(10px);
        }
        .leaflet-control-zoom a:hover {
          background: rgba(0,0,0,0.9) !important;
        }
        .leaflet-control-attribution {
          background: rgba(0,0,0,0.5) !important;
          color: rgba(255,255,255,0.5) !important;
        }
        .leaflet-control-attribution a {
          color: rgba(255,255,255,0.7) !important;
        }
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
        @keyframes markerBounce {
          0% { transform: translate(-50%, -120%) scale(0.5); opacity: 0; }
          50% { transform: translate(-50%, -90%); }
          70% { transform: translate(-50%, -105%); }
          100% { transform: translate(-50%, -100%) scale(1); opacity: 1; }
        }
        @keyframes markerGlow {
          0%, 100% { box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4), 0 0 0 2px rgba(59, 130, 246, 0.2); }
          50% { box-shadow: 0 4px 25px rgba(59, 130, 246, 0.6), 0 0 0 4px rgba(59, 130, 246, 0.3); }
        }
      `}</style>
      <MapContainer
        center={mapCenter}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        key={mapStyle}
      >
        <TileLayer
          attribution={currentStyle.attribution}
          url={currentStyle.url}
        />
        <MapController center={mapCenter} shouldFollowUser={shouldFollowUser} userPosition={userPosition} />
        <UserLocationMarker userPosition={userPosition} />
        
        {photoSpots.map((spot) => (
          <PhotoSpotMarker key={spot.id} spot={spot} />
        ))}
        
        {photographers.map((p: Photographer) => (
          <PhotographerMarker
            key={p.id}
            id={p.id}
            name={p.fullName || "Photographer"}
            lat={parseFloat(p.latitude)}
            lng={parseFloat(p.longitude)}
            price={`£${parseFloat(p.hourlyRate)}`}
            image={p.profileImageUrl || "https://via.placeholder.com/52?text=P"}
          />
        ))}
      </MapContainer>
      
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-[1000]" />
      
      <div className="absolute bottom-[45%] right-4 z-[1000] flex flex-col gap-2">
        <div className="relative">
          <button
            onClick={() => setShowStylePicker(!showStylePicker)}
            className="w-12 h-12 bg-black/80 hover:bg-black rounded-full flex items-center justify-center text-white shadow-lg border border-white/20 transition-all backdrop-blur-sm"
            data-testid="button-map-style"
            title="Change map style"
          >
            <Layers className="w-5 h-5" />
          </button>
          
          <AnimatePresence>
            {showStylePicker && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: 10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: 10 }}
                className="absolute right-14 top-0 bg-black/90 backdrop-blur-md rounded-2xl border border-white/10 p-2 shadow-xl"
              >
                {(Object.entries(MAP_STYLES) as [MapStyle, typeof MAP_STYLES.dark][]).map(([key, style]) => {
                  const Icon = style.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setMapStyle(key);
                        setShowStylePicker(false);
                      }}
                      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all ${
                        mapStyle === key 
                          ? 'bg-blue-500/20 text-blue-400' 
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                      data-testid={`button-style-${key}`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium text-sm whitespace-nowrap">{style.name}</span>
                      {mapStyle === key && (
                        <div className="w-2 h-2 rounded-full bg-blue-400 ml-auto" />
                      )}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <button
          onClick={handleLocateMe}
          disabled={isLocating}
          className="w-12 h-12 bg-black/80 hover:bg-black rounded-full flex items-center justify-center text-white shadow-lg border border-white/20 transition-all backdrop-blur-sm"
          data-testid="button-locate-me"
          title="Find my location"
        >
          {isLocating ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Navigation className="w-5 h-5" />
          )}
        </button>
      </div>
      
      {locationError && (
        <div className="absolute bottom-[55%] right-4 z-[1000] bg-red-500/90 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
          {locationError}
        </div>
      )}
    </div>
  );
}
