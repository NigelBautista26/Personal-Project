import { BottomNav } from "@/components/bottom-nav";
import { PhotographerCard } from "@/components/photographer-card";
import { SlidersHorizontal, MapPin, Search } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getPhotographers } from "@/lib/api";
import { CitySelector, City } from "@/components/city-selector";
import { Input } from "@/components/ui/input";

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

export default function Photographers() {
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City>(DEFAULT_CITY);
  const [searchQuery, setSearchQuery] = useState("");

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
      if (distance > SEARCH_RADIUS_KM) return false;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const nameMatch = p.fullName?.toLowerCase().includes(query);
        const styleMatch = p.style?.toLowerCase().includes(query);
        const bioMatch = p.bio?.toLowerCase().includes(query);
        return nameMatch || styleMatch || bioMatch;
      }
      return true;
    });
  }, [photographers, selectedCity, searchQuery]);

  const photographerCards = filteredPhotographers.map((p: any) => ({
    id: p.id,
    name: p.fullName || "Photographer",
    location: p.location,
    price: `£${parseFloat(p.hourlyRate)}`,
    rating: parseFloat(p.rating || "5.0"),
    reviews: p.reviewCount || 0,
    image: p.profileImageUrl || "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    sessionState: p.sessionState || 'available',
    nextAvailableAt: p.nextAvailableAt,
  }));

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-white/5 p-6 pt-12 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-white mb-1">Find Photographers</h1>
          <p className="text-muted-foreground text-sm">Professional photographers near you</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3"
        >
          <button
            onClick={() => setShowCitySelector(true)}
            className="h-12 glass-dark rounded-full flex items-center px-4 gap-2 shadow-lg hover:bg-white/10 transition-colors"
            data-testid="button-change-city"
          >
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-white font-medium text-sm">{selectedCity.name}</span>
          </button>
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search photographers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-10 bg-white/5 border-white/10 rounded-full text-white placeholder:text-muted-foreground"
              data-testid="input-search"
            />
          </div>
        </motion.div>
      </div>

      <div className="p-6 space-y-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="pt-2"
        >
          <p className="text-sm text-muted-foreground mb-4">
            {photographerCards.length} photographer{photographerCards.length !== 1 ? "s" : ""} in {selectedCity.name}
          </p>

          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center text-muted-foreground py-12">Loading photographers...</div>
            ) : photographerCards.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-white font-medium mb-1">No photographers found</p>
                <p className="text-muted-foreground text-sm">
                  {searchQuery ? "Try a different search term" : "Try selecting a different city"}
                </p>
              </motion.div>
            ) : (
              photographerCards.map((photographer, index) => (
                <motion.div
                  key={photographer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PhotographerCard {...photographer} />
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

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
