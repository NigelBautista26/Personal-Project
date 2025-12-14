import { useLocation } from "wouter";
import { ChevronRight } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import PhotoBackground from "@/components/PhotoBackground";

import generatedImage from "@assets/generated_images/minimalist_icon_combining_a_camera_shutter_and_location_pin.png";

// Preload the logo image globally
const preloadLogo = new Image();
preloadLogo.src = generatedImage;

export default function Welcome() {
  const [, setLocation] = useLocation();
  
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
      {/* Scrolling Photo Background */}
      <PhotoBackground />
      
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
        <Button 
          className="w-full h-14 text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 active:scale-95 transition-transform" 
          data-testid="button-get-started"
          onTouchEnd={(e) => { e.preventDefault(); setLocation("/signup"); }}
          onClick={() => setLocation("/signup")}
        >
          Get Started
        </Button>
        
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Already have an account?</span>
          <button 
            onTouchEnd={(e) => { e.preventDefault(); setLocation("/login"); }}
            onClick={() => setLocation("/login")} 
            className="text-white font-medium flex items-center hover:underline active:opacity-70"
          >
            Log in <ChevronRight className="w-3 h-3 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}