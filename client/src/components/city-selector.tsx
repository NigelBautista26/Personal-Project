import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Navigation, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface City {
  name: string;
  country: string;
  lat: number;
  lng: number;
}

const popularDestinations: City[] = [
  { name: "London", country: "United Kingdom", lat: 51.5074, lng: -0.1278 },
  { name: "Paris", country: "France", lat: 48.8566, lng: 2.3522 },
  { name: "New York", country: "United States", lat: 40.7128, lng: -74.0060 },
  { name: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503 },
  { name: "Dubai", country: "UAE", lat: 25.2048, lng: 55.2708 },
  { name: "Barcelona", country: "Spain", lat: 41.3851, lng: 2.1734 },
  { name: "Rome", country: "Italy", lat: 41.9028, lng: 12.4964 },
  { name: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093 },
  { name: "Amsterdam", country: "Netherlands", lat: 52.3676, lng: 4.9041 },
  { name: "Singapore", country: "Singapore", lat: 1.3521, lng: 103.8198 },
  { name: "Bangkok", country: "Thailand", lat: 13.7563, lng: 100.5018 },
  { name: "Los Angeles", country: "United States", lat: 34.0522, lng: -118.2437 },
  { name: "Berlin", country: "Germany", lat: 52.5200, lng: 13.4050 },
  { name: "Vienna", country: "Austria", lat: 48.2082, lng: 16.3738 },
  { name: "Prague", country: "Czech Republic", lat: 50.0755, lng: 14.4378 },
  { name: "Lisbon", country: "Portugal", lat: 38.7223, lng: -9.1393 },
  { name: "Istanbul", country: "Turkey", lat: 41.0082, lng: 28.9784 },
  { name: "Bali", country: "Indonesia", lat: -8.4095, lng: 115.1889 },
  { name: "Cape Town", country: "South Africa", lat: -33.9249, lng: 18.4241 },
  { name: "Miami", country: "United States", lat: 25.7617, lng: -80.1918 },
];

interface CitySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (city: City) => void;
  currentCity?: City | null;
}

export function CitySelector({ isOpen, onClose, onSelect, currentCity }: CitySelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [recentCities, setRecentCities] = useState<City[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("recentCities");
    if (stored) {
      try {
        setRecentCities(JSON.parse(stored));
      } catch (e) {
        setRecentCities([]);
      }
    }
  }, [isOpen]);

  const filteredCities = searchQuery.trim()
    ? popularDestinations.filter(
        (city) =>
          city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          city.country.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : popularDestinations;

  const handleSelect = (city: City) => {
    const newRecent = [city, ...recentCities.filter((c) => c.name !== city.name)].slice(0, 5);
    setRecentCities(newRecent);
    localStorage.setItem("recentCities", JSON.stringify(newRecent));
    onSelect(city);
    onClose();
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const city: City = {
          name: "Current Location",
          country: "Your location",
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        onSelect(city);
        onClose();
      },
      (error) => {
        console.error("Location error:", error);
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm w-[88vw] bg-background border-white/10 max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-white">Choose Destination</DialogTitle>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search cities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-white/10"
            data-testid="input-city-search"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          <button
            onClick={handleUseCurrentLocation}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors border border-primary/20"
            data-testid="button-use-current-location"
          >
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <Navigation className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium text-white">Use Current Location</p>
              <p className="text-xs text-muted-foreground">Find photographers near you</p>
            </div>
          </button>

          {recentCities.length > 0 && !searchQuery && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Recent</span>
              </div>
              <div className="space-y-1">
                {recentCities.map((city) => (
                  <button
                    key={`recent-${city.name}`}
                    onClick={() => handleSelect(city)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left",
                      currentCity?.name === city.name && "bg-white/5 border border-primary/30"
                    )}
                    data-testid={`button-recent-city-${city.name.toLowerCase().replace(/\s/g, '-')}`}
                  >
                    <MapPin className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-white">{city.name}</p>
                      <p className="text-xs text-muted-foreground">{city.country}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                {searchQuery ? "Search Results" : "Popular Destinations"}
              </span>
            </div>
            <div className="space-y-1">
              {filteredCities.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No cities found</p>
              ) : (
                filteredCities.map((city) => (
                  <button
                    key={city.name}
                    onClick={() => handleSelect(city)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left",
                      currentCity?.name === city.name && "bg-white/5 border border-primary/30"
                    )}
                    data-testid={`button-city-${city.name.toLowerCase().replace(/\s/g, '-')}`}
                  >
                    <div className="w-10 h-10 bg-card rounded-full flex items-center justify-center">
                      <span className="text-lg">{getCityEmoji(city.name)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-white">{city.name}</p>
                      <p className="text-xs text-muted-foreground">{city.country}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getCityEmoji(cityName: string): string {
  const emojis: Record<string, string> = {
    "London": "🇬🇧",
    "Paris": "🇫🇷",
    "New York": "🇺🇸",
    "Tokyo": "🇯🇵",
    "Dubai": "🇦🇪",
    "Barcelona": "🇪🇸",
    "Rome": "🇮🇹",
    "Sydney": "🇦🇺",
    "Amsterdam": "🇳🇱",
    "Singapore": "🇸🇬",
    "Bangkok": "🇹🇭",
    "Los Angeles": "🇺🇸",
    "Berlin": "🇩🇪",
    "Vienna": "🇦🇹",
    "Prague": "🇨🇿",
    "Lisbon": "🇵🇹",
    "Istanbul": "🇹🇷",
    "Bali": "🇮🇩",
    "Cape Town": "🇿🇦",
    "Miami": "🇺🇸",
  };
  return emojis[cityName] || "📍";
}
