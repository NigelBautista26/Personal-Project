import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { ArrowLeft, MapPin, Clock, Lightbulb, Camera, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

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

export default function PhotoSpotDetail() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/photo-spots/:id");

  const { data: spot, isLoading, error } = useQuery<PhotoSpot>({
    queryKey: ["photo-spot", params?.id],
    queryFn: async () => {
      const res = await fetch(`/api/photo-spots/${params?.id}`);
      if (!res.ok) throw new Error("Failed to fetch spot");
      return res.json();
    },
    enabled: !!params?.id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error || !spot) {
    return (
      <div className="min-h-screen bg-background p-6 pt-12">
        <button 
          onClick={() => navigate("/photo-spots")} 
          className="w-10 h-10 glass rounded-full flex items-center justify-center mb-6"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-white mb-2">Spot not found</h2>
          <p className="text-muted-foreground">This photo spot doesn't exist.</p>
        </div>
      </div>
    );
  }

  const allImages = [spot.imageUrl, ...(spot.galleryImages || [])].filter(Boolean);

  const handleBookHere = () => {
    localStorage.setItem("bookingLocation", spot.name);
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="relative h-80">
        <img
          src={spot.imageUrl}
          alt={spot.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        
        <button 
          onClick={() => navigate("/photo-spots")} 
          className="absolute top-12 left-6 w-10 h-10 glass rounded-full flex items-center justify-center z-10"
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium mb-3 capitalize">
              {spot.category}
            </span>
            <h1 className="text-3xl font-bold text-white mb-2">{spot.name}</h1>
            <div className="flex items-center gap-2 text-white/80">
              <MapPin className="w-4 h-4" />
              <span>{spot.city}</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-semibold text-white">About this location</h2>
          <p className="text-muted-foreground leading-relaxed">{spot.description}</p>
        </motion.div>

        {(spot.bestTimeToVisit || spot.tips) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            {spot.bestTimeToVisit && (
              <div className="glass-dark rounded-xl p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white mb-1">Best Time to Visit</h3>
                  <p className="text-sm text-muted-foreground">{spot.bestTimeToVisit}</p>
                </div>
              </div>
            )}

            {spot.tips && (
              <div className="glass-dark rounded-xl p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white mb-1">Pro Tip</h3>
                  <p className="text-sm text-muted-foreground">{spot.tips}</p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {allImages.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-semibold text-white">Gallery</h2>
            <div className="grid grid-cols-2 gap-2">
              {allImages.slice(1).map((img, index) => (
                <div key={index} className="aspect-square rounded-xl overflow-hidden">
                  <img
                    src={img}
                    alt={`${spot.name} ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3 pt-4"
        >
          <Button
            onClick={handleBookHere}
            className="w-full h-14 rounded-full text-lg font-semibold"
            data-testid="button-book-here"
          >
            <Camera className="w-5 h-5 mr-2" />
            Book a Photographer Here
          </Button>
          
          <Button
            variant="outline"
            onClick={() => {
              window.open(
                `https://www.google.com/maps/search/?api=1&query=${spot.latitude},${spot.longitude}`,
                "_blank"
              );
            }}
            className="w-full h-12 rounded-full border-white/20 text-white hover:bg-white/10"
            data-testid="button-directions"
          >
            <Navigation className="w-5 h-5 mr-2" />
            Get Directions
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
