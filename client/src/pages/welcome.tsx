import { Link } from "wouter";
import { MapPin, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import generatedImage from "@assets/generated_images/minimalist_icon_combining_a_camera_shutter_and_location_pin.png";

export default function Welcome() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-between p-8 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[50%] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="w-full flex-1 flex flex-col items-center justify-center mt-12">
        <div className="w-32 h-32 rounded-3xl flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(255,255,255,0.1)] overflow-hidden">
          <img src={generatedImage} alt="SnapNow Logo" className="w-full h-full object-cover" />
        </div>
        
        <p className="text-muted-foreground text-center max-w-[280px] leading-relaxed text-lg">
          Get professional photos, anytime & anywhere you travel.
        </p>
      </div>

      <div className="w-full space-y-4 mb-8">
        <Link href="/home">
          <Button className="w-full h-14 text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25">
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