import { RealMap } from "@/components/real-map";
import { BottomNav } from "@/components/bottom-nav";
import { PhotographerCard } from "@/components/photographer-card";
import { SlidersHorizontal, MapPin } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getPhotographers } from "@/lib/api";
import { CitySelector, City } from "@/components/city-selector";

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
  const [isExpanded, setIsExpanded] = useState(false);
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

  const { data: photographers = [], isLoading } = useQuery({
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

  const photographerCards = filteredPhotographers.map((p: any) => ({
    id: p.id,
    name: p.fullName || "Photographer",
    location: p.location,
    price: `£${parseFloat(p.hourlyRate)}`,
    rating: parseFloat(p.rating || "5.0"),
    reviews: p.reviewCount || 0,
    image: p.profileImageUrl || "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
  }));

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
          <button className="w-12 h-12 glass-dark rounded-full flex items-center justify-center text-white shadow-lg" data-testid="button-filters">
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      <RealMap 
        selectedCity={selectedCity}
        photographers={filteredPhotographers}
      />

      <motion.div 
        initial={{ y: "60%" }}
        animate={{ y: isExpanded ? "20%" : "60%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        drag="y"
        dragConstraints={{ top: 100, bottom: 400 }}
        onDragEnd={(_, info) => {
          if (info.offset.y < -50) setIsExpanded(true);
          if (info.offset.y > 50) setIsExpanded(false);
        }}
        className="absolute bottom-0 left-0 right-0 h-[80vh] bg-black border-t border-white/10 rounded-t-3xl z-30 p-6 pb-24 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
      >
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Photographers in {selectedCity.name}</h2>
            <p className="text-sm text-muted-foreground">
              {photographerCards.length} photographer{photographerCards.length !== 1 ? "s" : ""} available
            </p>
          </div>
          <span className="text-sm text-primary cursor-pointer" data-testid="link-view-all">View All</span>
        </div>

        <div className="space-y-3 overflow-y-auto h-full pb-20">
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">Loading photographers...</div>
          ) : photographerCards.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-2">No photographers in {selectedCity.name} yet</p>
              <p className="text-xs text-muted-foreground">Try searching in a different city</p>
            </div>
          ) : (
            photographerCards.map(p => (
              <PhotographerCard key={p.id} {...p} />
            ))
          )}
        </div>
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
