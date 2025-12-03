import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function InvestorPitch() {
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style>{`
        .investor-pitch-page {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: #09090b;
          color: white;
          padding: 1rem;
          overflow-y: auto;
          width: 100vw;
          height: 100vh;
        }
        
        @media print {
          @page { 
            size: A4; 
            margin: 0; 
          }
          
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
          
          .investor-pitch-page {
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
          
          .print-content {
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 0.4in !important;
            background: #111827 !important;
            min-height: 100vh !important;
          }
          
          .no-print {
            display: none !important;
          }
          
          section { 
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          table { 
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          .grid { 
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          h2 { 
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
        }
      `}</style>
      <div className="investor-pitch-page">
        <div className="print-wrapper max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6 no-print">
            <Link href="/">
              <Button variant="ghost" className="text-muted-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to App
              </Button>
            </Link>
            <Button 
              onClick={handlePrint}
              className="bg-primary hover:bg-primary/90"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print / Save PDF
            </Button>
          </div>

          <div 
            ref={contentRef} 
            className="print-content bg-gray-900 text-white p-8 rounded-lg shadow-xl"
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
          {/* Header */}
          <div className="text-center mb-8 pb-6 border-b-2 border-violet-500">
            <h1 className="text-4xl font-bold text-violet-400 mb-2">SnapNow</h1>
            <p className="text-xl text-gray-300">Uber for Photography</p>
            <p className="text-sm text-gray-500 mt-2">Investor Pitch Deck - December 2025</p>
          </div>

          {/* Executive Summary */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-violet-400 mb-4 pb-2 border-b border-gray-700">
              Executive Summary
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              SnapNow is a photography marketplace that connects travelers with professional photographers 
              for on-demand photo sessions. Think of it as "Uber for Photography" - but with a specific 
              focus on the travel and tourism market.
            </p>
            <p className="text-gray-300 leading-relaxed">
              While there are existing players in this space, SnapNow differentiates itself through 
              <strong className="text-white"> quality verification</strong>, <strong className="text-white">integrated editing services</strong>, and 
              a <strong className="text-white">traveler-first approach</strong> that existing competitors lack.
            </p>
          </section>

          {/* Market Validation */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-violet-400 mb-4 pb-2 border-b border-gray-700">
              Market Validation
            </h2>
            <div className="bg-green-900/30 p-4 rounded-lg border border-green-500/30 mb-4">
              <p className="text-green-400 font-medium">
                ✓ Competition validates the market - investors should be MORE confident, not less!
              </p>
            </div>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li><strong className="text-white">Snappr</strong> raised $13M+ in funding, proving investor appetite</li>
              <li>50% of marketplace customers say they wouldn't have hired a photographer otherwise - we're creating NEW demand</li>
              <li>Travel photography is a $10B+ market growing at 8% annually</li>
              <li>Instagram culture has created unprecedented demand for quality travel photos</li>
            </ul>
          </section>

          {/* Competitive Analysis */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-violet-400 mb-4 pb-2 border-b border-gray-700">
              Competitive Analysis
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm mb-6">
                <thead>
                  <tr className="bg-violet-900/50">
                    <th className="border border-gray-600 p-3 text-left font-bold text-violet-300">Feature</th>
                    <th className="border border-gray-600 p-3 text-center font-bold text-violet-300">SnapNow</th>
                    <th className="border border-gray-600 p-3 text-center font-bold text-gray-400">Snappr</th>
                    <th className="border border-gray-600 p-3 text-center font-bold text-gray-400">Zazzi</th>
                    <th className="border border-gray-600 p-3 text-center font-bold text-gray-400">Perfocal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-gray-800/50">
                    <td className="border border-gray-600 p-3 text-gray-300">Travel/Tourist Focus</td>
                    <td className="border border-gray-600 p-3 text-center text-green-400 font-bold">✓</td>
                    <td className="border border-gray-600 p-3 text-center text-red-400">✗</td>
                    <td className="border border-gray-600 p-3 text-center text-red-400">✗</td>
                    <td className="border border-gray-600 p-3 text-center text-red-400">✗</td>
                  </tr>
                  <tr className="bg-gray-800/30">
                    <td className="border border-gray-600 p-3 text-gray-300">Portfolio Verification</td>
                    <td className="border border-gray-600 p-3 text-center text-green-400 font-bold">✓</td>
                    <td className="border border-gray-600 p-3 text-center text-yellow-400">Partial</td>
                    <td className="border border-gray-600 p-3 text-center text-red-400">✗</td>
                    <td className="border border-gray-600 p-3 text-center text-yellow-400">Partial</td>
                  </tr>
                  <tr className="bg-gray-800/50">
                    <td className="border border-gray-600 p-3 text-gray-300">Built-in Editing Service</td>
                    <td className="border border-gray-600 p-3 text-center text-green-400 font-bold">✓</td>
                    <td className="border border-gray-600 p-3 text-center text-red-400">✗</td>
                    <td className="border border-gray-600 p-3 text-center text-red-400">✗</td>
                    <td className="border border-gray-600 p-3 text-center text-red-400">✗</td>
                  </tr>
                  <tr className="bg-gray-800/30">
                    <td className="border border-gray-600 p-3 text-gray-300">Unlimited Edit Revisions</td>
                    <td className="border border-gray-600 p-3 text-center text-green-400 font-bold">✓</td>
                    <td className="border border-gray-600 p-3 text-center text-red-400">✗</td>
                    <td className="border border-gray-600 p-3 text-center text-red-400">✗</td>
                    <td className="border border-gray-600 p-3 text-center text-red-400">✗</td>
                  </tr>
                  <tr className="bg-gray-800/50">
                    <td className="border border-gray-600 p-3 text-gray-300">Live Location Sharing</td>
                    <td className="border border-gray-600 p-3 text-center text-green-400 font-bold">✓</td>
                    <td className="border border-gray-600 p-3 text-center text-red-400">✗</td>
                    <td className="border border-gray-600 p-3 text-center text-red-400">✗</td>
                    <td className="border border-gray-600 p-3 text-center text-red-400">✗</td>
                  </tr>
                  <tr className="bg-gray-800/30">
                    <td className="border border-gray-600 p-3 text-gray-300">Payment Protection</td>
                    <td className="border border-gray-600 p-3 text-center text-green-400 font-bold">✓</td>
                    <td className="border border-gray-600 p-3 text-center text-green-400">✓</td>
                    <td className="border border-gray-600 p-3 text-center text-yellow-400">Partial</td>
                    <td className="border border-gray-600 p-3 text-center text-green-400">✓</td>
                  </tr>
                  <tr className="bg-gray-800/50">
                    <td className="border border-gray-600 p-3 text-gray-300">UK/Europe Focus</td>
                    <td className="border border-gray-600 p-3 text-center text-green-400 font-bold">✓</td>
                    <td className="border border-gray-600 p-3 text-center text-yellow-400">Limited</td>
                    <td className="border border-gray-600 p-3 text-center text-red-400">✗</td>
                    <td className="border border-gray-600 p-3 text-center text-green-400">✓</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Pros and Cons */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-violet-400 mb-4 pb-2 border-b border-gray-700">
              Competitive Pros & Cons
            </h2>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Our Advantages */}
              <div className="bg-green-900/20 p-4 rounded-lg border border-green-500/30">
                <h3 className="font-bold text-green-400 mb-3 text-lg">Our Advantages</h3>
                <ul className="text-green-300 space-y-2 text-sm">
                  <li>✓ <strong className="text-green-200">Niche Focus:</strong> Travelers & tourists specifically</li>
                  <li>✓ <strong className="text-green-200">Quality Control:</strong> Portfolio verification with admin review</li>
                  <li>✓ <strong className="text-green-200">Editing Service:</strong> Built-in editing with revision support</li>
                  <li>✓ <strong className="text-green-200">Live Location:</strong> Easy meetups for travelers in new cities</li>
                  <li>✓ <strong className="text-green-200">Payment Hold:</strong> Funds released only after photo delivery</li>
                  <li>✓ <strong className="text-green-200">Lower Competition:</strong> UK/Europe market less saturated</li>
                  <li>✓ <strong className="text-green-200">Modern Tech:</strong> Mobile-first, real-time features</li>
                </ul>
              </div>
              
              {/* Challenges to Address */}
              <div className="bg-orange-900/20 p-4 rounded-lg border border-orange-500/30">
                <h3 className="font-bold text-orange-400 mb-3 text-lg">Challenges We're Addressing</h3>
                <ul className="text-orange-300 space-y-2 text-sm">
                  <li>⚠ <strong className="text-orange-200">Brand Recognition:</strong> Snappr has first-mover advantage</li>
                  <li>⚠ <strong className="text-orange-200">Supply Building:</strong> Need quality photographers to join</li>
                  <li>⚠ <strong className="text-orange-200">Two-Sided Market:</strong> Must balance supply & demand</li>
                  <li>⚠ <strong className="text-orange-200">Pricing Pressure:</strong> Competitors may undercut prices</li>
                  <li className="text-green-400">→ <em>Mitigation:</em> Focus on quality over quantity</li>
                  <li className="text-green-400">→ <em>Mitigation:</em> Better photographer compensation</li>
                  <li className="text-green-400">→ <em>Mitigation:</em> Niche positioning avoids price wars</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Why We'll Win */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-violet-400 mb-4 pb-2 border-b border-gray-700">
              Why SnapNow Will Succeed
            </h2>
            
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-violet-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-violet-400 font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Specialization Beats Generalization</h4>
                  <p className="text-gray-400 text-sm">Snappr does weddings, products, headshots, real estate - they're spread thin. We focus exclusively on travel photography and do it exceptionally well.</p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-violet-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-violet-400 font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Better Photographer Experience</h4>
                  <p className="text-gray-400 text-sm">Photographers frustrated with Snappr's low rates will prefer a platform that values quality. Higher rates = better photographers = better customer experience.</p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-violet-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-violet-400 font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Integrated Value Chain</h4>
                  <p className="text-gray-400 text-sm">Photo editing as a service creates additional revenue and differentiates us. Customers get polished, Instagram-ready photos without going elsewhere.</p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-violet-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-violet-400 font-bold">4</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Geographic Focus</h4>
                  <p className="text-gray-400 text-sm">Starting in UK/Europe where competition is lower, then expanding. Better to dominate one market than fight for scraps in a crowded one.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Revenue Model */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-violet-400 mb-4 pb-2 border-b border-gray-700">
              Revenue Model
            </h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-violet-900/30 p-4 rounded-lg border border-violet-500/30">
                <p className="text-3xl font-bold text-violet-400">20%</p>
                <p className="text-gray-400 text-sm">Commission on photography sessions</p>
              </div>
              <div className="bg-violet-900/30 p-4 rounded-lg border border-violet-500/30">
                <p className="text-3xl font-bold text-violet-400">20%</p>
                <p className="text-gray-400 text-sm">Commission on editing services</p>
              </div>
              <div className="bg-violet-900/30 p-4 rounded-lg border border-violet-500/30">
                <p className="text-3xl font-bold text-violet-400">10%</p>
                <p className="text-gray-400 text-sm">Customer service fee</p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="text-center pt-6 border-t border-gray-700">
            <p className="text-violet-400 font-bold text-lg">SnapNow</p>
            <p className="text-gray-500 text-sm">Capturing moments, wherever you travel.</p>
            <p className="text-gray-600 text-xs mt-2">Contact: hello@snapnow.app</p>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
