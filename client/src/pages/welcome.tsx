import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import PhotoCube from "@/components/photo-cube";

import generatedImage from "@assets/generated_images/minimalist_icon_combining_a_camera_shutter_and_location_pin.png";

// Preload the logo image globally
const preloadLogo = new Image();
preloadLogo.src = generatedImage;

export default function Welcome() {
  // Ensure logo is preloaded on mount
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = generatedImage;
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-between p-8 relative overflow-hidden">
      {/* 3D Photo Cube Background */}
      <PhotoCube />
      
      {/* Ambient Glow Effects */}
      <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[50%] bg-primary/20 blur-[100px] rounded-full pointer-events-none z-10" />
      
      <div className="relative z-20 w-full flex-1 flex flex-col items-center justify-center mt-12">
        <div className="w-32 h-32 rounded-3xl flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(255,255,255,0.15)] overflow-hidden backdrop-blur-sm bg-black/30 border border-white/10">
          <img 
            src={generatedImage} 
            alt="SnapNow Logo" 
            className="w-full h-full object-cover" 
            loading="eager"
            decoding="sync"
            fetchPriority="high"
          />
        </div>
        
        <p className="text-muted-foreground text-center max-w-[280px] leading-relaxed text-lg">
          Get professional photos, anytime & anywhere you travel.
        </p>
      </div>

      <div className="relative z-20 w-full space-y-4 mb-8">
        <Link href="/signup">
          <Button className="w-full h-14 text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25" data-testid="button-get-started">
            Get Started
          </Button>
        </Link>
        
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Already have an account?</span>
          <Link href="/login" className="text-white font-medium flex items-center hover:underline">
            Log in <ChevronRight className="w-3 h-3 ml-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}