import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, ChevronLeft, ChevronRight, Camera, MapPin, Calendar, CreditCard, Star, Image, Sparkles, Monitor, Smartphone } from "lucide-react";
import { toast } from "sonner";

export default function PitchDeck() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const deckRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    toast.info("Generating PDF... This may take a moment.");
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = deckRef.current;
      if (!element) return;

      const opt = {
        margin: 0,
        filename: 'SnapNow-Investor-Pitch.pdf',
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in' as const, format: 'letter' as const, orientation: 'landscape' as const },
        pagebreak: { mode: ['css', 'legacy'] as const }
      };

      await html2pdf().set(opt).from(element).save();
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const slides = [
    // Slide 1: Cover
    <div key="cover" className="slide-content min-h-[600px] flex flex-col items-center justify-center bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white p-8 md:p-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-16 md:w-20 h-16 md:h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
          <Camera className="w-8 md:w-10 h-8 md:h-10" />
        </div>
      </div>
      <h1 className="text-4xl md:text-6xl font-bold mb-4 text-center">SnapNow</h1>
      <p className="text-xl md:text-2xl text-white/90 mb-8 text-center">The Uber for Professional Photography</p>
      <div className="flex items-center gap-2 text-base md:text-lg text-white/80 text-center">
        <MapPin className="w-5 h-5 flex-shrink-0" />
        <span>Connecting Travelers with Local Photographers Worldwide</span>
      </div>
      <div className="mt-auto pt-8 text-white/60 text-sm">
        Investor Presentation 2025
      </div>
    </div>,

    // Slide 2: Problem
    <div key="problem" className="slide-content min-h-[600px] flex flex-col bg-white p-8 md:p-12">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 md:mb-8 flex items-center gap-3">
        <span className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xl md:text-2xl font-bold">!</span>
        The Problem
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 flex-1">
        <div className="p-5 md:p-6 bg-red-50 rounded-2xl border border-red-100">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3">For Travelers</h3>
          <ul className="space-y-3 text-gray-700 text-sm md:text-base">
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">✗</span>
              <span>Selfies and tourist photos don't capture the magic of travel</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">✗</span>
              <span>Finding reliable local photographers is time-consuming and risky</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">✗</span>
              <span>No easy way to book, pay, or receive photos while traveling</span>
            </li>
          </ul>
        </div>
        <div className="p-5 md:p-6 bg-orange-50 rounded-2xl border border-orange-100">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3">For Photographers</h3>
          <ul className="space-y-3 text-gray-700 text-sm md:text-base">
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-1">✗</span>
              <span>Difficulty finding consistent clients, especially tourists</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-1">✗</span>
              <span>No platform designed for short, on-demand photo sessions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-1">✗</span>
              <span>Payment collection from international clients is complicated</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="mt-6 md:mt-8 p-4 bg-gray-100 rounded-xl text-center">
        <p className="text-lg md:text-xl text-gray-800 font-medium">
          "78% of millennials say they'd rather spend money on experiences than things"
        </p>
        <p className="text-sm text-gray-500 mt-1">— Harris Poll</p>
      </div>
    </div>,

    // Slide 3: Solution
    <div key="solution" className="slide-content min-h-[600px] flex flex-col bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-8 md:p-12">
      <h2 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8 flex items-center gap-3">
        <span className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-white/20 flex items-center justify-center text-xl md:text-2xl">💡</span>
        The Solution: SnapNow
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 flex-1">
        <div className="bg-white/10 backdrop-blur rounded-2xl p-5 md:p-6 flex flex-col items-center text-center">
          <div className="w-12 md:w-16 h-12 md:h-16 rounded-full bg-white/20 flex items-center justify-center mb-3 md:mb-4">
            <MapPin className="w-6 md:w-8 h-6 md:h-8" />
          </div>
          <h3 className="text-lg md:text-xl font-semibold mb-2">Discover</h3>
          <p className="text-white/80 text-sm md:text-base">Find verified local photographers near any tourist destination with real portfolios and reviews</p>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-2xl p-5 md:p-6 flex flex-col items-center text-center">
          <div className="w-12 md:w-16 h-12 md:h-16 rounded-full bg-white/20 flex items-center justify-center mb-3 md:mb-4">
            <Calendar className="w-6 md:w-8 h-6 md:h-8" />
          </div>
          <h3 className="text-lg md:text-xl font-semibold mb-2">Book Instantly</h3>
          <p className="text-white/80 text-sm md:text-base">Request sessions in minutes, not days. Photographers respond quickly with dynamic availability</p>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-2xl p-5 md:p-6 flex flex-col items-center text-center">
          <div className="w-12 md:w-16 h-12 md:h-16 rounded-full bg-white/20 flex items-center justify-center mb-3 md:mb-4">
            <Image className="w-6 md:w-8 h-6 md:h-8" />
          </div>
          <h3 className="text-lg md:text-xl font-semibold mb-2">Receive & Share</h3>
          <p className="text-white/80 text-sm md:text-base">Get professionally edited photos delivered to your in-app gallery within hours</p>
        </div>
      </div>
      <div className="mt-6 md:mt-8 bg-white/10 backdrop-blur rounded-xl p-4 md:p-6 text-center">
        <p className="text-xl md:text-2xl font-semibold">"Book a photographer as easily as you'd book an Uber"</p>
      </div>
    </div>,

    // Slide 4: Market Opportunity
    <div key="market" className="slide-content min-h-[600px] flex flex-col bg-white p-8 md:p-12">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 md:mb-8 flex items-center gap-3">
        <span className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl md:text-2xl">📊</span>
        Market Opportunity
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 flex-1">
        <div className="text-center p-5 md:p-6 bg-gradient-to-b from-blue-50 to-white rounded-2xl border border-blue-100">
          <p className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">$44B</p>
          <p className="text-base md:text-lg text-gray-600 font-medium">Global Photography Services Market</p>
          <p className="text-sm text-gray-500 mt-2">Growing 5.4% annually</p>
        </div>
        <div className="text-center p-5 md:p-6 bg-gradient-to-b from-purple-50 to-white rounded-2xl border border-purple-100">
          <p className="text-4xl md:text-5xl font-bold text-purple-600 mb-2">1.5B</p>
          <p className="text-base md:text-lg text-gray-600 font-medium">International Tourist Arrivals</p>
          <p className="text-sm text-gray-500 mt-2">Pre-pandemic peak, recovering fast</p>
        </div>
        <div className="text-center p-5 md:p-6 bg-gradient-to-b from-emerald-50 to-white rounded-2xl border border-emerald-100">
          <p className="text-4xl md:text-5xl font-bold text-emerald-600 mb-2">$200+</p>
          <p className="text-base md:text-lg text-gray-600 font-medium">Average Session Value</p>
          <p className="text-sm text-gray-500 mt-2">High willingness to pay for memories</p>
        </div>
      </div>
      <div className="mt-6 md:mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="p-4 md:p-5 bg-gray-50 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">Target Users</h4>
          <ul className="text-gray-600 space-y-1 text-sm md:text-base">
            <li>• Couples on honeymoons & engagements</li>
            <li>• Families on vacation</li>
            <li>• Solo travelers & influencers</li>
            <li>• Business travelers capturing experiences</li>
          </ul>
        </div>
        <div className="p-4 md:p-5 bg-gray-50 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">Geographic Focus</h4>
          <ul className="text-gray-600 space-y-1 text-sm md:text-base">
            <li>• Major tourist destinations worldwide</li>
            <li>• Instagram-famous locations</li>
            <li>• Wedding & honeymoon hotspots</li>
            <li>• Urban centers with high tourist traffic</li>
          </ul>
        </div>
      </div>
    </div>,

    // Slide 5: Business Model
    <div key="business" className="slide-content min-h-[600px] flex flex-col bg-gradient-to-br from-amber-500 to-orange-600 text-white p-8 md:p-12">
      <h2 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8 flex items-center gap-3">
        <span className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-white/20 flex items-center justify-center text-xl md:text-2xl">💰</span>
        Business Model
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 flex-1">
        <div className="bg-white/10 backdrop-blur rounded-2xl p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 flex items-center gap-2">
            <CreditCard className="w-5 md:w-6 h-5 md:h-6" />
            Two-Sided Revenue
          </h3>
          <div className="space-y-4 md:space-y-6">
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-2xl md:text-3xl font-bold mb-1">10%</p>
              <p className="text-white/80">Customer Service Fee</p>
              <p className="text-sm text-white/60">Added to every booking</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-2xl md:text-3xl font-bold mb-1">20%</p>
              <p className="text-white/80">Photographer Commission</p>
              <p className="text-sm text-white/60">Deducted from photographer earnings</p>
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-2xl p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Revenue Example</h3>
          <div className="bg-white/10 rounded-xl p-4 md:p-6 space-y-3 md:space-y-4 text-sm md:text-base">
            <div className="flex justify-between items-center pb-3 border-b border-white/20">
              <span>Session Price</span>
              <span className="font-semibold">$150.00</span>
            </div>
            <div className="flex justify-between items-center text-white/80">
              <span>Customer Pays (+10%)</span>
              <span>$165.00</span>
            </div>
            <div className="flex justify-between items-center text-white/80">
              <span>Photographer Gets (80%)</span>
              <span>$120.00</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-white/20 text-lg md:text-xl font-bold">
              <span>SnapNow Revenue</span>
              <span>$45.00</span>
            </div>
            <p className="text-xs md:text-sm text-white/60 text-center">30% effective take rate per transaction</p>
          </div>
        </div>
      </div>
      <div className="mt-4 md:mt-6 bg-white/10 backdrop-blur rounded-xl p-4 text-center">
        <p className="text-base md:text-lg">Additional Revenue: <span className="font-semibold">Photo Editing Add-on Service</span> (same fee structure applies)</p>
      </div>
    </div>,

    // Slide 6: Key Features
    <div key="features" className="slide-content min-h-[600px] flex flex-col bg-white p-8 md:p-12">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 md:mb-8 flex items-center gap-3">
        <span className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-xl md:text-2xl">⚡</span>
        Platform Features
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 flex-1">
        <div className="p-4 md:p-6 bg-gray-50 rounded-2xl border border-gray-100">
          <MapPin className="w-8 md:w-10 h-8 md:h-10 text-violet-600 mb-3 md:mb-4" />
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Location-Based Discovery</h3>
          <p className="text-gray-600 text-xs md:text-sm">Interactive map showing nearby photographers with real-time availability</p>
        </div>
        <div className="p-4 md:p-6 bg-gray-50 rounded-2xl border border-gray-100">
          <Calendar className="w-8 md:w-10 h-8 md:h-10 text-violet-600 mb-3 md:mb-4" />
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Smart Booking System</h3>
          <p className="text-gray-600 text-xs md:text-sm">Dynamic response windows based on session urgency (30 min to 24 hours)</p>
        </div>
        <div className="p-4 md:p-6 bg-gray-50 rounded-2xl border border-gray-100">
          <CreditCard className="w-8 md:w-10 h-8 md:h-10 text-violet-600 mb-3 md:mb-4" />
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Secure Payments</h3>
          <p className="text-gray-600 text-xs md:text-sm">Stripe-powered payments with automatic fee splitting and photographer payouts</p>
        </div>
        <div className="p-4 md:p-6 bg-gray-50 rounded-2xl border border-gray-100">
          <Image className="w-8 md:w-10 h-8 md:h-10 text-violet-600 mb-3 md:mb-4" />
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">In-App Photo Gallery</h3>
          <p className="text-gray-600 text-xs md:text-sm">Permanent galleries for customers to view, download, and share their photos</p>
        </div>
        <div className="p-4 md:p-6 bg-gray-50 rounded-2xl border border-gray-100">
          <Star className="w-8 md:w-10 h-8 md:h-10 text-violet-600 mb-3 md:mb-4" />
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Reviews & Ratings</h3>
          <p className="text-gray-600 text-xs md:text-sm">Build trust with verified reviews and photographer response capability</p>
        </div>
        <div className="p-4 md:p-6 bg-gray-50 rounded-2xl border border-gray-100">
          <Sparkles className="w-8 md:w-10 h-8 md:h-10 text-violet-600 mb-3 md:mb-4" />
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Editing Add-on</h3>
          <p className="text-gray-600 text-xs md:text-sm">Photographers offer post-delivery editing services for additional revenue</p>
        </div>
      </div>
    </div>,

    // Slide 7: Competitive Advantage
    <div key="advantage" className="slide-content min-h-[600px] flex flex-col bg-gradient-to-br from-indigo-600 to-blue-700 text-white p-8 md:p-12">
      <h2 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8 flex items-center gap-3">
        <span className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-white/20 flex items-center justify-center text-xl md:text-2xl">🏆</span>
        Why SnapNow Wins
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 flex-1">
        <div className="space-y-4">
          <h3 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">vs. Traditional Booking</h3>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 md:p-5 space-y-2 md:space-y-3 text-sm md:text-base">
            <div className="flex items-center gap-3">
              <span className="text-green-400 text-xl">✓</span>
              <span>Book in minutes, not days of research</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-400 text-xl">✓</span>
              <span>Verified portfolios and real reviews</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-400 text-xl">✓</span>
              <span>Secure payment protection for both sides</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-400 text-xl">✓</span>
              <span>In-app delivery with permanent gallery</span>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">vs. Stock Photography</h3>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 md:p-5 space-y-2 md:space-y-3 text-sm md:text-base">
            <div className="flex items-center gap-3">
              <span className="text-green-400 text-xl">✓</span>
              <span>YOU are in the photos, not models</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-400 text-xl">✓</span>
              <span>Authentic moments, not staged shots</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-400 text-xl">✓</span>
              <span>Local expertise on best photo spots</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-400 text-xl">✓</span>
              <span>Memories that last a lifetime</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 md:mt-8 bg-white/10 backdrop-blur rounded-xl p-4 md:p-6">
        <h4 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">Network Effects</h4>
        <p className="text-white/90 text-sm md:text-base">More photographers → Better coverage → More customers → Higher earnings → More photographers</p>
      </div>
    </div>,

    // Slide 8: Traction & Roadmap
    <div key="traction" className="slide-content min-h-[600px] flex flex-col bg-white p-8 md:p-12">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 md:mb-8 flex items-center gap-3">
        <span className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xl md:text-2xl">🚀</span>
        Roadmap
      </h2>
      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-green-50 rounded-2xl p-4 md:p-6 border-2 border-green-200 relative">
          <div className="absolute -top-3 left-3 md:left-4 bg-green-500 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium">Complete</div>
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mt-3 md:mt-4 mb-2 md:mb-3">Phase 1: MVP</h3>
          <ul className="text-xs md:text-sm text-gray-600 space-y-1 md:space-y-2">
            <li>✓ User authentication</li>
            <li>✓ Photographer profiles</li>
            <li>✓ Booking system</li>
            <li>✓ Payment processing</li>
            <li>✓ Photo delivery</li>
            <li>✓ Reviews system</li>
            <li>✓ Editing add-on</li>
          </ul>
        </div>
        <div className="bg-blue-50 rounded-2xl p-4 md:p-6 border-2 border-blue-200 relative">
          <div className="absolute -top-3 left-3 md:left-4 bg-blue-500 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium">Next</div>
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mt-3 md:mt-4 mb-2 md:mb-3">Phase 2: Mobile</h3>
          <ul className="text-xs md:text-sm text-gray-600 space-y-1 md:space-y-2">
            <li>○ iOS App Store launch</li>
            <li>○ Android Play Store</li>
            <li>○ Push notifications</li>
            <li>○ In-app messaging</li>
            <li>○ Camera integration</li>
          </ul>
        </div>
        <div className="bg-purple-50 rounded-2xl p-4 md:p-6 border-2 border-purple-200 relative">
          <div className="absolute -top-3 left-3 md:left-4 bg-purple-500 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium">Q3 2025</div>
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mt-3 md:mt-4 mb-2 md:mb-3">Phase 3: Scale</h3>
          <ul className="text-xs md:text-sm text-gray-600 space-y-1 md:space-y-2">
            <li>○ 10 major cities</li>
            <li>○ Photographer onboarding</li>
            <li>○ Marketing campaigns</li>
            <li>○ Partner hotels/tours</li>
            <li>○ AI photo curation</li>
          </ul>
        </div>
        <div className="bg-amber-50 rounded-2xl p-4 md:p-6 border-2 border-amber-200 relative">
          <div className="absolute -top-3 left-3 md:left-4 bg-amber-500 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium">2026</div>
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mt-3 md:mt-4 mb-2 md:mb-3">Phase 4: Expand</h3>
          <ul className="text-xs md:text-sm text-gray-600 space-y-1 md:space-y-2">
            <li>○ 50+ destinations</li>
            <li>○ Video services</li>
            <li>○ Drone photography</li>
            <li>○ Event packages</li>
            <li>○ Enterprise clients</li>
          </ul>
        </div>
      </div>
    </div>,

    // Slide 9: The Ask
    <div key="ask" className="slide-content min-h-[600px] flex flex-col bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white p-8 md:p-12">
      <h2 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8 flex items-center gap-3">
        <span className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-white/20 flex items-center justify-center text-xl md:text-2xl">🤝</span>
        The Ask
      </h2>
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="bg-white/10 backdrop-blur rounded-3xl p-6 md:p-10 text-center max-w-2xl w-full">
          <p className="text-4xl md:text-5xl font-bold mb-3 md:mb-4">$500K</p>
          <p className="text-xl md:text-2xl text-white/90 mb-6 md:mb-8">Seed Round</p>
          <div className="grid grid-cols-3 gap-3 md:gap-6 text-left">
            <div className="bg-white/10 rounded-xl p-3 md:p-4">
              <p className="text-xl md:text-2xl font-bold mb-1">40%</p>
              <p className="text-xs md:text-sm text-white/80">Product Development</p>
              <p className="text-xs text-white/60 hidden md:block">Mobile apps & features</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 md:p-4">
              <p className="text-xl md:text-2xl font-bold mb-1">35%</p>
              <p className="text-xs md:text-sm text-white/80">Growth & Marketing</p>
              <p className="text-xs text-white/60 hidden md:block">User acquisition</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 md:p-4">
              <p className="text-xl md:text-2xl font-bold mb-1">25%</p>
              <p className="text-xs md:text-sm text-white/80">Operations</p>
              <p className="text-xs text-white/60 hidden md:block">Team & infrastructure</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 md:mt-8 text-center">
        <p className="text-lg md:text-xl text-white/90 mb-4">Let's capture the world's memories, together.</p>
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 md:w-16 h-12 md:h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
            <Camera className="w-6 md:w-8 h-6 md:h-8" />
          </div>
          <span className="text-2xl md:text-3xl font-bold">SnapNow</span>
        </div>
      </div>
    </div>,

    // Slide 10: Contact
    <div key="contact" className="slide-content min-h-[600px] flex flex-col items-center justify-center bg-gray-900 text-white p-8 md:p-12">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-6 md:mb-8">
          <div className="w-16 md:w-20 h-16 md:h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Camera className="w-8 md:w-10 h-8 md:h-10" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-3 md:mb-4">Thank You</h1>
        <p className="text-xl md:text-2xl text-gray-400 mb-8 md:mb-12">Let's discuss how we can work together</p>
        
        <div className="bg-gray-800 rounded-2xl p-6 md:p-8 max-w-md mx-auto">
          <div className="space-y-4 text-left">
            <div>
              <p className="text-gray-400 text-sm">Contact</p>
              <p className="text-lg md:text-xl">your.email@example.com</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Website</p>
              <p className="text-lg md:text-xl">www.snapnow.app</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Demo</p>
              <p className="text-lg md:text-xl">Available upon request</p>
            </div>
          </div>
        </div>
        
        <p className="mt-8 md:mt-12 text-gray-500">© 2025 SnapNow. All rights reserved.</p>
      </div>
    </div>
  ];

  const nextSlide = () => setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
  const prevSlide = () => setCurrentSlide((prev) => Math.max(prev - 1, 0));

  // Mobile view - simplified with prominent download button
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex flex-col">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-semibold">SnapNow</span>
          </div>
          <span className="text-white/60 text-sm">Investor Pitch</span>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-6">
            <Camera className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">SnapNow</h1>
          <p className="text-white/80 mb-8">Investor Pitch Deck</p>
          
          {/* Download button - prominent */}
          <Button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            size="lg"
            className="bg-white text-violet-600 hover:bg-white/90 font-semibold px-8 py-6 text-lg rounded-xl shadow-lg"
            data-testid="button-download-pdf-mobile"
          >
            <Download className="w-5 h-5 mr-2" />
            {isGenerating ? "Generating PDF..." : "Download PDF"}
          </Button>
          
          <p className="text-white/60 text-sm mt-4">10-slide investor presentation</p>

          {/* Desktop suggestion */}
          <div className="mt-8 p-4 bg-white/10 backdrop-blur rounded-xl max-w-xs">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
              <Monitor className="w-4 h-4" />
              <span>Want to preview slides?</span>
            </div>
            <p className="text-white/60 text-xs">Open this page on a desktop or tablet for the full slide viewer experience.</p>
          </div>
        </div>

        {/* Slide preview thumbnails */}
        <div className="p-4 border-t border-white/10">
          <p className="text-white/60 text-xs mb-3 text-center">Preview ({slides.length} slides)</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['Cover', 'Problem', 'Solution', 'Market', 'Business', 'Features', 'Advantage', 'Roadmap', 'The Ask', 'Contact'].map((name, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-16 h-12 bg-white/10 rounded-lg flex items-center justify-center"
              >
                <span className="text-white/60 text-[10px] text-center px-1">{name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hidden PDF Content */}
        <div className="fixed left-[-9999px]" aria-hidden="true">
          <div ref={deckRef} className="w-[11in]">
            {slides.map((slide, index) => (
              <div key={index} className="html2pdf__page-break">
                {slide}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Desktop view - full slide viewer
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={prevSlide}
            disabled={currentSlide === 0}
            data-testid="button-prev-slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-gray-600" data-testid="text-slide-count">
            Slide {currentSlide + 1} of {slides.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            data-testid="button-next-slide"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <Button
          onClick={handleDownloadPDF}
          disabled={isGenerating}
          className="bg-violet-600 hover:bg-violet-700"
          data-testid="button-download-pdf"
        >
          <Download className="w-4 h-4 mr-2" />
          {isGenerating ? "Generating..." : "Download PDF"}
        </Button>
      </div>

      {/* Slide Preview */}
      <div className="pt-20 pb-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Current Slide */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {slides[currentSlide]}
          </div>

          {/* Slide Thumbnails */}
          <div className="mt-6 flex gap-2 overflow-x-auto pb-4">
            {['Cover', 'Problem', 'Solution', 'Market', 'Business', 'Features', 'Advantage', 'Roadmap', 'The Ask', 'Contact'].map((name, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`flex-shrink-0 w-24 h-16 rounded-lg border-2 transition-all ${
                  currentSlide === index
                    ? "border-violet-600 ring-2 ring-violet-200"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                data-testid={`button-slide-thumbnail-${index}`}
              >
                <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center text-xs text-gray-500 px-1 text-center">
                  {name}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hidden PDF Content */}
      <div className="fixed left-[-9999px]" aria-hidden="true">
        <div ref={deckRef} className="w-[11in]">
          {slides.map((slide, index) => (
            <div key={index} className="html2pdf__page-break">
              {slide}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
