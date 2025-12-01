import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Camera, MapPin, DollarSign, FileText, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/lib/api";
import PhotoCube from "@/components/photo-cube";

export default function PhotographerOnboarding() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [hourlyRate, setHourlyRate] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const { toast } = useToast();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hourlyRate || !city) {
      toast({
        title: "Missing information",
        description: "Please fill in your hourly rate and city.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch("/api/photographers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          bio: bio || `Professional photographer based in ${city}`,
          hourlyRate: parseFloat(hourlyRate),
          location: city,
          isAvailable: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create profile");
      }

      toast({
        title: "Profile created!",
        description: "Your photographer profile is ready. Let's get you started!",
      });
      
      setLocation("/photographer-home");
    } catch (error: any) {
      toast({
        title: "Setup failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== "photographer") {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col p-6 relative overflow-hidden">
      <PhotoCube />

      <div className="relative z-10 flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <div className="glass-dark rounded-3xl p-6 border border-white/10 backdrop-blur-xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Welcome, {user.fullName}!</h1>
            <p className="text-muted-foreground text-sm">Let's set up your photographer profile so customers can find you.</p>
          </div>

          <form onSubmit={handleComplete} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hourlyRate" className="text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                Hourly Rate (USD)
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </div>
                <Input 
                  id="hourlyRate" 
                  type="number" 
                  placeholder="50"
                  min="1"
                  step="1"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  className="pl-8 bg-card border-white/10 text-white h-12 rounded-xl focus:border-primary focus:ring-primary/20"
                  required
                  data-testid="input-hourly-rate"
                />
              </div>
              <p className="text-xs text-muted-foreground">This is your base rate per hour. You can change it later.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Your City
              </Label>
              <Input 
                id="city" 
                type="text" 
                placeholder="e.g., Paris, France"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="bg-card border-white/10 text-white h-12 rounded-xl focus:border-primary focus:ring-primary/20"
                required
                data-testid="input-city"
              />
              <p className="text-xs text-muted-foreground">Customers will find you based on this location.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                About You (optional)
              </Label>
              <Textarea 
                id="bio" 
                placeholder="Tell customers about your photography style and experience..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="bg-card border-white/10 text-white min-h-[80px] rounded-xl focus:border-primary focus:ring-primary/20 resize-none"
                data-testid="input-bio"
              />
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-lg shadow-primary/25"
              data-testid="button-complete-setup"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Setting up...
                </>
              ) : (
                <>
                  Complete Setup
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-4">
            You can always update your profile and add portfolio photos later.
          </p>
        </div>
      </div>
    </div>
  );
}
