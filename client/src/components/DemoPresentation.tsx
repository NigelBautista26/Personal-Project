import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";

interface Slide {
  image: string;
  title: string;
  description: string;
  feature: string;
}

const slides: Slide[] = [
  {
    image: "/mobile-screenshots/welcome.png",
    title: "Welcome to SnapNow",
    description: "A beautiful, intuitive app that connects travelers with professional photographers anywhere in the world.",
    feature: "Stunning First Impression"
  },
  {
    image: "/mobile-screenshots/signup.png",
    title: "Quick Sign Up",
    description: "Join as a customer looking for photos, or as a photographer ready to earn. Simple role-based registration.",
    feature: "30-Second Onboarding"
  },
  {
    image: "/mobile-screenshots/map.png",
    title: "Find Photographers Near You",
    description: "Interactive map shows verified photographers in your area. See their prices, ratings, and availability at a glance.",
    feature: "Location-Based Discovery"
  },
  {
    image: "/mobile-screenshots/photographers.png",
    title: "Browse & Compare",
    description: "View photographer profiles with ratings, reviews, and hourly rates. Find the perfect match for your style and budget.",
    feature: "Transparent Pricing"
  },
  {
    image: "/mobile-screenshots/profile.png",
    title: "View Portfolios",
    description: "Browse stunning portfolio galleries. See real work samples before you book to ensure the style matches your vision.",
    feature: "Portfolio Preview"
  },
  {
    image: "/mobile-screenshots/spots.png",
    title: "Discover Photo Spots",
    description: "Explore curated photo locations in each city. Find the most Instagram-worthy spots recommended by local photographers.",
    feature: "Local Expertise"
  },
  {
    image: "/mobile-screenshots/bookings.png",
    title: "Manage Your Sessions",
    description: "Track all your bookings in one place. View photos, leave reviews, and request photo editing - all from the app.",
    feature: "End-to-End Experience"
  },
];

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

export function DemoPresentation() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const isMobile = useIsMobile();
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isPlaying || isHovered || isMobile) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isPlaying, isHovered, isMobile]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  const slide = slides[currentSlide];

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="grid md:grid-cols-2 gap-8 items-center">
        {/* Phone Mockup */}
        <div className="relative flex justify-center">
          <div className="relative w-64 md:w-80">
            {/* Phone Frame */}
            <div className="relative bg-gray-900 rounded-[3rem] p-2 shadow-2xl shadow-violet-500/30 border border-gray-700">
              {/* Screen */}
              <div className="relative rounded-[2.5rem] overflow-hidden bg-black">
                {/* Dynamic Island */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-10"></div>
                
                {/* Screenshot */}
                <div className="relative" style={{ aspectRatio: '9/19.5' }}>
                  {slides.map((s, index) => (
                    <img
                      key={index}
                      src={s.image}
                      alt={s.title}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                        index === currentSlide ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Reflection Effect */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-8 bg-violet-500/20 blur-xl rounded-full"></div>
          </div>
        </div>

        {/* Content - fixed height on mobile to prevent layout shifts */}
        <div className="text-center md:text-left min-h-[280px] md:min-h-0 flex flex-col justify-start">
          <div className="inline-block px-3 py-1 bg-violet-500/20 rounded-full text-violet-300 text-sm font-medium mb-4 self-center md:self-start">
            {slide.feature}
          </div>
          
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            {slide.title}
          </h3>
          
          <p className="text-lg text-gray-400 mb-8 min-h-[72px]">
            {slide.description}
          </p>

          {/* Progress Dots */}
          <div className="flex items-center gap-2 justify-center md:justify-start mb-6">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'w-8 bg-violet-500' 
                    : 'w-2 bg-gray-600 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <button
              onClick={prevSlide}
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-3 rounded-full bg-violet-600 hover:bg-violet-700 transition-colors"
            >
              {isPlaying && !isMobile ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            
            <button
              onClick={nextSlide}
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <span className="text-sm text-gray-500 ml-4">
              {currentSlide + 1} / {slides.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
