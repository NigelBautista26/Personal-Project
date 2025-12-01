import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import html2pdf from "html2pdf.js";

export default function InvestorPitch() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const generatePDF = async () => {
    if (!contentRef.current) return;
    setGenerating(true);
    
    const opt = {
      margin: [10, 10, 10, 10] as [number, number, number, number],
      filename: 'SnapNow_Investor_Pitch.pdf',
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    try {
      await html2pdf().set(opt).from(contentRef.current).save();
    } catch (error) {
      console.error('PDF generation error:', error);
    }
    setGenerating(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Link href="/">
            <Button variant="ghost" className="text-muted-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to App
            </Button>
          </Link>
          <Button 
            onClick={generatePDF} 
            disabled={generating}
            className="bg-primary hover:bg-primary/90"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </>
            )}
          </Button>
        </div>

        <div 
          ref={contentRef} 
          className="bg-white text-black p-8 rounded-lg shadow-xl"
          style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
        >
          {/* Header */}
          <div className="text-center mb-8 pb-6 border-b-2 border-violet-500">
            <h1 className="text-4xl font-bold text-violet-600 mb-2">SnapNow</h1>
            <p className="text-xl text-gray-600">Uber for Photography</p>
            <p className="text-sm text-gray-500 mt-2">Investor Pitch Deck - December 2025</p>
          </div>

          {/* Executive Summary */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-violet-600 mb-4 pb-2 border-b border-gray-200">
              Executive Summary
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              SnapNow is a photography marketplace that connects travelers with professional photographers 
              for on-demand photo sessions. Think of it as "Uber for Photography" - but with a specific 
              focus on the travel and tourism market.
            </p>
            <p className="text-gray-700 leading-relaxed">
              While there are existing players in this space, SnapNow differentiates itself through 
              <strong> quality verification</strong>, <strong>integrated editing services</strong>, and 
              a <strong>traveler-first approach</strong> that existing competitors lack.
            </p>
          </section>

          {/* Market Validation */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-violet-600 mb-4 pb-2 border-b border-gray-200">
              Market Validation
            </h2>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
              <p className="text-green-800 font-medium">
                ✓ Competition validates the market - investors should be MORE confident, not less!
              </p>
            </div>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Snappr</strong> raised $13M+ in funding, proving investor appetite</li>
              <li>50% of marketplace customers say they wouldn't have hired a photographer otherwise - we're creating NEW demand</li>
              <li>Travel photography is a $10B+ market growing at 8% annually</li>
              <li>Instagram culture has created unprecedented demand for quality travel photos</li>
            </ul>
          </section>

          {/* Competitive Analysis */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-violet-600 mb-4 pb-2 border-b border-gray-200">
              Competitive Analysis
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm mb-6">
                <thead>
                  <tr className="bg-violet-100">
                    <th className="border border-gray-300 p-3 text-left font-bold text-violet-700">Feature</th>
                    <th className="border border-gray-300 p-3 text-center font-bold text-violet-700">SnapNow</th>
                    <th className="border border-gray-300 p-3 text-center font-bold text-gray-600">Snappr</th>
                    <th className="border border-gray-300 p-3 text-center font-bold text-gray-600">Zazzi</th>
                    <th className="border border-gray-300 p-3 text-center font-bold text-gray-600">Perfocal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-3">Travel/Tourist Focus</td>
                    <td className="border border-gray-300 p-3 text-center text-green-600 font-bold">✓</td>
                    <td className="border border-gray-300 p-3 text-center text-red-500">✗</td>
                    <td className="border border-gray-300 p-3 text-center text-red-500">✗</td>
                    <td className="border border-gray-300 p-3 text-center text-red-500">✗</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 p-3">Portfolio Verification</td>
                    <td className="border border-gray-300 p-3 text-center text-green-600 font-bold">✓</td>
                    <td className="border border-gray-300 p-3 text-center text-yellow-600">Partial</td>
                    <td className="border border-gray-300 p-3 text-center text-red-500">✗</td>
                    <td className="border border-gray-300 p-3 text-center text-yellow-600">Partial</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3">Built-in Editing Service</td>
                    <td className="border border-gray-300 p-3 text-center text-green-600 font-bold">✓</td>
                    <td className="border border-gray-300 p-3 text-center text-red-500">✗</td>
                    <td className="border border-gray-300 p-3 text-center text-red-500">✗</td>
                    <td className="border border-gray-300 p-3 text-center text-red-500">✗</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 p-3">Unlimited Edit Revisions</td>
                    <td className="border border-gray-300 p-3 text-center text-green-600 font-bold">✓</td>
                    <td className="border border-gray-300 p-3 text-center text-red-500">✗</td>
                    <td className="border border-gray-300 p-3 text-center text-red-500">✗</td>
                    <td className="border border-gray-300 p-3 text-center text-red-500">✗</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3">Live Location Sharing</td>
                    <td className="border border-gray-300 p-3 text-center text-green-600 font-bold">✓</td>
                    <td className="border border-gray-300 p-3 text-center text-red-500">✗</td>
                    <td className="border border-gray-300 p-3 text-center text-red-500">✗</td>
                    <td className="border border-gray-300 p-3 text-center text-red-500">✗</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 p-3">Payment Protection</td>
                    <td className="border border-gray-300 p-3 text-center text-green-600 font-bold">✓</td>
                    <td className="border border-gray-300 p-3 text-center text-green-600">✓</td>
                    <td className="border border-gray-300 p-3 text-center text-yellow-600">Partial</td>
                    <td className="border border-gray-300 p-3 text-center text-green-600">✓</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3">UK/Europe Focus</td>
                    <td className="border border-gray-300 p-3 text-center text-green-600 font-bold">✓</td>
                    <td className="border border-gray-300 p-3 text-center text-yellow-600">Limited</td>
                    <td className="border border-gray-300 p-3 text-center text-red-500">✗</td>
                    <td className="border border-gray-300 p-3 text-center text-green-600">✓</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Pros and Cons */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-violet-600 mb-4 pb-2 border-b border-gray-200">
              Competitive Pros & Cons
            </h2>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Our Advantages */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-bold text-green-700 mb-3 text-lg">Our Advantages</h3>
                <ul className="text-green-800 space-y-2 text-sm">
                  <li>✓ <strong>Niche Focus:</strong> Travelers & tourists specifically</li>
                  <li>✓ <strong>Quality Control:</strong> Portfolio verification with admin review</li>
                  <li>✓ <strong>Editing Service:</strong> Built-in editing with revision support</li>
                  <li>✓ <strong>Live Location:</strong> Easy meetups for travelers in new cities</li>
                  <li>✓ <strong>Payment Hold:</strong> Funds released only after photo delivery</li>
                  <li>✓ <strong>Lower Competition:</strong> UK/Europe market less saturated</li>
                  <li>✓ <strong>Modern Tech:</strong> Mobile-first, real-time features</li>
                </ul>
              </div>
              
              {/* Challenges to Address */}
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h3 className="font-bold text-orange-700 mb-3 text-lg">Challenges We're Addressing</h3>
                <ul className="text-orange-800 space-y-2 text-sm">
                  <li>⚠ <strong>Brand Recognition:</strong> Snappr has first-mover advantage</li>
                  <li>⚠ <strong>Supply Building:</strong> Need quality photographers to join</li>
                  <li>⚠ <strong>Two-Sided Market:</strong> Must balance supply & demand</li>
                  <li>⚠ <strong>Pricing Pressure:</strong> Competitors may undercut prices</li>
                  <li className="text-green-700">→ <em>Mitigation:</em> Focus on quality over quantity</li>
                  <li className="text-green-700">→ <em>Mitigation:</em> Better photographer compensation</li>
                  <li className="text-green-700">→ <em>Mitigation:</em> Niche positioning avoids price wars</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Why We'll Win */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-violet-600 mb-4 pb-2 border-b border-gray-200">
              Why SnapNow Will Succeed
            </h2>
            
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-violet-600 font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Specialization Beats Generalization</h4>
                  <p className="text-gray-600 text-sm">Snappr does weddings, products, headshots, real estate - they're spread thin. We focus exclusively on travel photography and do it exceptionally well.</p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-violet-600 font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Better Photographer Experience</h4>
                  <p className="text-gray-600 text-sm">Photographers frustrated with Snappr's low rates will prefer a platform that values quality. Higher rates = better photographers = better customer experience.</p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-violet-600 font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Integrated Value Chain</h4>
                  <p className="text-gray-600 text-sm">Photo editing as a service creates additional revenue and differentiates us. Customers get polished, Instagram-ready photos without going elsewhere.</p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-violet-600 font-bold">4</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Geographic Focus</h4>
                  <p className="text-gray-600 text-sm">Starting in UK/Europe where competition is lower, then expanding. Better to dominate one market than fight for scraps in a crowded one.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Revenue Model */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-violet-600 mb-4 pb-2 border-b border-gray-200">
              Revenue Model
            </h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-violet-50 p-4 rounded-lg">
                <p className="text-3xl font-bold text-violet-600">20%</p>
                <p className="text-gray-600 text-sm">Commission on photography sessions</p>
              </div>
              <div className="bg-violet-50 p-4 rounded-lg">
                <p className="text-3xl font-bold text-violet-600">20%</p>
                <p className="text-gray-600 text-sm">Commission on editing services</p>
              </div>
              <div className="bg-violet-50 p-4 rounded-lg">
                <p className="text-3xl font-bold text-violet-600">10%</p>
                <p className="text-gray-600 text-sm">Customer service fee</p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="text-center pt-6 border-t border-gray-200">
            <p className="text-violet-600 font-bold text-lg">SnapNow</p>
            <p className="text-gray-500 text-sm">Capturing moments, wherever you travel.</p>
            <p className="text-gray-400 text-xs mt-2">Contact: hello@snapnow.app</p>
          </div>
        </div>
      </div>
    </div>
  );
}
