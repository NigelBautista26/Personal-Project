import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { ArrowLeft, MapPin, Clock, Lightbulb, Navigation, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { useState } from "react";

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
  const [enlargedImageIndex, setEnlargedImageIndex] = useState<number | null>(null);

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
                <button 
                  key={index} 
                  className="aspect-square rounded-xl overflow-hidden cursor-pointer"
                  onClick={() => setEnlargedImageIndex(index + 1)}
                  data-testid={`gallery-image-${index}`}
                >
                  <img
                    src={img}
                    alt={`${spot.name} ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="pt-4"
        >
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

      {/* Image Enlargement Dialog */}
      <Dialog open={enlargedImageIndex !== null} onOpenChange={(open) => !open && setEnlargedImageIndex(null)}>
        <DialogContent className="max-w-4xl w-[95vw] h-[85vh] p-0 bg-black/95 border-white/10 overflow-hidden flex flex-col">
          <div className="flex-1 flex items-center justify-center relative p-4 pr-12" style={{ minHeight: 0 }}>
            {enlargedImageIndex !== null && (
              <img
                src={allImages[enlargedImageIndex]}
                alt={`${spot.name} enlarged`}
                className="object-contain rounded-lg"
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '100%',
                  width: 'auto',
                  height: 'auto'
                }}
              />
            )}
            
            {allImages.length > 1 && enlargedImageIndex !== null && (
              <>
                <button
                  onClick={() => setEnlargedImageIndex(i => i !== null ? (i > 0 ? i - 1 : allImages.length - 1) : null)}
                  className="absolute left-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70"
                  data-testid="button-prev-image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setEnlargedImageIndex(i => i !== null ? (i < allImages.length - 1 ? i + 1 : 0) : null)}
                  className="absolute right-14 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70"
                  data-testid="button-next-image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {enlargedImageIndex !== null && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
                {enlargedImageIndex + 1} / {allImages.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
