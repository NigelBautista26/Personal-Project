import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Camera, MapPin, Star, Edit2, Plus, Trash2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BottomNav } from "@/components/bottom-nav";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function PhotographerProfilePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  
  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  // Fetch photographer profile
  const { data: photographer, isLoading } = useQuery({
    queryKey: ["myPhotographerProfile"],
    queryFn: async () => {
      const res = await fetch("/api/photographers/me", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
    enabled: !!user,
  });

  // Form state
  const [formData, setFormData] = useState({
    bio: "",
    hourlyRate: "",
    location: "",
  });

  // Update form when data loads
  useState(() => {
    if (photographer) {
      setFormData({
        bio: photographer.bio || "",
        hourlyRate: photographer.hourlyRate || "",
        location: photographer.location || "",
      });
    }
  });

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

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="p-6 pt-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/photographer-home">
            <button className="w-10 h-10 glass-dark rounded-full flex items-center justify-center text-white hover:bg-white/10" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <h1 className="text-xl font-bold text-white">My Profile</h1>
        </div>
        {!isEditing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFormData({
                bio: photographer?.bio || "",
                hourlyRate: photographer?.hourlyRate || "",
                location: photographer?.location || "",
              });
              setIsEditing(true);
            }}
            className="border-white/20 text-white hover:bg-white/10"
            data-testid="button-edit"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(false)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="bg-primary hover:bg-primary/90"
              data-testid="button-save"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        )}
      </div>

      <div className="px-6 space-y-6">
        {/* Profile Header */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={photographer?.profileImageUrl || "https://via.placeholder.com/100"}
              alt={user?.fullName}
              className="w-20 h-20 rounded-full object-cover border-2 border-primary"
            />
            <button className="absolute bottom-0 right-0 w-7 h-7 bg-primary rounded-full flex items-center justify-center" data-testid="button-change-photo">
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.fullName}</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              {photographer?.location || "Location not set"}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-white font-medium">{photographer?.rating || "0.0"}</span>
              <span className="text-muted-foreground">({photographer?.reviewCount || 0} reviews)</span>
            </div>
          </div>
        </div>

        {/* Hourly Rate */}
        <div className="glass-dark rounded-2xl p-4 border border-white/10">
          <Label className="text-muted-foreground text-sm">Hourly Rate</Label>
          {isEditing ? (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-white text-xl">£</span>
              <Input
                type="number"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                className="bg-card border-white/10 text-white text-xl font-bold w-24"
                data-testid="input-rate"
              />
              <span className="text-muted-foreground">/hour</span>
            </div>
          ) : (
            <p className="text-2xl font-bold text-white mt-1">£{photographer?.hourlyRate || "0"}/hour</p>
          )}
        </div>

        {/* Location */}
        <div className="glass-dark rounded-2xl p-4 border border-white/10">
          <Label className="text-muted-foreground text-sm">Location</Label>
          {isEditing ? (
            <Input
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="bg-card border-white/10 text-white mt-2"
              placeholder="e.g., London, UK"
              data-testid="input-location"
            />
          ) : (
            <p className="text-white mt-1">{photographer?.location || "Not set"}</p>
          )}
        </div>

        {/* Bio */}
        <div className="glass-dark rounded-2xl p-4 border border-white/10">
          <Label className="text-muted-foreground text-sm">About Me</Label>
          {isEditing ? (
            <Textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="bg-card border-white/10 text-white mt-2 min-h-[100px]"
              placeholder="Tell customers about yourself and your photography style..."
              data-testid="input-bio"
            />
          ) : (
            <p className="text-white mt-2 leading-relaxed">{photographer?.bio || "No bio set"}</p>
          )}
        </div>

        {/* Portfolio */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Portfolio</h3>
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
              data-testid="button-add-photo"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Photo
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {photographer?.portfolioImages?.map((img: string, index: number) => (
              <div key={index} className="relative aspect-square group">
                <img
                  src={img}
                  alt={`Portfolio ${index + 1}`}
                  className="w-full h-full object-cover rounded-xl"
                />
                {isEditing && (
                  <button
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    data-testid={`button-delete-photo-${index}`}
                  >
                    <Trash2 className="w-3 h-3 text-white" />
                  </button>
                )}
              </div>
            ))}
            {(!photographer?.portfolioImages || photographer.portfolioImages.length === 0) && (
              <div className="aspect-square bg-card border border-dashed border-white/20 rounded-xl flex items-center justify-center col-span-3">
                <div className="text-center text-muted-foreground">
                  <Camera className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">No portfolio photos yet</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Account Actions */}
        <div className="space-y-3 pt-4">
          <Button
            variant="outline"
            className="w-full h-12 border-white/20 text-white hover:bg-white/10 rounded-xl"
            data-testid="button-change-password"
          >
            Change Password
          </Button>
          <Button
            variant="outline"
            className="w-full h-12 border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-xl"
            data-testid="button-logout"
          >
            Log Out
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
