import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, MapPin, Camera, Clock, Lightbulb } from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";
import { CitySelector, City } from "@/components/city-selector";
import { motion } from "framer-motion";

const DEFAULT_CITY: City = { name: "London", country: "United Kingdom", lat: 51.5074, lng: -0.1278 };

interface PhotoSpot {
  id: string;
  name: string;
  city: string;
  description: string;
  category: string;
  latitude: string;
  longitude: string;
  imageUrl: string;
  galleryImages: string[] | null;
  bestTimeToVisit: string | null;
  tips: string | null;
}

export default function PhotoSpots() {
  const [, navigate] = useLocation();
  const [selectedCity, setSelectedCity] = useState<City>(DEFAULT_CITY);
  const [showCitySelector, setShowCitySelector] = useState(false);

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

  const { data: spots = [], isLoading } = useQuery<PhotoSpot[]>({
    queryKey: ["photo-spots", selectedCity.name],
    queryFn: async () => {
      const res = await fetch(`/api/photo-spots?city=${encodeURIComponent(selectedCity.name)}`);
      if (!res.ok) throw new Error("Failed to fetch spots");
      return res.json();
    },
  });

  const categories = Array.from(new Set(spots.map(s => s.category)));

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-6 pt-12 space-y-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/home")} 
            className="w-10 h-10 glass rounded-full flex items-center justify-center"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">Photo Spots</h1>
            <p className="text-sm text-muted-foreground">Discover photogenic locations</p>
          </div>
        </div>

        <button
          onClick={() => setShowCitySelector(true)}
          className="w-full h-14 glass-dark rounded-2xl flex items-center px-4 gap-3 hover:bg-white/10 transition-colors"
          data-testid="button-change-city"
        >
          <MapPin className="w-5 h-5 text-primary" />
          <div className="flex-1 text-left">
            <div className="text-white font-medium">{selectedCity.name}</div>
            <div className="text-xs text-muted-foreground">{selectedCity.country}</div>
          </div>
          <span className="text-primary text-sm">Change</span>
        </button>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading photo spots...
          </div>
        ) : spots.length === 0 ? (
          <div className="text-center py-12">
            <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-white mb-2">No spots found</h3>
            <p className="text-muted-foreground">
              We're still adding photo spots for {selectedCity.name}.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {categories.map((category) => (
              <div key={category} className="space-y-4">
                <h2 className="text-lg font-semibold text-white capitalize flex items-center gap-2">
                  <Camera className="w-5 h-5 text-primary" />
                  {category === 'landmark' ? 'Famous Landmarks' :
                   category === 'street' ? 'Street Photography' :
                   category === 'park' ? 'Parks & Gardens' :
                   category === 'waterfront' ? 'Waterfront Views' :
                   category === 'architecture' ? 'Architecture' : category}
                </h2>
                <div className="space-y-4">
                  {spots
                    .filter(s => s.category === category)
                    .map((spot, index) => (
                      <motion.div
                        key={spot.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => navigate(`/photo-spots/${spot.id}`)}
                        className="glass-dark rounded-2xl overflow-hidden cursor-pointer hover:bg-white/10 transition-all"
                        data-testid={`card-spot-${spot.id}`}
                      >
                        <div className="relative h-48">
                          <img
                            src={spot.imageUrl}
                            alt={spot.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="text-lg font-bold text-white">{spot.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-white/80">
                              <MapPin className="w-4 h-4" />
                              <span>{spot.city}</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 space-y-3">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {spot.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {spot.bestTimeToVisit && (
                              <span className="inline-flex items-center gap-1 text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                                <Clock className="w-3 h-3" />
                                {spot.bestTimeToVisit}
                              </span>
                            )}
                            {spot.tips && (
                              <span className="inline-flex items-center gap-1 text-xs bg-white/10 text-white/70 px-2 py-1 rounded-full">
                                <Lightbulb className="w-3 h-3" />
                                Pro tip
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
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
