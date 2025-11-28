import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getPhotographers } from "@/lib/api";
import "leaflet/dist/leaflet.css";

function LocationMarker() {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const map = useMap();

  useEffect(() => {
    map.locate({ setView: true, maxZoom: 14 });
    
    map.on("locationfound", (e) => {
      setPosition([e.latlng.lat, e.latlng.lng]);
    });

    map.on("locationerror", () => {
      map.setView([51.5074, -0.1278], 13);
    });
  }, [map]);

  const userIcon = L.divIcon({
    className: "user-location-marker",
    html: `
      <div style="
        width: 20px;
        height: 20px;
        background: #3b82f6;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 10px rgba(59, 130, 246, 0.5);
      "></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  return position ? <Marker position={position} icon={userIcon} /> : null;
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
          <img src="${image}" alt="${name}" style="width: 100%; height: 100%; object-fit: cover;" />
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
            <img src={image} alt={name} className="w-10 h-10 rounded-full object-cover" />
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

export function RealMap() {
  const { data: photographers = [] } = useQuery({
    queryKey: ["photographers"],
    queryFn: getPhotographers,
  });

  const defaultCenter: [number, number] = [51.5074, -0.1278];

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
      `}</style>
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <LocationMarker />
        {photographers.map((p: any) => (
          <PhotographerMarker
            key={p.id}
            id={p.id}
            name={p.fullName || "Photographer"}
            lat={parseFloat(p.latitude)}
            lng={parseFloat(p.longitude)}
            price={`£${parseFloat(p.hourlyRate)}`}
            image={p.profileImageUrl}
          />
        ))}
      </MapContainer>
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-[1000]" />
    </div>
  );
}
