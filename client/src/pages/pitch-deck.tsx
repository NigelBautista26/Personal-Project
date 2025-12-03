import { useRef, useEffect } from "react";
import { Printer, ArrowLeft, Camera, MapPin, Calendar, CreditCard, Star, Image, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

export default function PitchDeck() {
  const [, navigate] = useLocation();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scaleSlides = () => {
      const slides = document.querySelectorAll('.pitch-slide') as NodeListOf<HTMLElement>;
      const printableHeight = 9.5 * 96; // ~9.5 inches in pixels at 96 DPI (A4 minus margins)
      
      slides.forEach((slide) => {
        const actualHeight = slide.scrollHeight;
        if (actualHeight > printableHeight) {
          const scale = printableHeight / actualHeight;
          slide.style.transform = `scale(${scale})`;
          slide.style.transformOrigin = 'top left';
          slide.style.width = `${100 / scale}%`;
        }
      });
    };

    const resetSlides = () => {
      const slides = document.querySelectorAll('.pitch-slide') as NodeListOf<HTMLElement>;
      slides.forEach((slide) => {
        slide.style.transform = '';
        slide.style.transformOrigin = '';
        slide.style.width = '';
      });
    };

    window.addEventListener('beforeprint', scaleSlides);
    window.addEventListener('afterprint', resetSlides);

    return () => {
      window.removeEventListener('beforeprint', scaleSlides);
      window.removeEventListener('afterprint', resetSlides);
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style>{`
        .pitch-deck-page {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: #111827;
          color: white;
          padding: 1rem;
          overflow-y: auto;
          width: 100vw;
          height: 100vh;
        }
        
        @media print {
          @page { size: A4; margin: 0; }
          
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          html, body, #root {
            height: auto !important;
            overflow: visible !important;
            max-width: none !important;
            width: auto !important;
            border: none !important;
            box-shadow: none !important;
            background: #111827 !important;
          }
          
          .pitch-deck-page {
            position: static !important;
            overflow: visible !important;
            height: auto !important;
            width: auto !important;
            padding: 0 !important;
            background: #111827 !important;
          }
          
          .print-wrapper {
            max-width: none !important;
            background: #111827 !important;
          }
          
          .no-print {
            display: none !important;
          }
          
          .pitch-slide { 
            page-break-after: always; 
            page-break-inside: avoid;
            min-height: 0;
            padding: 0.4in !important;
            margin-bottom: 0 !important;
            background: #111827 !important;
          }
          .pitch-slide:last-of-type { page-break-after: auto; }
          .pitch-slide h2 { font-size: 1.75rem !important; margin-bottom: 0.75rem !important; padding-bottom: 0.4rem !important; }
          .pitch-slide h3 { font-size: 1.1rem !important; margin-bottom: 0.4rem !important; }
          .pitch-slide h4 { font-size: 1.05rem !important; margin-bottom: 0.4rem !important; }
          .pitch-slide .grid { gap: 0.5rem !important; }
          .pitch-slide p { font-size: 0.9rem !important; line-height: 1.4 !important; }
          .pitch-slide li { font-size: 0.9rem !important; line-height: 1.4 !important; }
          .pitch-slide .rounded-xl, .pitch-slide .rounded-2xl { padding: 0.75rem !important; }
          .pitch-slide .rounded-lg { padding: 0.5rem !important; }
          .pitch-slide .text-5xl { font-size: 2rem !important; }
          .pitch-slide .text-4xl { font-size: 1.75rem !important; }
          .pitch-slide .text-3xl { font-size: 1.5rem !important; }
          .pitch-slide .text-2xl { font-size: 1.15rem !important; }
          .pitch-slide .text-xl { font-size: 1rem !important; }
          .pitch-slide .text-lg { font-size: 0.95rem !important; }
          .pitch-slide .w-12 { width: 2.5rem !important; height: 2.5rem !important; }
          .pitch-slide .w-16 { width: 3.5rem !important; height: 3.5rem !important; }
          .pitch-slide .w-10 { width: 2rem !important; height: 2rem !important; }
          .pitch-slide .mb-8 { margin-bottom: 0.6rem !important; }
          .pitch-slide .mb-6 { margin-bottom: 0.5rem !important; }
          .pitch-slide .mb-4 { margin-bottom: 0.4rem !important; }
          .pitch-slide .py-8 { padding-top: 0.75rem !important; padding-bottom: 0.75rem !important; }
          .pitch-slide .space-y-4 > * + * { margin-top: 0.4rem !important; }
          .pitch-slide .space-y-3 > * + * { margin-top: 0.35rem !important; }
          .pitch-slide .space-y-2 > * + * { margin-top: 0.25rem !important; }
        }
      `}</style>
      <div className="pitch-deck-page">
        <div className="print-wrapper max-w-5xl mx-auto">
          <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 p-4 flex items-center justify-between no-print">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg transition-colors"
              data-testid="button-download-pdf"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
          </div>

          <div ref={contentRef} className="p-4 md:p-8 text-white">
        
        {/* Slide 1: Cover */}
        <div className="text-center py-16 mb-12 border-b-2 border-violet-500" style={{ pageBreakAfter: "always" }}>
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-8">
            <Camera className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-6xl font-bold text-white mb-4">SnapNow</h1>
          <p className="text-2xl text-violet-400 font-medium mb-6">The Uber for Professional Photography</p>
          <div className="flex items-center justify-center gap-2 text-lg text-gray-400">
            <MapPin className="w-5 h-5" />
            <span>Connecting Travelers with Local Photographers Worldwide</span>
          </div>
          <p className="mt-12 text-gray-500">Investor Presentation | 2025</p>
        </div>

        {/* Slide 2: The Problem */}
        <section className="pitch-slide mb-12 py-8">
          <h2 className="text-4xl font-bold text-white mb-8 pb-3 border-b-2 border-red-500 flex items-center gap-4">
            <span className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-2xl font-bold">!</span>
            The Problem
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-red-900/30 rounded-xl p-6 border border-red-800/50">
              <h3 className="font-bold text-xl text-red-400 mb-4">For Travelers</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">✗</span>
                  <span>Selfies and tourist photos don't capture the magic of travel</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">✗</span>
                  <span>Finding reliable local photographers is time-consuming and risky</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">✗</span>
                  <span>No easy way to book, pay, or receive photos while traveling</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">✗</span>
                  <span>Language barriers and payment friction with international photographers</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-orange-900/30 rounded-xl p-6 border border-orange-800/50">
              <h3 className="font-bold text-xl text-orange-400 mb-4">For Photographers</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 mt-1">✗</span>
                  <span>Difficulty finding consistent clients, especially tourists</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 mt-1">✗</span>
                  <span>No platform designed for short, on-demand photo sessions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 mt-1">✗</span>
                  <span>Payment collection from international clients is complicated</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 mt-1">✗</span>
                  <span>High customer acquisition costs with limited geographic reach</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6 text-center border border-gray-700">
            <p className="text-xl text-gray-300 italic">
              "78% of millennials say they'd rather spend money on experiences than things"
            </p>
            <p className="text-sm text-gray-500 mt-2">— Harris Poll</p>
          </div>
        </section>

        {/* Slide 3: The Solution */}
        <section className="pitch-slide mb-12 py-8">
          <h2 className="text-4xl font-bold text-white mb-8 pb-3 border-b-2 border-emerald-500 flex items-center gap-4">
            <span className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl">💡</span>
            The Solution: SnapNow
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-emerald-900/30 rounded-xl p-6 border border-emerald-800/50 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="font-bold text-xl text-emerald-400 mb-2">Discover</h3>
              <p className="text-gray-300">Find verified local photographers near any tourist destination with real portfolios and reviews</p>
            </div>
            
            <div className="bg-emerald-900/30 rounded-xl p-6 border border-emerald-800/50 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="font-bold text-xl text-emerald-400 mb-2">Book Instantly</h3>
              <p className="text-gray-300">Request sessions in minutes, not days. Photographers respond quickly with dynamic availability</p>
            </div>
            
            <div className="bg-emerald-900/30 rounded-xl p-6 border border-emerald-800/50 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <Image className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="font-bold text-xl text-emerald-400 mb-2">Receive & Share</h3>
              <p className="text-gray-300">Get professionally edited photos delivered to your permanent in-app gallery within hours</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-900/50 to-teal-900/50 rounded-xl p-6 text-center border border-emerald-700/50">
            <p className="text-2xl font-semibold text-white">
              "Book a photographer as easily as you'd book an Uber"
            </p>
          </div>
        </section>

        {/* Slide 4: Market Opportunity */}
        <section className="pitch-slide mb-12 py-8">
          <h2 className="text-4xl font-bold text-white mb-8 pb-3 border-b-2 border-blue-500 flex items-center gap-4">
            <span className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-2xl">📊</span>
            Market Opportunity
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-900/30 rounded-xl p-6 border border-blue-800/50 text-center">
              <p className="text-5xl font-bold text-blue-400 mb-2">$44B</p>
              <p className="text-lg text-gray-300 font-medium">Global Photography Services Market</p>
              <p className="text-sm text-gray-500 mt-2">Growing 5.4% annually</p>
            </div>
            
            <div className="bg-purple-900/30 rounded-xl p-6 border border-purple-800/50 text-center">
              <p className="text-5xl font-bold text-purple-400 mb-2">1.5B</p>
              <p className="text-lg text-gray-300 font-medium">International Tourist Arrivals</p>
              <p className="text-sm text-gray-500 mt-2">Pre-pandemic peak, recovering fast</p>
            </div>
            
            <div className="bg-green-900/30 rounded-xl p-6 border border-green-800/50 text-center">
              <p className="text-5xl font-bold text-green-400 mb-2">$200+</p>
              <p className="text-lg text-gray-300 font-medium">Average Session Value</p>
              <p className="text-sm text-gray-500 mt-2">High willingness to pay for memories</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h4 className="font-bold text-lg text-white mb-4">Target Users</h4>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-2"><span className="text-blue-400">•</span> Couples on honeymoons & engagements</li>
                <li className="flex items-center gap-2"><span className="text-blue-400">•</span> Families on vacation</li>
                <li className="flex items-center gap-2"><span className="text-blue-400">•</span> Solo travelers & influencers</li>
                <li className="flex items-center gap-2"><span className="text-blue-400">•</span> Business travelers capturing experiences</li>
              </ul>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h4 className="font-bold text-lg text-white mb-4">Geographic Focus</h4>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-2"><span className="text-purple-400">•</span> Major tourist destinations worldwide</li>
                <li className="flex items-center gap-2"><span className="text-purple-400">•</span> Instagram-famous locations</li>
                <li className="flex items-center gap-2"><span className="text-purple-400">•</span> Wedding & honeymoon hotspots</li>
                <li className="flex items-center gap-2"><span className="text-purple-400">•</span> Urban centers with high tourist traffic</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Slide 5: Business Model */}
        <section className="pitch-slide mb-12 py-8">
          <h2 className="text-4xl font-bold text-white mb-8 pb-3 border-b-2 border-amber-500 flex items-center gap-4">
            <span className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl">💰</span>
            Business Model
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-amber-900/30 rounded-xl p-6 border border-amber-800/50">
              <h3 className="font-bold text-xl text-amber-400 mb-6 flex items-center gap-2">
                <CreditCard className="w-6 h-6" />
                Two-Sided Revenue
              </h3>
              <div className="space-y-4">
                <div className="bg-amber-900/50 rounded-lg p-4">
                  <p className="text-4xl font-bold text-amber-400 mb-1">10%</p>
                  <p className="text-gray-300">Customer Service Fee</p>
                  <p className="text-sm text-gray-500">Added to every booking</p>
                </div>
                <div className="bg-amber-900/50 rounded-lg p-4">
                  <p className="text-4xl font-bold text-amber-400 mb-1">20%</p>
                  <p className="text-gray-300">Photographer Commission</p>
                  <p className="text-sm text-gray-500">Deducted from photographer earnings</p>
                </div>
                <div className="bg-amber-900/50 rounded-lg p-4">
                  <p className="text-4xl font-bold text-amber-400 mb-1">20%</p>
                  <p className="text-gray-300">Editing Add-on Commission</p>
                  <p className="text-sm text-gray-500">Applied to photo editing services</p>
                </div>
              </div>
            </div>

            <div className="bg-orange-900/30 rounded-xl p-6 border border-orange-800/50">
              <h3 className="font-bold text-xl text-orange-400 mb-6">Revenue Example</h3>
              <div className="bg-orange-900/50 rounded-lg p-6 space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-orange-700/50">
                  <span className="text-gray-300">Session Price</span>
                  <span className="font-bold text-white text-xl">$150.00</span>
                </div>
                <div className="flex justify-between items-center text-gray-400">
                  <span>Customer Pays (+10%)</span>
                  <span>$165.00</span>
                </div>
                <div className="flex justify-between items-center text-gray-400">
                  <span>Photographer Gets (80%)</span>
                  <span>$120.00</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-orange-700/50">
                  <span className="font-bold text-orange-400 text-lg">SnapNow Revenue</span>
                  <span className="font-bold text-orange-400 text-2xl">$45.00</span>
                </div>
                <p className="text-center text-sm text-gray-500 pt-2">30% effective take rate per transaction</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700">
            <p className="text-lg text-gray-300">
              <strong className="text-amber-400">Additional Revenue Stream:</strong> Photo Editing Add-on Service (same fee structure applies)
            </p>
          </div>
        </section>

        {/* Slide 6: Platform Features */}
        <section className="pitch-slide mb-12 py-8">
          <h2 className="text-4xl font-bold text-white mb-8 pb-3 border-b-2 border-violet-500 flex items-center gap-4">
            <span className="w-12 h-12 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-2xl">⚡</span>
            Platform Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <MapPin className="w-10 h-10 text-violet-400 mb-4" />
              <h3 className="font-bold text-lg text-white mb-2">Location-Based Discovery</h3>
              <p className="text-gray-400">Interactive map showing nearby photographers with real-time availability</p>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <Calendar className="w-10 h-10 text-violet-400 mb-4" />
              <h3 className="font-bold text-lg text-white mb-2">Smart Booking System</h3>
              <p className="text-gray-400">Dynamic response windows based on session urgency (30 min to 24 hours)</p>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <CreditCard className="w-10 h-10 text-violet-400 mb-4" />
              <h3 className="font-bold text-lg text-white mb-2">Secure Payments</h3>
              <p className="text-gray-400">Stripe-powered payments with automatic fee splitting and photographer payouts</p>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <Image className="w-10 h-10 text-violet-400 mb-4" />
              <h3 className="font-bold text-lg text-white mb-2">In-App Photo Gallery</h3>
              <p className="text-gray-400">Permanent galleries for customers to view, download, and share their photos</p>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <Star className="w-10 h-10 text-violet-400 mb-4" />
              <h3 className="font-bold text-lg text-white mb-2">Reviews & Ratings</h3>
              <p className="text-gray-400">Build trust with verified reviews and photographer response capability</p>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <Sparkles className="w-10 h-10 text-violet-400 mb-4" />
              <h3 className="font-bold text-lg text-white mb-2">Editing Add-on</h3>
              <p className="text-gray-400">Photographers offer post-delivery editing services for additional revenue</p>
            </div>
          </div>
        </section>

        {/* Slide 7: Competitive Advantage */}
        <section className="pitch-slide mb-12 py-8">
          <h2 className="text-4xl font-bold text-white mb-8 pb-3 border-b-2 border-indigo-500 flex items-center gap-4">
            <span className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-2xl">🏆</span>
            Why SnapNow Wins
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-indigo-900/30 rounded-xl p-6 border border-indigo-800/50">
              <h3 className="font-bold text-xl text-indigo-400 mb-4">vs. Traditional Booking</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Book in minutes, not days of research</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Verified portfolios and real reviews</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Secure payment protection for both sides</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> In-app delivery with permanent gallery</li>
              </ul>
            </div>
            
            <div className="bg-indigo-900/30 rounded-xl p-6 border border-indigo-800/50">
              <h3 className="font-bold text-xl text-indigo-400 mb-4">vs. Stock Photography</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> YOU are in the photos, not models</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Authentic moments, not staged shots</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Local expertise on best photo spots</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Memories that last a lifetime</li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-900/50 to-blue-900/50 rounded-xl p-6 border border-indigo-700/50">
            <h4 className="font-bold text-xl text-white mb-3">Network Effects</h4>
            <p className="text-lg text-gray-300">
              More photographers → Better coverage → More customers → Higher earnings → More photographers
            </p>
          </div>
        </section>

        {/* Slide 8: Roadmap */}
        <section className="pitch-slide mb-12 py-8">
          <h2 className="text-4xl font-bold text-white mb-8 pb-3 border-b-2 border-green-500 flex items-center gap-4">
            <span className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-2xl">🚀</span>
            Roadmap
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-green-900/30 rounded-xl p-5 border-2 border-green-600 relative">
              <div className="absolute -top-3 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">Complete</div>
              <h3 className="font-bold text-lg text-white mt-4 mb-3">Phase 1: MVP</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>✓ User authentication</li>
                <li>✓ Photographer profiles</li>
                <li>✓ Booking system</li>
                <li>✓ Payment processing</li>
                <li>✓ Photo delivery</li>
                <li>✓ Reviews system</li>
                <li>✓ Editing add-on</li>
              </ul>
            </div>
            
            <div className="bg-blue-900/30 rounded-xl p-5 border-2 border-blue-600 relative">
              <div className="absolute -top-3 left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">Next</div>
              <h3 className="font-bold text-lg text-white mt-4 mb-3">Phase 2: Mobile</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>○ iOS App Store launch</li>
                <li>○ Android Play Store</li>
                <li>○ Push notifications</li>
                <li>○ In-app messaging</li>
                <li>○ Camera integration</li>
              </ul>
            </div>
            
            <div className="bg-purple-900/30 rounded-xl p-5 border-2 border-purple-600 relative">
              <div className="absolute -top-3 left-4 bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">Q3 2025</div>
              <h3 className="font-bold text-lg text-white mt-4 mb-3">Phase 3: Scale</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>○ 10 major cities</li>
                <li>○ Photographer onboarding</li>
                <li>○ Marketing campaigns</li>
                <li>○ Partner hotels/tours</li>
                <li>○ AI photo curation</li>
              </ul>
            </div>
            
            <div className="bg-amber-900/30 rounded-xl p-5 border-2 border-amber-600 relative">
              <div className="absolute -top-3 left-4 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium">2026</div>
              <h3 className="font-bold text-lg text-white mt-4 mb-3">Phase 4: Expand</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>○ 50+ destinations</li>
                <li>○ Video services</li>
                <li>○ Drone photography</li>
                <li>○ Event packages</li>
                <li>○ Enterprise clients</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Slide 9: The Ask */}
        <section className="pitch-slide mb-12 py-8">
          <h2 className="text-4xl font-bold text-white mb-8 pb-3 border-b-2 border-violet-500 flex items-center gap-4">
            <span className="w-12 h-12 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-2xl">🤝</span>
            The Ask
          </h2>

          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-r from-violet-900/50 to-purple-900/50 rounded-2xl p-10 border border-violet-700/50 text-center max-w-xl">
              <p className="text-6xl font-bold text-white mb-4">$500K</p>
              <p className="text-2xl text-violet-400 mb-8">Seed Round</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-violet-900/50 rounded-xl p-4">
                  <p className="text-3xl font-bold text-white mb-1">40%</p>
                  <p className="text-sm text-gray-300">Product Development</p>
                  <p className="text-xs text-gray-500">Mobile apps & features</p>
                </div>
                <div className="bg-violet-900/50 rounded-xl p-4">
                  <p className="text-3xl font-bold text-white mb-1">35%</p>
                  <p className="text-sm text-gray-300">Growth & Marketing</p>
                  <p className="text-xs text-gray-500">User acquisition</p>
                </div>
                <div className="bg-violet-900/50 rounded-xl p-4">
                  <p className="text-3xl font-bold text-white mb-1">25%</p>
                  <p className="text-sm text-gray-300">Operations</p>
                  <p className="text-xs text-gray-500">Team & infrastructure</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xl text-gray-300 mb-6">Let's capture the world's memories, together.</p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">SnapNow</span>
            </div>
          </div>
        </section>

        {/* Slide 10: Contact / Thank You */}
        <section className="pitch-slide py-16 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-8">
            <Camera className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">Thank You</h1>
          <p className="text-2xl text-gray-400 mb-12">Let's discuss how we can work together</p>
          
          <div className="bg-gray-800/50 rounded-2xl p-8 max-w-md mx-auto border border-gray-700">
            <div className="space-y-4 text-left">
              <div>
                <p className="text-gray-500 text-sm">Contact</p>
                <p className="text-xl text-white">your.email@example.com</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Website</p>
                <p className="text-xl text-white">www.snapnow.app</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Demo</p>
                <p className="text-xl text-white">Available upon request</p>
              </div>
            </div>
          </div>
          
          <p className="mt-12 text-gray-600">© 2025 SnapNow. All rights reserved.</p>
        </section>

          </div>
        </div>
      </div>
    </>
  );
}
