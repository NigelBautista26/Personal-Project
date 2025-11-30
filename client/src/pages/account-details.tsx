import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, Camera, User as UserIcon, Loader2, X, Check, ZoomIn, ZoomOut } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, updateUserProfile, getUserUploadUrl } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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

export default function AccountDetails() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: user, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setPhone((user as any).phone || "");
      setProfileImage((user as any).profileImageUrl || null);
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast({
        title: "Profile updated",
        description: "Your account details have been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result as string);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleCropCancel = () => {
    setImageToCrop(null);
    setCroppedAreaPixels(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleCropConfirm = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;

    try {
      setUploading(true);
      
      const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
      const file = new File([croppedBlob], "profile.jpg", { type: "image/jpeg" });
      
      const { uploadUrl } = await getUserUploadUrl();
      
      const uploadResponse = await fetch(uploadUrl.uploadURL, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload photo");
      }

      const publicUrl = uploadUrl.objectPath;
      setProfileImage(publicUrl);
      
      await updateUserProfile({ profileImageUrl: publicUrl });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      
      toast({
        title: "Photo uploaded",
        description: "Your profile photo has been updated.",
      });
      
      handleCropCancel();
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Could not upload your photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    updateMutation.mutate({ fullName, phone });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const displayImage = profileImage || (user as any)?.profileImageUrl;

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border p-4 flex items-center gap-4">
        <button
          onClick={() => navigate("/profile")}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">Account Details</h1>
      </div>

      <div className="p-6 space-y-8">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-28 h-28 rounded-full ring-4 ring-card bg-muted flex items-center justify-center overflow-hidden">
              {displayImage ? (
                <img src={displayImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-14 h-14 text-muted-foreground" />
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                  <Loader2 className="w-8 h-8 animate-spin text-white" />
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 bg-primary rounded-full shadow-lg hover:bg-primary/90 transition-colors"
              disabled={uploading}
              data-testid="button-change-photo"
            >
              <Camera className="w-4 h-4 text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              data-testid="input-photo"
            />
          </div>
          <p className="text-sm text-muted-foreground mt-3">Tap to change your photo</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-white">Full Name</Label>
            <Input
              id="fullName"
              value={fullName || user?.fullName || ""}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="bg-card border-border text-white"
              data-testid="input-fullname"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input
              id="email"
              value={user?.email || ""}
              disabled
              className="bg-card/50 border-border text-muted-foreground"
              data-testid="input-email"
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-white">Phone Number</Label>
            <Input
              id="phone"
              value={phone || (user as any)?.phone || ""}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              className="bg-card border-border text-white"
              data-testid="input-phone"
            />
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="w-full bg-primary hover:bg-primary/90"
          data-testid="button-save"
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>

      {imageToCrop && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
          <div className="flex items-center justify-between p-4 bg-background/95 backdrop-blur-sm border-b border-border">
            <button
              onClick={handleCropCancel}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              data-testid="button-crop-cancel"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <h2 className="text-lg font-semibold text-white">Crop Photo</h2>
            <button
              onClick={handleCropConfirm}
              disabled={uploading}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              data-testid="button-crop-confirm"
            >
              {uploading ? (
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              ) : (
                <Check className="w-6 h-6 text-primary" />
              )}
            </button>
          </div>
          
          <div className="flex-1 relative">
            <Cropper
              image={imageToCrop}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          
          <div className="p-6 bg-background/95 backdrop-blur-sm border-t border-border">
            <div className="flex items-center gap-4">
              <ZoomOut className="w-5 h-5 text-muted-foreground" />
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 h-2 bg-card rounded-lg appearance-none cursor-pointer accent-primary"
                data-testid="slider-zoom"
              />
              <ZoomIn className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Pinch or use slider to zoom, drag to reposition
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
