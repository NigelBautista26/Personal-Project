import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Star, MapPin, X, Edit2, Plus, Camera, Save, Trash2, GripVertical, LogOut, MessageSquare, User, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, logout } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { BottomNav } from "@/components/bottom-nav";
import { format } from "date-fns";

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
      
      const endpoint = uploadType === "profile" 
        ? "/api/photographers/me/profile-picture"
        : "/api/photographers/me/portfolio";
      
      const addRes = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ imageUrl: objectPath }),
      });

      if (!addRes.ok) throw new Error("Failed to save photo");

      queryClient.invalidateQueries({ queryKey: ["myPhotographerProfile"] });
      
      toast({
        title: uploadType === "profile" ? "Profile picture updated!" : "Photo added!",
        description: uploadType === "profile" 
          ? "Your profile picture has been updated."
          : "Your new photo has been added to your portfolio.",
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
            {isEditing && (
              <button 
                onClick={handleChangeProfilePicture}
                disabled={isUploading}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg disabled:opacity-50" 
                data-testid="button-change-photo"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
            )}
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

      {/* Earnings Card - Inline */}
      <div className="px-6 mb-6">
        <div className="glass-panel rounded-xl p-4">
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
      </div>

      {/* Reviews Section */}
      {reviewsData && reviewsData.reviews.length > 0 && (
        <div className="px-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Customer Reviews
            </h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-bold text-white">{reviewsData.averageRating.toFixed(1)}</span>
              </div>
              <span className="text-muted-foreground text-sm">({reviewsData.reviewCount})</span>
            </div>
          </div>
          
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
        </div>
      )}

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

      <BottomNav />
    </div>
  );
}
