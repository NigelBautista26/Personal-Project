import { RealMap } from "@/components/real-map";
import { BottomNav } from "@/components/bottom-nav";
import { MapPin, Users } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getPhotographers } from "@/lib/api";
import { CitySelector, City } from "@/components/city-selector";
import { useLocation } from "wouter";

const DEFAULT_CITY: City = { name: "London", country: "United Kingdom", lat: 51.5074, lng: -0.1278 };
const SEARCH_RADIUS_KM = 50;

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

  const { data: photographers = [] } = useQuery({
    queryKey: ["photographers"],
    queryFn: getPhotographers,
  });

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
      <div className="absolute top-0 left-0 right-0 z-20 p-6 pt-12 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={() => setShowCitySelector(true)}
            className="flex-1 h-12 glass-dark rounded-full flex items-center px-4 gap-2 shadow-lg hover:bg-white/10 transition-colors"
            data-testid="button-change-city"
          >
            <MapPin className="w-5 h-5 text-white" />
            <span className="text-white font-medium">{selectedCity.name}</span>
            <span className="text-primary ml-auto text-xs font-medium">Change</span>
          </button>
        </div>
      </div>

      <RealMap 
        selectedCity={selectedCity}
        photographers={filteredPhotographers}
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
