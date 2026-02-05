import { RealMap } from "@/components/real-map";
import { BottomNav } from "@/components/bottom-nav";
import { MapPin, Users, Camera } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getPhotographers, getCurrentUser } from "@/lib/api";
import { CitySelector, City } from "@/components/city-selector";
import { useLocation } from "wouter";

interface Booking {
  id: string;
  status: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  photographerId: string;
  photographer: {
    fullName: string;
  };
}

const DEFAULT_CITY: City = { name: "London", country: "United Kingdom", lat: 51.5074, lng: -0.1278 };
const SEARCH_RADIUS_KM = 50;

interface PhotoSpot {
  id: string;
  name: string;
  city: string;
  latitude: string;
  longitude: string;
  category: string;
  imageUrl: string;
}

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function Home() {
  const [, setLocation] = useLocation();
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City>(DEFAULT_CITY);
  const [photographerLiveLocation, setPhotographerLiveLocation] = useState<{ lat: number; lng: number; bookingId: string; name: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("selectedCity");
    if (stored) {
      try {
        setSelectedCity(JSON.parse(stored));
      } catch (e) {
        setSelectedCity(DEFAULT_CITY);
      }
    }
  }, []);

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    localStorage.setItem("selectedCity", JSON.stringify(city));
  };

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  const { data: photographers = [] } = useQuery({
    queryKey: ["photographers"],
    queryFn: getPhotographers,
  });

  const { data: photoSpots = [] } = useQuery<PhotoSpot[]>({
    queryKey: ["photo-spots", selectedCity.name],
    queryFn: async () => {
      const res = await fetch(`/api/photo-spots?city=${encodeURIComponent(selectedCity.name)}`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: bookings = [] } = useQuery<Booking[]>({
    queryKey: ["customerBookings", currentUser?.id],
    queryFn: async () => {
      const res = await fetch(`/api/bookings/customer/${currentUser?.id}`, {
        credentials: "include",
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!currentUser?.id && currentUser?.role === "customer",
  });

  const activeSession = useMemo(() => {
    const now = new Date();
    return bookings.find((booking) => {
      if (booking.status !== "confirmed") return false;

      const sessionDate = new Date(booking.scheduledDate);
      const timeParts = booking.scheduledTime.replace(/[AP]M/i, "").trim().split(":");
      const hours = parseInt(timeParts[0]);
      const minutes = parseInt(timeParts[1]) || 0;
      const isPM = booking.scheduledTime.toLowerCase().includes("pm");
      sessionDate.setHours(
        isPM && hours !== 12 ? hours + 12 : hours === 12 && !isPM ? 0 : hours,
        minutes
      );

      const duration = booking.duration || 1;
      const sessionEnd = new Date(sessionDate.getTime() + duration * 60 * 60 * 1000);

      const minutesUntilStart = (sessionDate.getTime() - now.getTime()) / (1000 * 60);
      return minutesUntilStart <= 10 && now < sessionEnd;
    });
  }, [bookings]);

  const { data: photographerLocation } = useQuery<{ latitude: string; longitude: string } | null>({
    queryKey: ["photographer-live-location", activeSession?.id],
    queryFn: async () => {
      const res = await fetch(`/api/bookings/${activeSession!.id}/photographer-location`, {
        credentials: "include",
      });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!activeSession,
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (photographerLocation && activeSession) {
      setPhotographerLiveLocation({
        lat: parseFloat(photographerLocation.latitude),
        lng: parseFloat(photographerLocation.longitude),
        bookingId: activeSession.id,
        name: activeSession.photographer?.fullName || "Your Photographer",
      });
    } else {
      setPhotographerLiveLocation(null);
    }
  }, [photographerLocation, activeSession]);

  const filteredPhotographers = useMemo(() => {
    return photographers.filter((p: any) => {
      const pLat = parseFloat(p.latitude);
      const pLng = parseFloat(p.longitude);
      if (isNaN(pLat) || isNaN(pLng)) return false;
      const distance = getDistanceKm(selectedCity.lat, selectedCity.lng, pLat, pLng);
      return distance <= SEARCH_RADIUS_KM;
    });
  }, [photographers, selectedCity]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 z-20 p-4 pt-12 pointer-events-none">
        <div className="flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-2 bg-gray-900/90 rounded-full px-4 py-2 border border-gray-700">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span className="text-white font-medium text-sm">{selectedCity.name}</span>
          </div>
          <button
            onClick={() => setShowCitySelector(true)}
            className="bg-gray-900/90 rounded-full px-4 py-2 border border-gray-700 text-blue-500 font-medium text-sm hover:bg-gray-800 transition-colors"
            data-testid="button-change-city"
          >
            Change
          </button>
        </div>
      </div>

      <RealMap 
        selectedCity={selectedCity}
        photographers={filteredPhotographers}
        photoSpots={photoSpots}
        photographerLiveLocation={photographerLiveLocation}
        onLiveLocationClick={(bookingId) => setLocation(`/booking/${bookingId}`)}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute bottom-28 left-6 right-6 z-20"
      >
        <button
          onClick={() => setLocation("/photographers")}
          className="w-full glass rounded-2xl p-4 flex items-center gap-4 hover:bg-white/10 transition-colors"
          data-testid="button-browse-photographers"
        >
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-white font-semibold">
              {filteredPhotographers.length} Photographer{filteredPhotographers.length !== 1 ? "s" : ""} Available
            </p>
            <p className="text-muted-foreground text-sm">Browse photographers in {selectedCity.name}</p>
          </div>
        </button>
      </motion.div>

      <CitySelector
        isOpen={showCitySelector}
        onClose={() => setShowCitySelector(false)}
        onSelect={handleCitySelect}
        currentCity={selectedCity}
      />

      <BottomNav />
    </div>
  );
}
