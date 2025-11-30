import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, ChevronLeft, ChevronRight, Camera, MapPin, Calendar, CreditCard, Star, Image, Sparkles, Monitor } from "lucide-react";
import { toast } from "sonner";

export default function PitchDeck() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showPdfContent, setShowPdfContent] = useState(false);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

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
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;
      
      // Show the PDF content temporarily
      setShowPdfContent(true);
      
      // Wait for React to render
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const container = pdfContainerRef.current;
      if (!container) {
        throw new Error('PDF content not found');
      }

      const slideElements = container.querySelectorAll('.pdf-slide');
      if (slideElements.length === 0) {
        throw new Error('No slides found');
      }

      // Create PDF with landscape letter size
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'letter'
      });

      const pdfWidth = 792; // Letter landscape width in points
      const pdfHeight = 612; // Letter landscape height in points

      for (let i = 0; i < slideElements.length; i++) {
        const slideEl = slideElements[i] as HTMLElement;
        
        const canvas = await html2canvas(slideEl, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.92);
        
        if (i > 0) {
          pdf.addPage();
        }
        
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      }

      // Hide the PDF content
      setShowPdfContent(false);

      pdf.save('SnapNow-Investor-Pitch.pdf');
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error('Error generating PDF:', error);
      setShowPdfContent(false);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // PDF-optimized slides with fixed dimensions
  const pdfSlides = [
    // Slide 1: Cover
    <div key="cover" className="pdf-slide w-[792px] h-[612px] flex flex-col items-center justify-center text-white p-12" style={{background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #4f46e5 100%)'}}>
      <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
        <Camera className="w-10 h-10" />
      </div>
      <h1 className="text-6xl font-bold mb-4 text-center">SnapNow</h1>
      <p className="text-2xl text-white/90 mb-8 text-center">The Uber for Professional Photography</p>
      <div className="flex items-center gap-2 text-lg text-white/80">
        <MapPin className="w-5 h-5" />
        <span>Connecting Travelers with Local Photographers Worldwide</span>
      </div>
      <div className="mt-auto text-white/60 text-sm">Investor Presentation 2025</div>
    </div>,

    // Slide 2: Problem
    <div key="problem" className="pdf-slide w-[792px] h-[612px] flex flex-col bg-white p-10">
      <h2 className="text-4xl font-bold text-gray-900 mb-6 flex items-center gap-3">
        <span className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-2xl font-bold">!</span>
        The Problem
      </h2>
      <div className="grid grid-cols-2 gap-6 flex-1">
        <div className="p-5 bg-red-50 rounded-xl border border-red-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">For Travelers</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li className="flex items-start gap-2"><span className="text-red-500">✗</span><span>Selfies don't capture the magic of travel</span></li>
            <li className="flex items-start gap-2"><span className="text-red-500">✗</span><span>Finding reliable local photographers is risky</span></li>
            <li className="flex items-start gap-2"><span className="text-red-500">✗</span><span>No easy way to book, pay, or receive photos</span></li>
          </ul>
        </div>
        <div className="p-5 bg-orange-50 rounded-xl border border-orange-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">For Photographers</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li className="flex items-start gap-2"><span className="text-orange-500">✗</span><span>Difficulty finding consistent clients</span></li>
            <li className="flex items-start gap-2"><span className="text-orange-500">✗</span><span>No platform for on-demand photo sessions</span></li>
            <li className="flex items-start gap-2"><span className="text-orange-500">✗</span><span>International payment collection is complicated</span></li>
          </ul>
        </div>
      </div>
      <div className="mt-4 p-4 bg-gray-100 rounded-xl text-center">
        <p className="text-lg text-gray-800 font-medium">"78% of millennials prefer spending on experiences over things"</p>
        <p className="text-sm text-gray-500">— Harris Poll</p>
      </div>
    </div>,

    // Slide 3: Solution
    <div key="solution" className="pdf-slide w-[792px] h-[612px] flex flex-col text-white p-10" style={{background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)'}}>
      <h2 className="text-4xl font-bold mb-6 flex items-center gap-3">
        <span className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">💡</span>
        The Solution: SnapNow
      </h2>
      <div className="grid grid-cols-3 gap-4 flex-1">
        <div className="bg-white/10 rounded-xl p-5 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mb-3">
            <MapPin className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Discover</h3>
          <p className="text-white/80 text-sm">Find verified local photographers near any destination</p>
        </div>
        <div className="bg-white/10 rounded-xl p-5 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mb-3">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Book Instantly</h3>
          <p className="text-white/80 text-sm">Request sessions in minutes with dynamic availability</p>
        </div>
        <div className="bg-white/10 rounded-xl p-5 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mb-3">
            <Image className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Receive & Share</h3>
          <p className="text-white/80 text-sm">Get photos delivered to your in-app gallery</p>
        </div>
      </div>
      <div className="mt-4 bg-white/10 rounded-xl p-4 text-center">
        <p className="text-xl font-semibold">"Book a photographer as easily as you'd book an Uber"</p>
      </div>
    </div>,

    // Slide 4: Market
    <div key="market" className="pdf-slide w-[792px] h-[612px] flex flex-col bg-white p-10">
      <h2 className="text-4xl font-bold text-gray-900 mb-6 flex items-center gap-3">
        <span className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl">📊</span>
        Market Opportunity
      </h2>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-4xl font-bold text-blue-600 mb-1">$44B</p>
          <p className="text-sm text-gray-600 font-medium">Photography Services Market</p>
          <p className="text-xs text-gray-500">Growing 5.4% annually</p>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-100">
          <p className="text-4xl font-bold text-purple-600 mb-1">1.5B</p>
          <p className="text-sm text-gray-600 font-medium">International Tourists</p>
          <p className="text-xs text-gray-500">Recovering fast post-pandemic</p>
        </div>
        <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-100">
          <p className="text-4xl font-bold text-emerald-600 mb-1">$200+</p>
          <p className="text-sm text-gray-600 font-medium">Average Session Value</p>
          <p className="text-xs text-gray-500">High willingness to pay</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 flex-1">
        <div className="p-4 bg-gray-50 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">Target Users</h4>
          <ul className="text-gray-600 space-y-1 text-sm">
            <li>• Couples on honeymoons & engagements</li>
            <li>• Families on vacation</li>
            <li>• Solo travelers & influencers</li>
            <li>• Business travelers</li>
          </ul>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">Geographic Focus</h4>
          <ul className="text-gray-600 space-y-1 text-sm">
            <li>• Major tourist destinations</li>
            <li>• Instagram-famous locations</li>
            <li>• Wedding & honeymoon hotspots</li>
            <li>• Urban centers with tourist traffic</li>
          </ul>
        </div>
      </div>
    </div>,

    // Slide 5: Business Model
    <div key="business" className="pdf-slide w-[792px] h-[612px] flex flex-col text-white p-10" style={{background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)'}}>
      <h2 className="text-4xl font-bold mb-6 flex items-center gap-3">
        <span className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">💰</span>
        Business Model
      </h2>
      <div className="grid grid-cols-2 gap-6 flex-1">
        <div className="bg-white/10 rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Two-Sided Revenue
          </h3>
          <div className="space-y-4">
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-2xl font-bold mb-1">10%</p>
              <p className="text-white/80 text-sm">Customer Service Fee</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-2xl font-bold mb-1">20%</p>
              <p className="text-white/80 text-sm">Photographer Commission</p>
            </div>
          </div>
        </div>
        <div className="bg-white/10 rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4">Revenue Example</h3>
          <div className="bg-white/10 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between border-b border-white/20 pb-2">
              <span>Session Price</span>
              <span className="font-semibold">$150.00</span>
            </div>
            <div className="flex justify-between text-white/80">
              <span>Customer Pays (+10%)</span>
              <span>$165.00</span>
            </div>
            <div className="flex justify-between text-white/80">
              <span>Photographer Gets (80%)</span>
              <span>$120.00</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-white/20 font-bold">
              <span>SnapNow Revenue</span>
              <span>$45.00</span>
            </div>
            <p className="text-xs text-white/60 text-center pt-2">30% effective take rate</p>
          </div>
        </div>
      </div>
    </div>,

    // Slide 6: Features
    <div key="features" className="pdf-slide w-[792px] h-[612px] flex flex-col bg-white p-10">
      <h2 className="text-4xl font-bold text-gray-900 mb-6 flex items-center gap-3">
        <span className="w-12 h-12 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-2xl">⚡</span>
        Platform Features
      </h2>
      <div className="grid grid-cols-3 gap-4 flex-1">
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
          <MapPin className="w-8 h-8 text-violet-600 mb-2" />
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Location Discovery</h3>
          <p className="text-gray-600 text-xs">Interactive map with nearby photographers</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
          <Calendar className="w-8 h-8 text-violet-600 mb-2" />
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Smart Booking</h3>
          <p className="text-gray-600 text-xs">Dynamic response windows (30min-24h)</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
          <CreditCard className="w-8 h-8 text-violet-600 mb-2" />
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Secure Payments</h3>
          <p className="text-gray-600 text-xs">Stripe-powered with auto fee splitting</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
          <Image className="w-8 h-8 text-violet-600 mb-2" />
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Photo Gallery</h3>
          <p className="text-gray-600 text-xs">Permanent galleries to view & download</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
          <Star className="w-8 h-8 text-violet-600 mb-2" />
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Reviews & Ratings</h3>
          <p className="text-gray-600 text-xs">Verified reviews with responses</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
          <Sparkles className="w-8 h-8 text-violet-600 mb-2" />
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Editing Add-on</h3>
          <p className="text-gray-600 text-xs">Post-delivery editing services</p>
        </div>
      </div>
    </div>,

    // Slide 7: Competitive Advantage
    <div key="advantage" className="pdf-slide w-[792px] h-[612px] flex flex-col text-white p-10" style={{background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)'}}>
      <h2 className="text-4xl font-bold mb-6 flex items-center gap-3">
        <span className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">🏆</span>
        Why SnapNow Wins
      </h2>
      <div className="grid grid-cols-2 gap-6 flex-1">
        <div>
          <h3 className="text-xl font-semibold mb-3">vs. Traditional Booking</h3>
          <div className="bg-white/10 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex items-center gap-2"><span className="text-green-400">✓</span><span>Book in minutes, not days</span></div>
            <div className="flex items-center gap-2"><span className="text-green-400">✓</span><span>Verified portfolios and reviews</span></div>
            <div className="flex items-center gap-2"><span className="text-green-400">✓</span><span>Secure payment protection</span></div>
            <div className="flex items-center gap-2"><span className="text-green-400">✓</span><span>In-app delivery with gallery</span></div>
          </div>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-3">vs. Stock Photography</h3>
          <div className="bg-white/10 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex items-center gap-2"><span className="text-green-400">✓</span><span>YOU are in the photos</span></div>
            <div className="flex items-center gap-2"><span className="text-green-400">✓</span><span>Authentic moments captured</span></div>
            <div className="flex items-center gap-2"><span className="text-green-400">✓</span><span>Local expertise on best spots</span></div>
            <div className="flex items-center gap-2"><span className="text-green-400">✓</span><span>Memories that last forever</span></div>
          </div>
        </div>
      </div>
      <div className="mt-4 bg-white/10 rounded-xl p-4">
        <h4 className="font-semibold mb-2">Network Effects</h4>
        <p className="text-white/90 text-sm">More photographers → Better coverage → More customers → Higher earnings → More photographers</p>
      </div>
    </div>,

    // Slide 8: Roadmap
    <div key="roadmap" className="pdf-slide w-[792px] h-[612px] flex flex-col bg-white p-10">
      <h2 className="text-4xl font-bold text-gray-900 mb-6 flex items-center gap-3">
        <span className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-2xl">🚀</span>
        Roadmap
      </h2>
      <div className="grid grid-cols-4 gap-3 flex-1">
        <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200 relative">
          <div className="absolute -top-2 left-3 bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">Complete</div>
          <h3 className="text-sm font-semibold text-gray-900 mt-3 mb-2">Phase 1: MVP</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>✓ User auth</li>
            <li>✓ Profiles</li>
            <li>✓ Booking</li>
            <li>✓ Payments</li>
            <li>✓ Photo delivery</li>
            <li>✓ Reviews</li>
          </ul>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200 relative">
          <div className="absolute -top-2 left-3 bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">Next</div>
          <h3 className="text-sm font-semibold text-gray-900 mt-3 mb-2">Phase 2: Mobile</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>○ iOS launch</li>
            <li>○ Android</li>
            <li>○ Push notifs</li>
            <li>○ Messaging</li>
            <li>○ Camera</li>
          </ul>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200 relative">
          <div className="absolute -top-2 left-3 bg-purple-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">Q3 2025</div>
          <h3 className="text-sm font-semibold text-gray-900 mt-3 mb-2">Phase 3: Scale</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>○ 10 cities</li>
            <li>○ Onboarding</li>
            <li>○ Marketing</li>
            <li>○ Partners</li>
            <li>○ AI curation</li>
          </ul>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 border-2 border-amber-200 relative">
          <div className="absolute -top-2 left-3 bg-amber-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">2026</div>
          <h3 className="text-sm font-semibold text-gray-900 mt-3 mb-2">Phase 4: Expand</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>○ 50+ cities</li>
            <li>○ Video</li>
            <li>○ Drones</li>
            <li>○ Events</li>
            <li>○ Enterprise</li>
          </ul>
        </div>
      </div>
    </div>,

    // Slide 9: The Ask
    <div key="ask" className="pdf-slide w-[792px] h-[612px] flex flex-col text-white p-10" style={{background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #4f46e5 100%)'}}>
      <h2 className="text-4xl font-bold mb-6 flex items-center gap-3">
        <span className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">🤝</span>
        The Ask
      </h2>
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="bg-white/10 rounded-2xl p-8 text-center max-w-lg">
          <p className="text-5xl font-bold mb-3">$500K</p>
          <p className="text-2xl text-white/90 mb-6">Seed Round</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-2xl font-bold mb-1">40%</p>
              <p className="text-xs text-white/80">Product Dev</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-2xl font-bold mb-1">35%</p>
              <p className="text-xs text-white/80">Growth</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-2xl font-bold mb-1">25%</p>
              <p className="text-xs text-white/80">Operations</p>
            </div>
          </div>
        </div>
      </div>
      <div className="text-center">
        <p className="text-lg text-white/90 mb-3">Let's capture the world's memories, together.</p>
        <div className="flex items-center justify-center gap-2">
          <Camera className="w-6 h-6" />
          <span className="text-2xl font-bold">SnapNow</span>
        </div>
      </div>
    </div>,

    // Slide 10: Contact
    <div key="contact" className="pdf-slide w-[792px] h-[612px] flex flex-col items-center justify-center bg-gray-900 text-white p-10">
      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-6">
        <Camera className="w-8 h-8" />
      </div>
      <h1 className="text-5xl font-bold mb-3">Thank You</h1>
      <p className="text-xl text-gray-400 mb-8">Let's discuss how we can work together</p>
      <div className="bg-gray-800 rounded-xl p-6 w-80">
        <div className="space-y-3 text-left">
          <div>
            <p className="text-gray-400 text-xs">Contact</p>
            <p className="text-lg">your.email@example.com</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Website</p>
            <p className="text-lg">www.snapnow.app</p>
          </div>
        </div>
      </div>
      <p className="mt-8 text-gray-500 text-sm">© 2025 SnapNow. All rights reserved.</p>
    </div>
  ];

  // Interactive slides for the viewer (responsive)
  const viewerSlides = [
    // Slide 1: Cover
    <div key="cover" className="min-h-[500px] flex flex-col items-center justify-center bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white p-8 md:p-12">
      <div className="w-16 md:w-20 h-16 md:h-20 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
        <Camera className="w-8 md:w-10 h-8 md:h-10" />
      </div>
      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">SnapNow</h1>
      <p className="text-xl md:text-2xl text-white/90 mb-6 text-center">The Uber for Professional Photography</p>
      <div className="flex items-center gap-2 text-sm md:text-base text-white/80 text-center">
        <MapPin className="w-4 h-4" />
        <span>Connecting Travelers with Local Photographers Worldwide</span>
      </div>
      <div className="mt-8 text-white/60 text-sm">Investor Presentation 2025</div>
    </div>,

    // Slide 2-10: Simplified for viewer
    <div key="problem" className="min-h-[500px] flex flex-col bg-white p-6 md:p-10">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-lg font-bold">!</span>
        The Problem
      </h2>
      <div className="space-y-4 flex-1">
        <div className="p-4 bg-red-50 rounded-xl">
          <h3 className="font-semibold text-gray-900 mb-2">For Travelers</h3>
          <p className="text-gray-600 text-sm">Finding reliable photographers is risky and time-consuming</p>
        </div>
        <div className="p-4 bg-orange-50 rounded-xl">
          <h3 className="font-semibold text-gray-900 mb-2">For Photographers</h3>
          <p className="text-gray-600 text-sm">No platform for on-demand tourist photo sessions</p>
        </div>
      </div>
    </div>,

    <div key="solution" className="min-h-[500px] flex flex-col bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 md:p-10">
      <h2 className="text-2xl md:text-3xl font-bold mb-4">💡 The Solution</h2>
      <div className="space-y-3 flex-1">
        <div className="bg-white/10 rounded-xl p-4 text-center">
          <MapPin className="w-6 h-6 mx-auto mb-2" />
          <p className="font-semibold">Discover</p>
        </div>
        <div className="bg-white/10 rounded-xl p-4 text-center">
          <Calendar className="w-6 h-6 mx-auto mb-2" />
          <p className="font-semibold">Book Instantly</p>
        </div>
        <div className="bg-white/10 rounded-xl p-4 text-center">
          <Image className="w-6 h-6 mx-auto mb-2" />
          <p className="font-semibold">Receive & Share</p>
        </div>
      </div>
    </div>,

    <div key="market" className="min-h-[500px] flex flex-col bg-white p-6 md:p-10">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">📊 Market</h2>
      <div className="space-y-3 flex-1">
        <div className="text-center p-4 bg-blue-50 rounded-xl">
          <p className="text-3xl font-bold text-blue-600">$44B</p>
          <p className="text-sm text-gray-600">Photography Market</p>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-xl">
          <p className="text-3xl font-bold text-purple-600">1.5B</p>
          <p className="text-sm text-gray-600">Tourists Annually</p>
        </div>
      </div>
    </div>,

    <div key="business" className="min-h-[500px] flex flex-col bg-gradient-to-br from-amber-500 to-orange-600 text-white p-6 md:p-10">
      <h2 className="text-2xl md:text-3xl font-bold mb-4">💰 Business Model</h2>
      <div className="space-y-3 flex-1">
        <div className="bg-white/10 rounded-xl p-4">
          <p className="text-2xl font-bold">10%</p>
          <p className="text-sm text-white/80">Customer Fee</p>
        </div>
        <div className="bg-white/10 rounded-xl p-4">
          <p className="text-2xl font-bold">20%</p>
          <p className="text-sm text-white/80">Photographer Commission</p>
        </div>
        <div className="bg-white/10 rounded-xl p-4">
          <p className="text-2xl font-bold">30%</p>
          <p className="text-sm text-white/80">Effective Take Rate</p>
        </div>
      </div>
    </div>,

    <div key="features" className="min-h-[500px] flex flex-col bg-white p-6 md:p-10">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">⚡ Features</h2>
      <div className="grid grid-cols-2 gap-3 flex-1">
        <div className="p-3 bg-gray-50 rounded-xl text-center">
          <MapPin className="w-6 h-6 text-violet-600 mx-auto mb-1" />
          <p className="text-xs font-medium">Discovery</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-xl text-center">
          <Calendar className="w-6 h-6 text-violet-600 mx-auto mb-1" />
          <p className="text-xs font-medium">Booking</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-xl text-center">
          <CreditCard className="w-6 h-6 text-violet-600 mx-auto mb-1" />
          <p className="text-xs font-medium">Payments</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-xl text-center">
          <Star className="w-6 h-6 text-violet-600 mx-auto mb-1" />
          <p className="text-xs font-medium">Reviews</p>
        </div>
      </div>
    </div>,

    <div key="advantage" className="min-h-[500px] flex flex-col bg-gradient-to-br from-indigo-600 to-blue-700 text-white p-6 md:p-10">
      <h2 className="text-2xl md:text-3xl font-bold mb-4">🏆 Why We Win</h2>
      <div className="space-y-2 flex-1 text-sm">
        <p className="flex items-center gap-2"><span className="text-green-400">✓</span> Book in minutes</p>
        <p className="flex items-center gap-2"><span className="text-green-400">✓</span> Verified photographers</p>
        <p className="flex items-center gap-2"><span className="text-green-400">✓</span> Secure payments</p>
        <p className="flex items-center gap-2"><span className="text-green-400">✓</span> In-app delivery</p>
        <p className="flex items-center gap-2"><span className="text-green-400">✓</span> Network effects</p>
      </div>
    </div>,

    <div key="roadmap" className="min-h-[500px] flex flex-col bg-white p-6 md:p-10">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">🚀 Roadmap</h2>
      <div className="space-y-3 flex-1">
        <div className="p-3 bg-green-50 rounded-xl border border-green-200">
          <p className="font-semibold text-sm text-green-700">Phase 1: MVP ✓</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
          <p className="font-semibold text-sm text-blue-700">Phase 2: Mobile Apps</p>
        </div>
        <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
          <p className="font-semibold text-sm text-purple-700">Phase 3: Scale (10 cities)</p>
        </div>
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
          <p className="font-semibold text-sm text-amber-700">Phase 4: 50+ cities</p>
        </div>
      </div>
    </div>,

    <div key="ask" className="min-h-[500px] flex flex-col items-center justify-center bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white p-6 md:p-10">
      <h2 className="text-2xl md:text-3xl font-bold mb-4">🤝 The Ask</h2>
      <div className="bg-white/10 rounded-2xl p-6 text-center">
        <p className="text-4xl font-bold mb-2">$500K</p>
        <p className="text-lg text-white/90">Seed Round</p>
      </div>
      <div className="mt-6 flex items-center gap-2">
        <Camera className="w-5 h-5" />
        <span className="text-xl font-bold">SnapNow</span>
      </div>
    </div>,

    <div key="contact" className="min-h-[500px] flex flex-col items-center justify-center bg-gray-900 text-white p-6 md:p-10">
      <Camera className="w-12 h-12 mb-4" />
      <h1 className="text-3xl font-bold mb-2">Thank You</h1>
      <p className="text-gray-400 mb-6">Let's work together</p>
      <div className="bg-gray-800 rounded-xl p-4 text-sm">
        <p>your.email@example.com</p>
      </div>
    </div>
  ];

  const nextSlide = () => setCurrentSlide((prev) => Math.min(prev + 1, viewerSlides.length - 1));
  const prevSlide = () => setCurrentSlide((prev) => Math.max(prev - 1, 0));

  // Mobile view - simplified with prominent download button
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex flex-col">
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-semibold">SnapNow</span>
          </div>
          <span className="text-white/60 text-sm">Investor Pitch</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
            <Camera className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">SnapNow</h1>
          <p className="text-white/80 mb-8">Investor Pitch Deck</p>
          
          <Button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            size="lg"
            className="bg-white text-violet-600 hover:bg-white/90 font-semibold px-8 py-6 text-lg rounded-xl shadow-lg"
            data-testid="button-download-pdf-mobile"
          >
            <Download className="w-5 h-5 mr-2" />
            {isGenerating ? "Generating..." : "Download PDF"}
          </Button>
          
          <p className="text-white/60 text-sm mt-4">10-slide investor presentation</p>

          <div className="mt-8 p-4 bg-white/10 rounded-xl max-w-xs">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
              <Monitor className="w-4 h-4" />
              <span>Preview slides on desktop</span>
            </div>
            <p className="text-white/60 text-xs">Open on a larger screen for the slide viewer.</p>
          </div>
        </div>

        {/* PDF Content - Hidden until generating */}
        {showPdfContent && (
          <div ref={pdfContainerRef} className="fixed top-0 left-0 bg-white z-50">
            {pdfSlides}
          </div>
        )}
      </div>
    );
  }

  // Desktop view - full slide viewer
  return (
    <div className="min-h-screen bg-gray-100">
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
            Slide {currentSlide + 1} of {viewerSlides.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={nextSlide}
            disabled={currentSlide === viewerSlides.length - 1}
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

      <div className="pt-20 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {viewerSlides[currentSlide]}
          </div>

          <div className="mt-6 flex gap-2 overflow-x-auto pb-4">
            {['Cover', 'Problem', 'Solution', 'Market', 'Business', 'Features', 'Advantage', 'Roadmap', 'The Ask', 'Contact'].map((name, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`flex-shrink-0 w-20 h-14 rounded-lg border-2 transition-all ${
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

      {/* PDF Content - Hidden until generating */}
      {showPdfContent && (
        <div ref={pdfContainerRef} className="fixed top-0 left-0 bg-white z-50">
          {pdfSlides}
        </div>
      )}
    </div>
  );
}
