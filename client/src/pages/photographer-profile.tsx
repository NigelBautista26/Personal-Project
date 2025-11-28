import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Star, MapPin, X, Edit2, Plus, Camera, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { BottomNav } from "@/components/bottom-nav";

export default function PhotographerProfilePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  const { data: photographer, isLoading } = useQuery({
    queryKey: ["myPhotographerProfile"],
    queryFn: async () => {
      const res = await fetch("/api/photographers/me", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
    enabled: !!user,
  });

  const [formData, setFormData] = useState({
    bio: "",
    hourlyRate: "",
    location: "",
  });

  useEffect(() => {
    if (photographer) {
      setFormData({
        bio: photographer.bio || "",
        hourlyRate: photographer.hourlyRate || "",
        location: photographer.location || "",
      });
    }
  }, [photographer]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch("/api/photographers/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myPhotographerProfile"] });
      setIsEditing(false);
      toast({
        title: "Profile updated!",
        description: "Your changes have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const profileImage = photographer?.profileImageUrl || "https://via.placeholder.com/100";
  const portfolioImages = photographer?.portfolioImages || [];

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header Image Area - Same as customer view */}
      <div className="relative h-72 w-full">
        <img src={portfolioImages[0] || profileImage} className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />
        
        {/* Edit overlay for cover photo */}
        {isEditing && (
          <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-2 text-white border border-white/20 hover:bg-black/80 transition-colors">
            <Camera className="w-5 h-5" />
            <span className="text-sm font-medium">Change Cover</span>
          </button>
        )}
        
        <div className="absolute top-0 left-0 right-0 p-6 pt-12 flex justify-between items-center z-10">
          <Link href="/photographer-home">
            <button className="w-10 h-10 glass-dark rounded-full flex items-center justify-center text-white hover:bg-white/10" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="h-10 px-4 glass-dark rounded-full flex items-center gap-2 text-white hover:bg-white/10"
              data-testid="button-edit"
            >
              <Edit2 className="w-4 h-4" />
              <span className="text-sm font-medium">Edit</span>
            </button>
          ) : (
            <div className="flex gap-2">
              <button 
                onClick={() => setIsEditing(false)}
                className="w-10 h-10 glass-dark rounded-full flex items-center justify-center text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
              <button 
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="h-10 px-4 bg-primary rounded-full flex items-center gap-2 text-white hover:bg-primary/90"
                data-testid="button-save"
              >
                <Save className="w-4 h-4" />
                <span className="text-sm font-medium">{updateMutation.isPending ? "Saving..." : "Save"}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 -mt-12 relative z-10">
        <div className="flex justify-between items-end mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl border-4 border-background overflow-hidden shadow-xl">
              <img src={profileImage} className="w-full h-full object-cover" alt={user?.fullName} data-testid="img-profile" />
            </div>
            {isEditing && (
              <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg" data-testid="button-change-photo">
                <Camera className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1 bg-card/80 backdrop-blur px-3 py-1.5 rounded-full border border-white/10">
              <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
              <span className="font-bold text-white" data-testid="text-rating">{parseFloat(photographer?.rating || "5.0")}</span>
              <span className="text-xs text-muted-foreground">({photographer?.reviewCount || 0})</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-1" data-testid="text-photographer-name">{user?.fullName}</h1>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="bg-card/50 border-white/20 text-white text-sm h-8 max-w-[200px]"
                    placeholder="Your location"
                    data-testid="input-location"
                  />
                </div>
              ) : (
                <div className="flex items-center text-muted-foreground text-sm">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span data-testid="text-location">{photographer?.location}</span>
                </div>
              )}
            </div>
          </div>
          
          {isEditing ? (
            <Textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="bg-card/50 border-white/20 text-white text-sm min-h-[80px]"
              placeholder="Tell customers about yourself..."
              data-testid="input-bio"
            />
          ) : (
            <p className="text-muted-foreground text-sm leading-relaxed" data-testid="text-bio">
              {photographer?.bio}
            </p>
          )}
        </div>
      </div>

      {/* Portfolio Grid - Same as customer view */}
      <div className="mb-6">
        <div className="px-6 mb-4 flex items-center justify-between">
          <h3 className="font-bold text-white">Portfolio</h3>
          {isEditing && (
            <button className="flex items-center gap-1 text-primary text-sm font-medium" data-testid="button-add-photo">
              <Plus className="w-4 h-4" />
              Add Photo
            </button>
          )}
        </div>
        <div className="columns-3 gap-0.5 space-y-0.5 px-0.5">
          {portfolioImages.map((img: string, i: number) => (
            <div 
              key={i} 
              className="break-inside-avoid relative group cursor-pointer overflow-hidden bg-card"
              onClick={() => !isEditing && setSelectedImage(img)}
              data-testid={`img-portfolio-${i}`}
            >
              <img 
                src={img} 
                className="w-full h-auto object-contain bg-black transition-transform duration-200 hover:scale-105 active:scale-95" 
                alt={`Portfolio ${i + 1}`}
              />
              {isEditing ? (
                <button 
                  onClick={(e) => { e.stopPropagation(); }}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  data-testid={`button-delete-photo-${i}`}
                >
                  <Trash2 className="w-3.5 h-3.5 text-white" />
                </button>
              ) : (
                <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
              )}
            </div>
          ))}
          
          {isEditing && (
            <div className="break-inside-avoid aspect-square bg-card border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
              <div className="text-center p-4">
                <Plus className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <span className="text-xs text-muted-foreground">Add Photo</span>
              </div>
            </div>
          )}
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

      {/* Bottom Bar - Pricing (editable for owner) */}
      <div className="fixed bottom-16 left-0 right-0 mx-auto max-w-md p-4 bg-background border-t border-white/10 z-40">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <span className="text-muted-foreground text-xs uppercase tracking-wider">Your rate</span>
            {isEditing ? (
              <div className="flex items-center gap-1">
                <span className="text-2xl font-bold text-white">£</span>
                <Input
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                  className="bg-transparent border-none text-2xl font-bold text-white w-20 h-8 p-0 focus-visible:ring-0"
                  data-testid="input-rate"
                />
                <span className="text-sm text-muted-foreground">/ hour</span>
              </div>
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white" data-testid="text-price">£{parseFloat(photographer?.hourlyRate || "0")}</span>
                <span className="text-sm text-muted-foreground">/ hour</span>
              </div>
            )}
          </div>
          <div className="text-right">
            <span className="text-muted-foreground text-xs">You earn (80%)</span>
            <p className="text-lg font-bold text-primary">
              £{(parseFloat(isEditing ? formData.hourlyRate : photographer?.hourlyRate || "0") * 0.8).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
