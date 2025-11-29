import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet";
import L from "leaflet";
import { Link } from "wouter";
import { Navigation } from "lucide-react";
import "leaflet/dist/leaflet.css";

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

interface RealMapProps {
  selectedCity: City;
  photographers: Photographer[];
}

function MapController({ center, shouldFollowUser, userPosition }: { center: [number, number]; shouldFollowUser: boolean; userPosition: [number, number] | null }) {
  const map = useMap();

  useEffect(() => {
    if (shouldFollowUser && userPosition) {
      map.setView(userPosition, 14);
    } else {
      map.setView(center, 13);
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
      ">
        <div style="
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 2px solid white;
          overflow: hidden;
          background: #1f2937;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        ">
          <img src="${image}" alt="${name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://via.placeholder.com/48?text=P'" />
        </div>
        <div style="
          background: white;
          color: black;
          font-size: 10px;
          font-weight: bold;
          padding: 2px 8px;
          border-radius: 999px;
          margin-top: -8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">${price}</div>
        <div style="
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid white;
          margin-top: 2px;
        "></div>
      </div>
    `,
    iconSize: [48, 80],
    iconAnchor: [24, 80],
  });

  return (
    <Marker position={[lat, lng]} icon={icon}>
      <Popup className="photographer-popup">
        <Link href={`/photographer/${id}`}>
          <div className="flex items-center gap-2 cursor-pointer p-1">
            <img src={image} alt={name} className="w-10 h-10 rounded-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=P'; }} />
            <div>
              <div className="font-bold text-sm">{name}</div>
              <div className="text-xs text-gray-500">{price}/hour</div>
            </div>
          </div>
        </Link>
      </Popup>
    </Marker>
  );
}

export function RealMap({ selectedCity, photographers }: RealMapProps) {
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [shouldFollowUser, setShouldFollowUser] = useState(false);

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

  return (
    <div className="absolute inset-0 w-full h-full z-0">
      <style>{`
        .leaflet-container {
          background: #0a0a0a;
        }
        .leaflet-popup-content-wrapper {
          background: #1f2937;
          color: white;
          border-radius: 12px;
        }
        .leaflet-popup-tip {
          background: #1f2937;
        }
        .leaflet-popup-close-button {
          color: white !important;
        }
        .leaflet-control-zoom {
          border: none !important;
        }
        .leaflet-control-zoom a {
          background: rgba(0,0,0,0.7) !important;
          color: white !important;
          border: none !important;
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
      `}</style>
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapController center={mapCenter} shouldFollowUser={shouldFollowUser} userPosition={userPosition} />
        <UserLocationMarker userPosition={userPosition} />
        {photographers.map((p: Photographer) => (
          <PhotographerMarker
            key={p.id}
            id={p.id}
            name={p.fullName || "Photographer"}
            lat={parseFloat(p.latitude)}
            lng={parseFloat(p.longitude)}
            price={`£${parseFloat(p.hourlyRate)}`}
            image={p.profileImageUrl || "https://via.placeholder.com/48?text=P"}
          />
        ))}
      </MapContainer>
      
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-[1000]" />
      
      <button
        onClick={handleLocateMe}
        disabled={isLocating}
        className="absolute bottom-[45%] right-4 z-[1000] w-12 h-12 bg-black/80 hover:bg-black rounded-full flex items-center justify-center text-white shadow-lg border border-white/20 transition-all"
        data-testid="button-locate-me"
        title="Find my location"
      >
        {isLocating ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Navigation className="w-5 h-5" />
        )}
      </button>
      
      {locationError && (
        <div className="absolute bottom-[52%] right-4 z-[1000] bg-red-500/90 text-white text-xs px-3 py-1.5 rounded-full">
          {locationError}
        </div>
      )}
    </div>
  );
}
