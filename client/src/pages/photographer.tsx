import { useRoute, Link } from "wouter";
import { ArrowLeft, Heart, Share, Star, MapPin, Clock, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getPhotographer } from "@/lib/api";

export default function PhotographerProfile() {
  const [match, params] = useRoute("/photographer/:id");
  const id = params?.id || "";
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: photographer, isLoading, error } = useQuery({
    queryKey: ["photographer", id],
    queryFn: () => getPhotographer(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error || !photographer) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="text-white text-center mb-4">Photographer not found</div>
        <Link href="/home">
          <Button variant="outline">Go Back</Button>
        </Link>
      </div>
    );
  }

  const profileImage = photographer.profileImageUrl?.startsWith('/')
    ? `/public-objects${photographer.profileImageUrl}`
    : photographer.profileImageUrl;

  const portfolioImages = photographer.portfolioImages || [];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header Image Area */}
      <div className="relative h-72 w-full">
        <img src={portfolioImages[0] || profileImage} className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />
        
        <div className="absolute top-0 left-0 right-0 p-6 pt-12 flex justify-between items-center z-10">
          <Link href="/home">
            <button className="w-10 h-10 glass-dark rounded-full flex items-center justify-center text-white hover:bg-white/10" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <button className="w-10 h-10 glass-dark rounded-full flex items-center justify-center text-white hover:bg-white/10" data-testid="button-share">
            <Share className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-6 -mt-12 relative z-10">
        <div className="flex justify-between items-end mb-6">
          <div className="w-24 h-24 rounded-2xl border-4 border-background overflow-hidden shadow-xl">
            <img src={profileImage} className="w-full h-full object-cover" alt={photographer.fullName} data-testid="img-profile" />
          </div>
          <div className="flex gap-2 mb-2">
             <button className="w-10 h-10 bg-card rounded-full flex items-center justify-center text-white border border-white/10 hover:border-primary hover:text-primary transition-colors" data-testid="button-favorite">
                <Heart className="w-5 h-5" />
             </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1" data-testid="text-photographer-name">{photographer.fullName}</h1>
              <div className="flex items-center text-muted-foreground text-sm">
                <MapPin className="w-4 h-4 mr-1" />
                <span data-testid="text-location">{photographer.location}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-1 text-yellow-500 mb-1">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-bold text-white" data-testid="text-rating">{parseFloat(photographer.rating || "5.0")}</span>
              </div>
              <span className="text-xs text-muted-foreground underline" data-testid="text-reviews">{photographer.reviewCount || 0} reviews</span>
            </div>
          </div>
          
          <p className="text-muted-foreground text-sm leading-relaxed" data-testid="text-bio">
            {photographer.bio}
          </p>
        </div>
      </div>

      {/* Portfolio Grid - Full Width */}
      <div className="mb-6">
        <div className="px-6 mb-4">
          <h3 className="font-bold text-white">Portfolio</h3>
        </div>
        <div className="columns-3 gap-0.5 space-y-0.5 px-0.5">
          {portfolioImages.map((img: string, i: number) => (
            <div 
              key={i} 
              className="break-inside-avoid relative group cursor-pointer overflow-hidden bg-card"
              onClick={() => setSelectedImage(img)}
              data-testid={`img-portfolio-${i}`}
            >
              <img 
                src={img} 
                className="w-full h-auto object-contain bg-black transition-transform duration-200 hover:scale-105 active:scale-95" 
                alt={`Portfolio ${i + 1}`}
              />
              <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 text-white/80 hover:text-white z-10 p-2 rounded-full hover:bg-white/10"
              data-testid="button-close-lightbox"
            >
              <X className="w-8 h-8" />
            </button>
            
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={selectedImage}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-0 left-0 right-0 mx-auto max-w-md p-4 bg-background border-t border-white/10 z-50">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <span className="text-muted-foreground text-xs uppercase tracking-wider">Starting from</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white" data-testid="text-price">£{parseFloat(photographer.hourlyRate)}</span>
              <span className="text-sm text-muted-foreground">/ hour</span>
            </div>
          </div>
          <Link href={`/book/${id}`}>
            <Button className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/25" data-testid="button-book-now">
              Book Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
