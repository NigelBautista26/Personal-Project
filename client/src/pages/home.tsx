import { MapMock } from "@/components/map-mock";
import { BottomNav } from "@/components/bottom-nav";
import { PhotographerCard } from "@/components/photographer-card";
import { Search, SlidersHorizontal, MapPin } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getPhotographers } from "@/lib/api";

export default function Home() {
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: photographers = [], isLoading } = useQuery({
    queryKey: ["photographers"],
    queryFn: getPhotographers,
  });

  const photographerCards = photographers.map((p: any) => ({
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
      {/* Top Bar - Floating */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 pt-12 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="flex-1 h-12 glass-dark rounded-full flex items-center px-4 gap-2 shadow-lg">
            <MapPin className="w-5 h-5 text-white" />
            <span className="text-white font-medium">London</span>
            <span className="text-muted-foreground ml-auto text-xs">Change</span>
          </div>
          <button className="w-12 h-12 glass-dark rounded-full flex items-center justify-center text-white shadow-lg">
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Map Area */}
      <MapMock />

      {/* Bottom Sheet */}
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
          <h2 className="text-xl font-bold text-white">Nearby Photographers</h2>
          <span className="text-sm text-primary">View All</span>
        </div>

        <div className="space-y-3 overflow-y-auto h-full pb-20">
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">Loading photographers...</div>
          ) : photographerCards.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No photographers found</div>
          ) : (
            photographerCards.map(p => (
              <PhotographerCard key={p.id} {...p} />
            ))
          )}
        </div>
      </motion.div>

      <BottomNav />
    </div>
  );
}