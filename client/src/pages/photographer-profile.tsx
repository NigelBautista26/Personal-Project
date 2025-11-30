import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Star, MapPin, X, Edit2, Plus, Camera, Save, Trash2, GripVertical, LogOut, MessageSquare, User, Send, Loader2, ChevronRight, Palette, DollarSign, Clock, Check, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, logout } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { BottomNav } from "@/components/bottom-nav";
import { format } from "date-fns";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = new Image();
  image.crossOrigin = "anonymous";
  
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
    image.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  
  if (!ctx) {
    throw new Error("No 2d context");
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Canvas is empty"));
      }
    }, "image/jpeg", 0.9);
  });
}

interface ReviewWithCustomer {
  id: string;
  bookingId: string;
  photographerId: string;
  customerId: string;
  rating: number;
  comment: string | null;
  photographerResponse: string | null;
  respondedAt: string | null;
  createdAt: string;
  customer: {
    fullName: string;
    profileImageUrl: string | null;
  };
}

const getImageUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  if (url.startsWith("/objects/")) {
    return url;
  }
  const privateMatch = url.match(/\/replit-objstore-[^/]+\/\.private\/(.+)/);
  if (privateMatch) {
    return `/objects/${privateMatch[1]}`;
  }
  return url;
};

export default function PhotographerProfilePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadType, setUploadType] = useState<"portfolio" | "profile">("portfolio");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [portfolioOrder, setPortfolioOrder] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [respondingToReviewId, setRespondingToReviewId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");
  const [reviewsSheetOpen, setReviewsSheetOpen] = useState(false);
  const [editingSheetOpen, setEditingSheetOpen] = useState(false);
  const [editingSettings, setEditingSettings] = useState({
    isEnabled: false,
    pricingModel: "flat" as "flat" | "per_photo",
    flatRate: "",
    perPhotoRate: "",
    turnaroundDays: 3,
    description: "",
  });
  
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);
  
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  useEffect(() => {
    if (!userLoading && !user) {
      setLocation("/login");
    }
  }, [user, userLoading, setLocation]);

  const { data: photographer, isLoading } = useQuery({
    queryKey: ["myPhotographerProfile"],
    queryFn: async () => {
      const res = await fetch("/api/photographers/me", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
    enabled: !!user,
  });

  const { data: reviewsData } = useQuery({
    queryKey: ["myPhotographerReviews", photographer?.id],
    queryFn: async () => {
      const res = await fetch(`/api/photographers/${photographer.id}/reviews`);
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return res.json() as Promise<{
        reviews: ReviewWithCustomer[];
        averageRating: number;
        reviewCount: number;
      }>;
    },
    enabled: !!photographer?.id,
  });

  interface EditingServiceData {
    id: string;
    photographerId: string;
    isEnabled: boolean;
    pricingModel: "flat" | "per_photo";
    flatRate: string | null;
    perPhotoRate: string | null;
    turnaroundDays: number;
    description: string | null;
  }

  const { data: editingServiceData } = useQuery({
    queryKey: ["myEditingService"],
    queryFn: async () => {
      const res = await fetch("/api/editing-services/me/settings", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch editing service");
      return res.json() as Promise<EditingServiceData | null>;
    },
    enabled: !!photographer?.id,
  });

  useEffect(() => {
    if (editingServiceData) {
      setEditingSettings({
        isEnabled: editingServiceData.isEnabled,
        pricingModel: editingServiceData.pricingModel,
        flatRate: editingServiceData.flatRate || "",
        perPhotoRate: editingServiceData.perPhotoRate || "",
        turnaroundDays: editingServiceData.turnaroundDays || 3,
        description: editingServiceData.description || "",
      });
    }
  }, [editingServiceData]);

  const updateEditingServiceMutation = useMutation({
    mutationFn: async (settings: typeof editingSettings) => {
      const res = await fetch("/api/editing-services/me/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to update editing service");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myEditingService"] });
      setEditingSheetOpen(false);
      toast({
        title: "Settings saved!",
        description: "Your editing service settings have been updated.",
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

  const respondToReviewMutation = useMutation({
    mutationFn: async ({ reviewId, response }: { reviewId: string; response: string }) => {
      const res = await fetch(`/api/reviews/${reviewId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ response }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to respond");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myPhotographerReviews"] });
      setRespondingToReviewId(null);
      setResponseText("");
      toast({
        title: "Response added!",
        description: "Your response has been posted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to respond",
        description: error.message,
        variant: "destructive",
      });
    },
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
      setPortfolioOrder(photographer.portfolioImages || []);
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

  const deletePhotoMutation = useMutation({
    mutationFn: async (imageUrl: string) => {
      const res = await fetch("/api/photographers/me/portfolio", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ imageUrl }),
      });
      if (!res.ok) throw new Error("Failed to delete photo");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myPhotographerProfile"] });
      toast({
        title: "Photo deleted",
        description: "The photo has been removed from your portfolio.",
      });
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "Could not delete the photo. Please try again.",
        variant: "destructive",
      });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (images: string[]) => {
      const res = await fetch("/api/photographers/me/portfolio/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ images }),
      });
      if (!res.ok) throw new Error("Failed to reorder photos");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myPhotographerProfile"] });
      toast({
        title: "Order saved",
        description: "Your portfolio has been reordered.",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
      setLocation("/");
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please select an image file.",
        variant: "destructive",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    if (uploadType === "profile") {
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result as string);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      };
      reader.readAsDataURL(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setIsUploading(true);

    try {
      const urlRes = await fetch("/api/photographers/me/upload-url", {
        method: "POST",
        credentials: "include",
      });
      
      if (!urlRes.ok) throw new Error("Failed to get upload URL");
      const { uploadUrl } = await urlRes.json();

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadRes.ok) throw new Error("Failed to upload file");

      const url = new URL(uploadUrl);
      const objectPath = url.pathname;
      
      const addRes = await fetch("/api/photographers/me/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ imageUrl: objectPath }),
      });

      if (!addRes.ok) throw new Error("Failed to save photo");

      queryClient.invalidateQueries({ queryKey: ["myPhotographerProfile"] });
      
      toast({
        title: "Photo added!",
        description: "Your new photo has been added to your portfolio.",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Could not upload the photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadType("portfolio");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCropCancel = () => {
    setImageToCrop(null);
    setCroppedAreaPixels(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setUploadType("portfolio");
  };

  const handleCropConfirm = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;

    try {
      setIsUploading(true);
      
      const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
      
      const urlRes = await fetch("/api/photographers/me/upload-url", {
        method: "POST",
        credentials: "include",
      });
      
      if (!urlRes.ok) throw new Error("Failed to get upload URL");
      const { uploadUrl } = await urlRes.json();

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: croppedBlob,
        headers: {
          "Content-Type": "image/jpeg",
        },
      });

      if (!uploadRes.ok) throw new Error("Failed to upload cropped image");

      const url = new URL(uploadUrl);
      const objectPath = url.pathname;
      
      const addRes = await fetch("/api/photographers/me/profile-picture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ imageUrl: objectPath }),
      });

      if (!addRes.ok) throw new Error("Failed to save profile picture");

      queryClient.invalidateQueries({ queryKey: ["myPhotographerProfile"] });
      
      toast({
        title: "Profile picture updated!",
        description: "Your profile picture has been updated.",
      });

      setImageToCrop(null);
      setCroppedAreaPixels(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Could not upload the photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadType("portfolio");
    }
  };

  const handleAddPhoto = () => {
    setUploadType("portfolio");
    fileInputRef.current?.click();
  };

  const handleChangeProfilePicture = () => {
    setUploadType("profile");
    fileInputRef.current?.click();
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleDeletePhoto = (imageUrl: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this photo?")) {
      deletePhotoMutation.mutate(imageUrl);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const newOrder = [...portfolioOrder];
      const [draggedItem] = newOrder.splice(draggedIndex, 1);
      newOrder.splice(dragOverIndex, 0, draggedItem);
      setPortfolioOrder(newOrder);
      reorderMutation.mutate(newOrder);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  if (isLoading || userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const profileImage = getImageUrl(photographer?.profileImageUrl || "");
  const displayImages = isEditing ? portfolioOrder : (photographer?.portfolioImages || []);

  return (
    <div className="min-h-screen bg-background pb-32">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="relative h-72 w-full">
        <img 
          src={getImageUrl(displayImages[0]) || profileImage || "https://via.placeholder.com/400"} 
          className="w-full h-full object-cover opacity-60" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />
        
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
                onClick={() => {
                  setIsEditing(false);
                  setPortfolioOrder(photographer?.portfolioImages || []);
                }}
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
              <img 
                src={profileImage || "https://via.placeholder.com/100"} 
                className="w-full h-full object-cover" 
                alt={user?.fullName} 
                data-testid="img-profile" 
              />
            </div>
            <button 
              onClick={handleChangeProfilePicture}
              disabled={isUploading}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg disabled:opacity-50 hover:bg-primary/90 transition-colors" 
              data-testid="button-change-photo"
            >
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1 bg-card/80 backdrop-blur px-3 py-1.5 rounded-full border border-white/10">
              <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
              <span className="font-bold text-white" data-testid="text-rating">
                {reviewsData && reviewsData.reviewCount > 0 
                  ? reviewsData.averageRating.toFixed(1) 
                  : parseFloat(photographer?.rating || "5.0")}
              </span>
              <span className="text-xs text-muted-foreground">({reviewsData?.reviewCount || photographer?.reviewCount || 0})</span>
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

      <div className="mb-6">
        <div className="px-6 mb-4 flex items-center justify-between">
          <h3 className="font-bold text-white">Portfolio</h3>
          {isEditing && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <GripVertical className="w-3 h-3" /> Drag to reorder
              </span>
              <button 
                onClick={handleAddPhoto}
                disabled={isUploading}
                className="flex items-center gap-1 text-primary text-sm font-medium disabled:opacity-50" 
                data-testid="button-add-photo"
              >
                <Plus className="w-4 h-4" />
                {isUploading && uploadType === "portfolio" ? "Uploading..." : "Add Photo"}
              </button>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-1 px-1">
          {displayImages.map((img: string, i: number) => (
            <div
              key={img + i}
              draggable={isEditing}
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDragEnd={handleDragEnd}
              onClick={() => !isEditing && setSelectedImage(getImageUrl(img))}
              className={`relative aspect-square cursor-pointer overflow-hidden bg-card group transition-all duration-200 ${
                isEditing ? "cursor-grab active:cursor-grabbing" : ""
              } ${draggedIndex === i ? "opacity-50 scale-95" : ""} ${
                dragOverIndex === i ? "ring-2 ring-primary" : ""
              }`}
              data-testid={`img-portfolio-${i}`}
            >
              <img 
                src={getImageUrl(img)} 
                className="w-full h-full object-cover transition-transform duration-200 hover:scale-105" 
                alt={`Portfolio ${i + 1}`}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://via.placeholder.com/200?text=Image";
                }}
              />
              {isEditing && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <div className="absolute top-2 left-2">
                    <GripVertical className="w-5 h-5 text-white/80" />
                  </div>
                  <button 
                    onClick={(e) => handleDeletePhoto(img, e)}
                    disabled={deletePhotoMutation.isPending}
                    className="w-10 h-10 bg-red-500/90 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                    data-testid={`button-delete-photo-${i}`}
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              )}
            </div>
          ))}
          
          {isEditing && (
            <div 
              onClick={handleAddPhoto}
              className="aspect-square bg-card border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              <div className="text-center p-2">
                {isUploading && uploadType === "portfolio" ? (
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                ) : (
                  <Plus className="w-6 h-6 text-muted-foreground mx-auto" />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Summary Card */}
      <div className="px-6 mb-6">
        <button
          onClick={() => setReviewsSheetOpen(true)}
          className="w-full glass-panel rounded-xl p-4 hover:bg-white/5 transition-colors text-left"
          data-testid="button-view-reviews"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Customer Reviews</h3>
                {reviewsData && reviewsData.reviewCount > 0 ? (
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < Math.round(reviewsData.averageRating) ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {reviewsData.averageRating.toFixed(1)} ({reviewsData.reviewCount})
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No reviews yet</p>
                )}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </button>
      </div>

      {/* Reviews Bottom Sheet */}
      <Sheet open={reviewsSheetOpen} onOpenChange={setReviewsSheetOpen}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl bg-background border-white/10 p-0 max-w-md mx-auto">
          <div className="flex flex-col h-full">
            <SheetHeader className="px-6 py-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Customer Reviews
                </SheetTitle>
                {reviewsData && reviewsData.reviewCount > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-bold text-white">{reviewsData.averageRating.toFixed(1)}</span>
                    </div>
                    <span className="text-muted-foreground text-sm">({reviewsData.reviewCount})</span>
                  </div>
                )}
              </div>
            </SheetHeader>
            
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {reviewsData && reviewsData.reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviewsData.reviews.map((review) => (
                    <div key={review.id} className="glass-panel rounded-xl p-4" data-testid={`my-review-${review.id}`}>
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {review.customer.profileImageUrl ? (
                            <img 
                              src={review.customer.profileImageUrl} 
                              alt={review.customer.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-white truncate">{review.customer.fullName}</span>
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              {format(new Date(review.createdAt), 'MMM d, yyyy')}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {review.comment && (
                        <p className="text-muted-foreground text-sm leading-relaxed mb-3">{review.comment}</p>
                      )}
                      
                      {review.photographerResponse ? (
                        <div className="pl-4 border-l-2 border-primary/30">
                          <p className="text-xs text-primary font-medium mb-1">Your response</p>
                          <p className="text-muted-foreground text-sm">{review.photographerResponse}</p>
                        </div>
                      ) : respondingToReviewId === review.id ? (
                        <div className="mt-3 space-y-2">
                          <Textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            placeholder="Write your response..."
                            className="bg-zinc-800 border-white/10 text-white text-sm min-h-[60px]"
                            data-testid={`input-response-${review.id}`}
                          />
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setRespondingToReviewId(null);
                                setResponseText("");
                              }}
                              className="border-white/10"
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                if (responseText.trim()) {
                                  respondToReviewMutation.mutate({
                                    reviewId: review.id,
                                    response: responseText,
                                  });
                                }
                              }}
                              disabled={!responseText.trim() || respondToReviewMutation.isPending}
                              className="bg-primary hover:bg-primary/90"
                              data-testid={`button-send-response-${review.id}`}
                            >
                              {respondToReviewMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <Send className="w-4 h-4 mr-1" />
                                  Send
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setRespondingToReviewId(review.id)}
                          className="mt-2 text-primary text-sm font-medium hover:underline flex items-center gap-1"
                          data-testid={`button-respond-${review.id}`}
                        >
                          <MessageSquare className="w-4 h-4" />
                          Respond to review
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Star className="w-8 h-8 text-primary/50" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">No reviews yet</h3>
                  <p className="text-muted-foreground text-sm max-w-[250px]">
                    Reviews from your customers will appear here after they complete their photo sessions
                  </p>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Editing Services Card */}
      <div className="px-6 mb-6">
        <button
          onClick={() => setEditingSheetOpen(true)}
          className="w-full glass-panel rounded-xl p-4 hover:bg-white/5 transition-colors text-left"
          data-testid="button-editing-services"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                <Palette className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Photo Editing Service</h3>
                {editingServiceData?.isEnabled ? (
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs">
                      <Check className="w-3 h-3" />
                      Active
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {editingServiceData.pricingModel === "flat" 
                        ? `$${parseFloat(editingServiceData.flatRate || "0").toFixed(0)} flat`
                        : `$${parseFloat(editingServiceData.perPhotoRate || "0").toFixed(0)}/photo`
                      }
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Not configured</p>
                )}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </button>
      </div>

      {/* Editing Services Sheet */}
      <Sheet open={editingSheetOpen} onOpenChange={setEditingSheetOpen}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl bg-background border-white/10 p-0 max-w-md mx-auto">
          <div className="flex flex-col h-full">
            <SheetHeader className="px-6 py-4 border-b border-white/10">
              <SheetTitle className="text-white flex items-center gap-2">
                <Palette className="w-5 h-5 text-violet-400" />
                Photo Editing Service
              </SheetTitle>
            </SheetHeader>
            
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-6">
                {/* Enable toggle */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="editing-enabled" className="text-white font-medium">Enable Editing Service</Label>
                    <p className="text-sm text-muted-foreground">
                      Offer photo editing to your clients
                    </p>
                  </div>
                  <Switch
                    id="editing-enabled"
                    checked={editingSettings.isEnabled}
                    onCheckedChange={(checked) => setEditingSettings(s => ({ ...s, isEnabled: checked }))}
                    data-testid="switch-editing-enabled"
                  />
                </div>

                {editingSettings.isEnabled && (
                  <>
                    {/* Pricing Model */}
                    <div className="space-y-3">
                      <Label className="text-white font-medium">Pricing Model</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setEditingSettings(s => ({ ...s, pricingModel: "flat" }))}
                          className={`p-4 rounded-xl border-2 transition-colors text-left ${
                            editingSettings.pricingModel === "flat"
                              ? "border-violet-500 bg-violet-500/10"
                              : "border-white/10 bg-white/5 hover:border-white/20"
                          }`}
                          data-testid="button-pricing-flat"
                        >
                          <DollarSign className="w-5 h-5 text-violet-400 mb-2" />
                          <p className="font-medium text-white text-sm">Flat Rate</p>
                          <p className="text-xs text-muted-foreground mt-1">One price for all photos</p>
                        </button>
                        <button
                          onClick={() => setEditingSettings(s => ({ ...s, pricingModel: "per_photo" }))}
                          className={`p-4 rounded-xl border-2 transition-colors text-left ${
                            editingSettings.pricingModel === "per_photo"
                              ? "border-violet-500 bg-violet-500/10"
                              : "border-white/10 bg-white/5 hover:border-white/20"
                          }`}
                          data-testid="button-pricing-per-photo"
                        >
                          <DollarSign className="w-5 h-5 text-violet-400 mb-2" />
                          <p className="font-medium text-white text-sm">Per Photo</p>
                          <p className="text-xs text-muted-foreground mt-1">Price per photo edited</p>
                        </button>
                      </div>
                    </div>

                    {/* Price Input */}
                    <div className="space-y-2">
                      <Label className="text-white font-medium">
                        {editingSettings.pricingModel === "flat" ? "Flat Rate" : "Rate Per Photo"}
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={editingSettings.pricingModel === "flat" ? editingSettings.flatRate : editingSettings.perPhotoRate}
                          onChange={(e) => {
                            if (editingSettings.pricingModel === "flat") {
                              setEditingSettings(s => ({ ...s, flatRate: e.target.value }));
                            } else {
                              setEditingSettings(s => ({ ...s, perPhotoRate: e.target.value }));
                            }
                          }}
                          className="pl-7 bg-white/5 border-white/10"
                          data-testid="input-editing-rate"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Platform takes 20% commission on editing services
                      </p>
                    </div>

                    {/* Turnaround Days */}
                    <div className="space-y-2">
                      <Label className="text-white font-medium">Estimated Turnaround</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <select
                          value={editingSettings.turnaroundDays}
                          onChange={(e) => setEditingSettings(s => ({ ...s, turnaroundDays: parseInt(e.target.value) }))}
                          className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white appearance-none cursor-pointer"
                          data-testid="select-turnaround"
                        >
                          {[1, 2, 3, 5, 7, 14, 21, 30].map(days => (
                            <option key={days} value={days} className="bg-zinc-900">
                              {days} {days === 1 ? "day" : "days"}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label className="text-white font-medium">Service Description</Label>
                      <Textarea
                        placeholder="Describe what's included in your editing service (e.g., color correction, retouching, cropping...)"
                        value={editingSettings.description}
                        onChange={(e) => setEditingSettings(s => ({ ...s, description: e.target.value }))}
                        className="bg-white/5 border-white/10 min-h-[100px]"
                        data-testid="textarea-editing-description"
                      />
                    </div>
                  </>
                )}

                {/* Save Button */}
                <Button
                  onClick={() => updateEditingServiceMutation.mutate(editingSettings)}
                  disabled={updateEditingServiceMutation.isPending}
                  className="w-full bg-violet-600 hover:bg-violet-700"
                  data-testid="button-save-editing-settings"
                >
                  {updateEditingServiceMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Logout Button */}
      <div className="px-6 pb-24">
        <button
          onClick={() => logoutMutation.mutate()}
          className="w-full flex items-center justify-center gap-2 py-3 text-muted-foreground hover:text-destructive transition-colors text-sm"
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>

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

      {imageToCrop && (
        <div className="fixed inset-0 z-[70] bg-black flex flex-col">
          <div className="relative flex-1">
            <Cropper
              image={imageToCrop}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          
          <div className="bg-zinc-900 p-6 space-y-6">
            <div className="flex items-center gap-4 px-2">
              <ZoomOut className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={(value) => setZoom(value[0])}
                className="flex-1"
              />
              <ZoomIn className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            </div>
            
            <p className="text-center text-sm text-muted-foreground">
              Pinch or use slider to zoom, drag to reposition
            </p>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCropCancel}
                className="flex-1 border-white/20"
                disabled={isUploading}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleCropConfirm}
                className="flex-1 bg-primary hover:bg-primary/90"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Apply
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
