import { useRef } from "react";
import { Printer, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function BusinessCase() {
  const [, navigate] = useLocation();
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 p-4 flex items-center justify-between print:hidden">
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
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          data-testid="button-download-pdf"
        >
          <Printer className="w-4 h-4" />
          Print / Save PDF
        </button>
      </div>

      <div ref={contentRef} className="max-w-4xl mx-auto p-8 text-white bg-gray-900 print:bg-white print:text-gray-900">
        {/* Cover Page */}
        <div className="text-center py-12 mb-8 border-b-2 border-blue-500">
          <div className="mb-8 mx-auto max-w-sm">
            <img 
              src="/snapnow-banner.png" 
              alt="SnapNow Logo" 
              className="w-full h-auto rounded-2xl"
            />
          </div>
          <h1 className="text-4xl font-bold text-white print:text-gray-900 mb-4">Business Case</h1>
          <p className="text-lg text-blue-400 font-medium">Investor Presentation | 2025</p>
        </div>

        {/* Executive Summary */}
        <section className="mb-12" style={{ pageBreakInside: "avoid" }}>
          <h2 className="text-3xl font-bold text-white print:text-gray-900 mb-6 pb-2 border-b-2 border-blue-500">Executive Summary</h2>
          <p className="text-lg text-gray-300 print:text-gray-700 mb-6 leading-relaxed">
            SnapNow is a mobile-first marketplace connecting travelers with professional photographers at popular destinations worldwide. Built on a proven 20% commission model used by successful platforms like Uber and Airbnb, SnapNow captures a slice of the <strong className="text-blue-400 print:text-blue-600">$37.96 billion</strong> photography services market while addressing a clear gap: <strong className="text-blue-400 print:text-blue-600">78% of travelers struggle to find quality photographers abroad</strong>.
          </p>
          
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-gray-800/80 print:bg-blue-50 rounded-xl p-4 text-center border border-gray-700 print:border-blue-100">
              <p className="text-3xl font-bold text-blue-400 print:text-blue-600">$37.96B</p>
              <p className="text-sm text-gray-400 print:text-gray-600">Global Photography Market (2025)</p>
            </div>
            <div className="bg-gray-800/80 print:bg-purple-50 rounded-xl p-4 text-center border border-gray-700 print:border-purple-100">
              <p className="text-3xl font-bold text-purple-400 print:text-purple-600">1.4B</p>
              <p className="text-sm text-gray-400 print:text-gray-600">Annual International Tourists</p>
            </div>
            <div className="bg-gray-800/80 print:bg-green-50 rounded-xl p-4 text-center border border-gray-700 print:border-green-100">
              <p className="text-3xl font-bold text-green-400 print:text-green-600">$10M</p>
              <p className="text-sm text-gray-400 print:text-gray-600">Shoott Revenue (Comparable)*</p>
            </div>
            <div className="bg-gray-800/80 print:bg-orange-50 rounded-xl p-4 text-center border border-gray-700 print:border-orange-100">
              <p className="text-3xl font-bold text-orange-400 print:text-orange-600">~27%</p>
              <p className="text-sm text-gray-400 print:text-gray-600">Effective Take Rate</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 italic">*Shoott scaled to $10M revenue with just $2.7M in funding</p>
        </section>

        {/* The Problem */}
        <section className="mb-12" style={{ pageBreakInside: "avoid" }}>
          <h2 className="text-3xl font-bold text-white print:text-gray-900 mb-6 pb-2 border-b-2 border-blue-500">The Problem</h2>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-red-900/30 print:bg-red-50 rounded-xl p-6 border border-red-800/50 print:border-red-100">
              <h3 className="font-bold text-lg text-red-400 print:text-red-800 mb-4">For Travelers</h3>
              <ul className="space-y-3 text-gray-300 print:text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 print:text-red-500 mt-1">•</span>
                  <span><strong className="text-white print:text-gray-900">$2.4 trillion</strong> spent on travel annually, yet 78% struggle to find photographers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 print:text-red-500 mt-1">•</span>
                  <span>Complex booking processes with language barriers and payment friction</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 print:text-red-500 mt-1">•</span>
                  <span>Inconsistent quality with no ratings, portfolios, or guarantees</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 print:text-red-500 mt-1">•</span>
                  <span>Traditional photographers charge £200-500/hour</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-orange-900/30 print:bg-orange-50 rounded-xl p-6 border border-orange-800/50 print:border-orange-100">
              <h3 className="font-bold text-lg text-orange-400 print:text-orange-800 mb-4">For Photographers</h3>
              <ul className="space-y-3 text-gray-300 print:text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 print:text-orange-500 mt-1">•</span>
                  <span>Inconsistent income with feast-or-famine booking cycles</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 print:text-orange-500 mt-1">•</span>
                  <span>High customer acquisition costs (marketing takes years)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 print:text-orange-500 mt-1">•</span>
                  <span>Payment collection challenges with international clients</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 print:text-orange-500 mt-1">•</span>
                  <span>Limited geographic reach - only serve local clients</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Market Opportunity */}
        <section className="mb-12" style={{ pageBreakInside: "avoid" }}>
          <h2 className="text-3xl font-bold text-white print:text-gray-900 mb-6 pb-2 border-b-2 border-blue-500">Market Opportunity</h2>
          
          <div className="bg-gray-800/80 print:bg-gray-50 rounded-xl p-6 mb-6 border border-gray-700 print:border-gray-200">
            <h3 className="font-bold text-lg text-white print:text-gray-900 mb-4">Global Photography Market Size</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-600 print:border-gray-300">
                  <th className="text-left py-2 text-gray-400 print:text-gray-600">Segment</th>
                  <th className="text-right py-2 text-gray-400 print:text-gray-600">2025 Value</th>
                  <th className="text-right py-2 text-gray-400 print:text-gray-600">Growth Rate</th>
                  <th className="text-right py-2 text-gray-400 print:text-gray-600">2035 Forecast</th>
                </tr>
              </thead>
              <tbody className="text-gray-300 print:text-gray-700">
                <tr className="border-b border-gray-700 print:border-gray-200">
                  <td className="py-2 font-medium text-white print:text-gray-900">Photography Services</td>
                  <td className="text-right text-blue-400 print:text-blue-600 font-bold">$37.96B</td>
                  <td className="text-right text-green-400 print:text-green-600">7.6% CAGR</td>
                  <td className="text-right">$93.1B</td>
                </tr>
                <tr className="border-b border-gray-700 print:border-gray-200">
                  <td className="py-2 font-medium text-white print:text-gray-900">Event/Portrait Photography</td>
                  <td className="text-right">$12.4B</td>
                  <td className="text-right text-green-400 print:text-green-600">6.2% CAGR</td>
                  <td className="text-right">$22.5B</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium text-white print:text-gray-900">Online Photography Platforms</td>
                  <td className="text-right">$4.2B</td>
                  <td className="text-right text-green-400 print:text-green-600 font-bold">7.12% CAGR</td>
                  <td className="text-right">$8.3B</td>
                </tr>
              </tbody>
            </table>
            <p className="text-xs text-gray-500 mt-3 italic">Source: Business Research Insights, Precedence Research 2025</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-900/30 print:bg-blue-50 rounded-xl p-5 border border-blue-800/50 print:border-blue-100">
              <h4 className="font-bold text-blue-400 print:text-blue-800 mb-3">Travel & Tourism Tailwinds</h4>
              <ul className="space-y-2 text-sm text-gray-300 print:text-gray-700">
                <li>• <strong className="text-white print:text-gray-900">1.4 billion</strong> international tourists in 2024</li>
                <li>• <strong className="text-white print:text-gray-900">$2.4 trillion</strong> tourism spending in 2025</li>
                <li>• <strong className="text-white print:text-gray-900">$270 billion</strong> tours & activities market</li>
                <li>• <strong className="text-white print:text-gray-900">44%</strong> plan to spend MORE on experiences</li>
              </ul>
            </div>
            <div className="bg-green-900/30 print:bg-green-50 rounded-xl p-5 border border-green-800/50 print:border-green-100">
              <h4 className="font-bold text-green-400 print:text-green-800 mb-3">Why Now?</h4>
              <ul className="space-y-2 text-sm text-gray-300 print:text-gray-700">
                <li>• Post-pandemic travel boom (99% of 2019 levels)</li>
                <li>• 2M+ photographers seeking flexible income</li>
                <li>• Mobile payments now ubiquitous</li>
                <li>• Social media driving photography demand</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Business Model */}
        <section className="mb-12" style={{ pageBreakInside: "avoid" }}>
          <h2 className="text-3xl font-bold text-white print:text-gray-900 mb-6 pb-2 border-b-2 border-blue-500">Business Model</h2>
          
          <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 print:from-blue-50 print:to-purple-50 rounded-xl p-8 mb-6 border border-blue-800/50 print:border-blue-100">
            <h3 className="font-bold text-xl text-center text-white print:text-gray-900 mb-6">Two-Sided Revenue Model</h3>
            <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto">
              <div className="bg-gray-800/80 print:bg-white rounded-xl p-4 border border-gray-700 print:border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 print:text-gray-700">Photographer's hourly rate</span>
                  <span className="font-bold text-white print:text-gray-900">£100</span>
                </div>
              </div>
              <div className="bg-orange-900/40 print:bg-orange-50 rounded-xl p-4 border border-orange-800/50 print:border-orange-200">
                <div className="flex justify-between items-center">
                  <span className="text-orange-300 print:text-orange-800">+ Customer Service Fee (10%)</span>
                  <span className="font-bold text-orange-400 print:text-orange-600">£10</span>
                </div>
              </div>
              <div className="bg-blue-900/40 print:bg-blue-50 rounded-xl p-4 border border-blue-800/50 print:border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-blue-300 print:text-blue-800 font-medium">Customer Pays Total</span>
                  <span className="font-bold text-blue-400 print:text-blue-600 text-xl">£110</span>
                </div>
              </div>
              <div className="border-t-2 border-gray-600 print:border-gray-300 my-2"></div>
              <div className="bg-green-900/40 print:bg-green-50 rounded-xl p-4 border border-green-800/50 print:border-green-200">
                <div className="flex justify-between items-center">
                  <span className="text-green-300 print:text-green-800">Photographer Receives (80%)</span>
                  <span className="font-bold text-green-400 print:text-green-600">£80</span>
                </div>
              </div>
              <div className="bg-purple-900/40 print:bg-purple-50 rounded-xl p-4 border border-purple-800/50 print:border-purple-200">
                <div className="flex justify-between items-center">
                  <span className="text-purple-300 print:text-purple-800">Photographer Commission (20%)</span>
                  <span className="font-bold text-purple-400 print:text-purple-600">£20</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 text-white">
                <div className="flex justify-between items-center">
                  <span className="font-medium">SnapNow Total Revenue</span>
                  <span className="font-bold text-2xl">£30</span>
                </div>
                <p className="text-xs opacity-80 mt-1">£10 service fee + £20 commission = 27% effective take rate</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/80 print:bg-gray-50 rounded-xl p-6 mb-6 border border-gray-700 print:border-gray-200">
            <h4 className="font-bold text-white print:text-gray-900 mb-4">Competitive Take Rate Comparison</h4>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-400 print:text-gray-700">12-15%</p>
                <p className="text-xs text-gray-500">Airbnb</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-400 print:text-gray-700">20-25%</p>
                <p className="text-xs text-gray-500">Uber</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-400 print:text-gray-700">15-20%</p>
                <p className="text-xs text-gray-500">Etsy</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-400 print:text-blue-600">~27%</p>
                <p className="text-xs text-gray-500">SnapNow</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/80 print:bg-white rounded-xl p-6 border border-gray-700 print:border-gray-200">
            <h4 className="font-bold text-white print:text-gray-900 mb-4">Revenue Streams</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-600 print:border-gray-300">
                  <th className="text-left py-2 text-gray-400 print:text-gray-600">Stream</th>
                  <th className="text-right py-2 text-gray-400 print:text-gray-600">Year 1</th>
                  <th className="text-right py-2 text-gray-400 print:text-gray-600">Year 2</th>
                  <th className="text-right py-2 text-gray-400 print:text-gray-600">Year 3</th>
                </tr>
              </thead>
              <tbody className="text-gray-300 print:text-gray-700">
                <tr className="border-b border-gray-700 print:border-gray-200">
                  <td className="py-2 text-white print:text-gray-900">Customer Service Fees (10%)</td>
                  <td className="text-right">£15K</td>
                  <td className="text-right">£85K</td>
                  <td className="text-right">£333K</td>
                </tr>
                <tr className="border-b border-gray-700 print:border-gray-200">
                  <td className="py-2 text-white print:text-gray-900">Photographer Commission (20%)</td>
                  <td className="text-right">£30K</td>
                  <td className="text-right">£170K</td>
                  <td className="text-right">£665K</td>
                </tr>
                <tr className="border-b border-gray-700 print:border-gray-200">
                  <td className="py-2 text-white print:text-gray-900">Premium Photographer Features</td>
                  <td className="text-right text-gray-500">-</td>
                  <td className="text-right">£15K</td>
                  <td className="text-right">£50K</td>
                </tr>
                <tr className="border-b border-gray-700 print:border-gray-200">
                  <td className="py-2 text-white print:text-gray-900">Sponsored Destinations</td>
                  <td className="text-right text-gray-500">-</td>
                  <td className="text-right">£10K</td>
                  <td className="text-right">£40K</td>
                </tr>
                <tr className="border-b border-gray-700 print:border-gray-200">
                  <td className="py-2 text-white print:text-gray-900">Travel Partnerships</td>
                  <td className="text-right text-gray-500">-</td>
                  <td className="text-right">£5K</td>
                  <td className="text-right">£30K</td>
                </tr>
                <tr className="font-bold bg-blue-900/40 print:bg-blue-50">
                  <td className="py-2 text-white print:text-gray-900">Total Platform Revenue</td>
                  <td className="text-right text-blue-400 print:text-blue-600">£45K</td>
                  <td className="text-right text-blue-400 print:text-blue-600">£285K</td>
                  <td className="text-right text-blue-400 print:text-blue-600">£1.1M</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Competitive Landscape */}
        <section className="mb-12" style={{ pageBreakInside: "avoid" }}>
          <h2 className="text-3xl font-bold text-white print:text-gray-900 mb-6 pb-2 border-b-2 border-blue-500">Competitive Landscape</h2>
          
          <div className="bg-gray-800/80 print:bg-gray-50 rounded-xl p-6 mb-6 border border-gray-700 print:border-gray-200">
            <h3 className="font-bold text-lg text-white print:text-gray-900 mb-4">Direct Competitors</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-600 print:border-gray-300">
                  <th className="text-left py-2 text-gray-400 print:text-gray-600">Company</th>
                  <th className="text-right py-2 text-gray-400 print:text-gray-600">Funding</th>
                  <th className="text-right py-2 text-gray-400 print:text-gray-600">Revenue</th>
                  <th className="text-left py-2 pl-4 text-gray-400 print:text-gray-600">Our Advantage</th>
                </tr>
              </thead>
              <tbody className="text-gray-300 print:text-gray-700">
                <tr className="border-b border-gray-700 print:border-gray-200">
                  <td className="py-3 font-medium text-white print:text-gray-900">Flytographer</td>
                  <td className="text-right">$1.7M</td>
                  <td className="text-right">~$3.5M</td>
                  <td className="text-left pl-4 text-sm">Lower prices, mobile-first</td>
                </tr>
                <tr className="border-b border-gray-700 print:border-gray-200 bg-yellow-900/20 print:bg-yellow-50">
                  <td className="py-3 font-medium text-white print:text-gray-900">Shoott</td>
                  <td className="text-right font-bold">$2.7M</td>
                  <td className="text-right font-bold text-green-400 print:text-green-600">$10M</td>
                  <td className="text-left pl-4 text-sm">Travel-focused, global ambition</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium text-white print:text-gray-900">Snappr</td>
                  <td className="text-right">$20M+</td>
                  <td className="text-right">~$15M</td>
                  <td className="text-left pl-4 text-sm">Consumer & travel focus</td>
                </tr>
              </tbody>
            </table>
            <div className="mt-4 p-3 bg-green-900/30 print:bg-green-100 rounded-lg border border-green-800/50 print:border-green-200">
              <p className="text-sm text-green-300 print:text-green-800"><strong>Key Insight:</strong> Shoott proved you can scale to $10M with just $2.7M funding. Our model is equally capital-efficient.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-900/30 print:bg-blue-50 rounded-xl p-5 border border-blue-800/50 print:border-blue-100">
              <h4 className="font-bold text-blue-400 print:text-blue-800 mb-3">Our Competitive Moat</h4>
              <ul className="space-y-2 text-sm text-gray-300 print:text-gray-700">
                <li><strong className="text-white print:text-gray-900">1. Network Effects:</strong> More photographers → better coverage → more customers</li>
                <li><strong className="text-white print:text-gray-900">2. Location Data:</strong> Curated photo spots create unique content moat</li>
                <li><strong className="text-white print:text-gray-900">3. Trust System:</strong> Two-sided ratings build quality</li>
                <li><strong className="text-white print:text-gray-900">4. Mobile-First:</strong> Built for on-the-go travelers</li>
              </ul>
            </div>
            <div className="bg-purple-900/30 print:bg-purple-50 rounded-xl p-5 border border-purple-800/50 print:border-purple-100">
              <h4 className="font-bold text-purple-400 print:text-purple-800 mb-3">Lessons from Uber & Airbnb</h4>
              <ul className="space-y-2 text-sm text-gray-300 print:text-gray-700">
                <li>• Supply-first strategy (photographers before marketing)</li>
                <li>• Strategic market entry (London: 21M tourists/year)</li>
                <li>• Global network effects (like Airbnb, not Uber)</li>
                <li>• Low marginal costs = high scalability</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Go-to-Market Strategy */}
        <section className="mb-12" style={{ pageBreakInside: "avoid" }}>
          <h2 className="text-3xl font-bold text-white print:text-gray-900 mb-6 pb-2 border-b-2 border-blue-500">Go-to-Market Strategy</h2>
          
          <div className="space-y-4">
            <div className="bg-blue-900/30 print:bg-blue-50 rounded-xl p-5 border-l-4 border-blue-500">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-blue-400 print:text-blue-800">Phase 1: London MVP</h4>
                <span className="text-sm bg-blue-800/50 print:bg-blue-200 text-blue-300 print:text-blue-800 px-2 py-1 rounded">Q1 2026</span>
              </div>
              <ul className="text-sm text-gray-300 print:text-gray-700 space-y-1">
                <li>• 50 vetted photographers covering key tourist areas</li>
                <li>• Focus: Tower Bridge, Big Ben, Notting Hill, South Bank</li>
                <li>• Target: <strong className="text-white print:text-gray-900">500 bookings</strong> in first quarter</li>
                <li>• Marketing: Instagram influencers, hotel concierge partnerships</li>
              </ul>
            </div>

            <div className="bg-purple-900/30 print:bg-purple-50 rounded-xl p-5 border-l-4 border-purple-500">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-purple-400 print:text-purple-800">Phase 2: European Expansion</h4>
                <span className="text-sm bg-purple-800/50 print:bg-purple-200 text-purple-300 print:text-purple-800 px-2 py-1 rounded">Q2-Q3 2026</span>
              </div>
              <ul className="text-sm text-gray-300 print:text-gray-700 space-y-1">
                <li>• Expand to Barcelona, Paris, Rome</li>
                <li>• 150 photographers across 4 cities</li>
                <li>• Target: <strong className="text-white print:text-gray-900">3,000 bookings</strong> by Q3</li>
                <li>• Partnerships with travel agencies, Airbnb Experiences</li>
              </ul>
            </div>

            <div className="bg-green-900/30 print:bg-green-50 rounded-xl p-5 border-l-4 border-green-500">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-green-400 print:text-green-800">Phase 3: Global Scale</h4>
                <span className="text-sm bg-green-800/50 print:bg-green-200 text-green-300 print:text-green-800 px-2 py-1 rounded">Q4 2026+</span>
              </div>
              <ul className="text-sm text-gray-300 print:text-gray-700 space-y-1">
                <li>• Tokyo, NYC, Dubai, Sydney</li>
                <li>• 500+ photographers worldwide</li>
                <li>• Premium features launch</li>
                <li>• Target: <strong className="text-white print:text-gray-900">10,000 bookings/year</strong> by end of Year 2</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Financial Projections */}
        <section className="mb-12" style={{ pageBreakInside: "avoid" }}>
          <h2 className="text-3xl font-bold text-white print:text-gray-900 mb-6 pb-2 border-b-2 border-blue-500">Financial Projections</h2>
          
          <div className="bg-gray-800/80 print:bg-gray-50 rounded-xl p-6 mb-6 border border-gray-700 print:border-gray-200">
            <h3 className="font-bold text-lg text-white print:text-gray-900 mb-4">3-Year Financial Model</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-600 print:border-gray-300">
                  <th className="text-left py-2 text-gray-400 print:text-gray-600">Metric</th>
                  <th className="text-right py-2 text-gray-400 print:text-gray-600">Year 1</th>
                  <th className="text-right py-2 text-gray-400 print:text-gray-600">Year 2</th>
                  <th className="text-right py-2 text-gray-400 print:text-gray-600">Year 3</th>
                </tr>
              </thead>
              <tbody className="text-gray-300 print:text-gray-700">
                <tr className="border-b border-gray-700 print:border-gray-200">
                  <td className="py-2 text-white print:text-gray-900">Bookings</td>
                  <td className="text-right">2,000</td>
                  <td className="text-right">10,000</td>
                  <td className="text-right">35,000</td>
                </tr>
                <tr className="border-b border-gray-700 print:border-gray-200">
                  <td className="py-2 text-white print:text-gray-900">Avg Booking Value</td>
                  <td className="text-right">£75</td>
                  <td className="text-right">£85</td>
                  <td className="text-right">£95</td>
                </tr>
                <tr className="border-b border-gray-700 print:border-gray-200 bg-blue-900/30 print:bg-blue-50">
                  <td className="py-2 font-medium text-white print:text-gray-900">GMV (Gross Merchandise Value)</td>
                  <td className="text-right font-medium">£150,000</td>
                  <td className="text-right font-medium">£850,000</td>
                  <td className="text-right font-medium">£3,325,000</td>
                </tr>
                <tr className="border-b border-gray-700 print:border-gray-200">
                  <td className="py-2 text-white print:text-gray-900">Platform Revenue (~27%)</td>
                  <td className="text-right text-blue-400 print:text-blue-600 font-bold">£45,000</td>
                  <td className="text-right text-blue-400 print:text-blue-600 font-bold">£285,000</td>
                  <td className="text-right text-blue-400 print:text-blue-600 font-bold">£1,118,000</td>
                </tr>
                <tr className="border-b border-gray-700 print:border-gray-200">
                  <td className="py-2 text-white print:text-gray-900">Operating Expenses</td>
                  <td className="text-right text-red-400 print:text-red-600">-£120,000</td>
                  <td className="text-right text-red-400 print:text-red-600">-£250,000</td>
                  <td className="text-right text-red-400 print:text-red-600">-£500,000</td>
                </tr>
                <tr className="bg-gradient-to-r from-green-900/30 to-blue-900/30 print:from-green-50 print:to-blue-50">
                  <td className="py-2 font-bold text-white print:text-gray-900">Net Profit/Loss</td>
                  <td className="text-right text-red-400 print:text-red-600 font-bold">-£75,000</td>
                  <td className="text-right text-green-400 print:text-green-600 font-bold">+£35,000</td>
                  <td className="text-right text-green-400 print:text-green-600 font-bold">+£618,000</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-800/80 print:bg-gray-50 rounded-xl p-5 border border-gray-700 print:border-gray-200">
              <h4 className="font-bold text-white print:text-gray-900 mb-3">Year 1 Expenses Breakdown</h4>
              <ul className="space-y-2 text-sm text-gray-300 print:text-gray-700">
                <li className="flex justify-between">
                  <span>Engineering & Product</span>
                  <span className="text-white print:text-gray-900">£50,000</span>
                </li>
                <li className="flex justify-between">
                  <span>Marketing & Growth</span>
                  <span className="text-white print:text-gray-900">£35,000</span>
                </li>
                <li className="flex justify-between">
                  <span>Operations & Support</span>
                  <span className="text-white print:text-gray-900">£20,000</span>
                </li>
                <li className="flex justify-between">
                  <span>Legal & Compliance</span>
                  <span className="text-white print:text-gray-900">£10,000</span>
                </li>
                <li className="flex justify-between">
                  <span>Infrastructure</span>
                  <span className="text-white print:text-gray-900">£5,000</span>
                </li>
                <li className="flex justify-between border-t border-gray-600 print:border-gray-300 pt-2 font-bold">
                  <span className="text-white print:text-gray-900">Total</span>
                  <span className="text-white print:text-gray-900">£120,000</span>
                </li>
              </ul>
            </div>
            <div className="bg-gray-800/80 print:bg-gray-50 rounded-xl p-5 border border-gray-700 print:border-gray-200">
              <h4 className="font-bold text-white print:text-gray-900 mb-3">Key Milestones</h4>
              <ul className="space-y-3 text-sm text-gray-300 print:text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 print:text-green-600">✓</span>
                  <span><strong className="text-white print:text-gray-900">Month 6:</strong> Break-even CAC/LTV</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 print:text-green-600">✓</span>
                  <span><strong className="text-white print:text-gray-900">Month 12:</strong> 2,000 bookings, 4 cities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 print:text-green-600">✓</span>
                  <span><strong className="text-white print:text-gray-900">Month 18:</strong> Profitability achieved</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 print:text-green-600">✓</span>
                  <span><strong className="text-white print:text-gray-900">Month 36:</strong> £1.1M revenue, 55% margin</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 print:from-blue-50 print:to-purple-50 rounded-xl p-6 border border-blue-800/50 print:border-blue-100">
            <h4 className="font-bold text-white print:text-gray-900 mb-4 text-center">Unit Economics</h4>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center bg-gray-800/80 print:bg-white rounded-lg p-3 border border-gray-700 print:border-gray-200">
                <p className="text-2xl font-bold text-blue-400 print:text-blue-600">£15-25</p>
                <p className="text-sm text-gray-400 print:text-gray-600">CAC</p>
              </div>
              <div className="text-center bg-gray-800/80 print:bg-white rounded-lg p-3 border border-gray-700 print:border-gray-200">
                <p className="text-2xl font-bold text-green-400 print:text-green-600">4-6x</p>
                <p className="text-sm text-gray-400 print:text-gray-600">LTV/CAC Ratio</p>
              </div>
              <div className="text-center bg-gray-800/80 print:bg-white rounded-lg p-3 border border-gray-700 print:border-gray-200">
                <p className="text-2xl font-bold text-blue-400 print:text-blue-600">~27%</p>
                <p className="text-sm text-gray-400 print:text-gray-600">Effective Take Rate</p>
              </div>
              <div className="text-center bg-gray-800/80 print:bg-white rounded-lg p-3 border border-gray-700 print:border-gray-200">
                <p className="text-2xl font-bold text-white print:text-gray-900">70%+</p>
                <p className="text-sm text-gray-400 print:text-gray-600">Contribution Margin</p>
              </div>
            </div>
          </div>
        </section>

        {/* The Ask */}
        <section className="mb-12" style={{ pageBreakInside: "avoid" }}>
          <h2 className="text-3xl font-bold text-white print:text-gray-900 mb-6 pb-2 border-b-2 border-blue-500">Investment Opportunity</h2>
          
          <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 print:from-blue-50 print:to-purple-50 rounded-xl p-8 border border-blue-800/50 print:border-blue-100 text-center mb-6">
            <h3 className="text-4xl font-bold text-blue-400 print:text-blue-600 mb-2">£150,000</h3>
            <p className="text-xl text-gray-300 print:text-gray-700">Pre-Seed Round</p>
            <p className="text-sm text-gray-400 print:text-gray-500 mt-2">18-month runway to profitability</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-800/80 print:bg-gray-50 rounded-xl p-6 border border-gray-700 print:border-gray-200">
              <h4 className="font-bold text-white print:text-gray-900 mb-4">Use of Funds</h4>
              <ul className="space-y-3 text-gray-300 print:text-gray-700">
                <li className="flex justify-between">
                  <span>Product Development</span>
                  <span className="font-medium text-white print:text-gray-900">40%</span>
                </li>
                <li className="flex justify-between">
                  <span>Marketing & Growth</span>
                  <span className="font-medium text-white print:text-gray-900">30%</span>
                </li>
                <li className="flex justify-between">
                  <span>Operations</span>
                  <span className="font-medium text-white print:text-gray-900">20%</span>
                </li>
                <li className="flex justify-between">
                  <span>Reserve</span>
                  <span className="font-medium text-white print:text-gray-900">10%</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-800/80 print:bg-gray-50 rounded-xl p-6 border border-gray-700 print:border-gray-200">
              <h4 className="font-bold text-white print:text-gray-900 mb-4">What You Get</h4>
              <ul className="space-y-3 text-gray-300 print:text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 print:text-green-600">✓</span>
                  <span>Capital-efficient path to £1M+ revenue</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 print:text-green-600">✓</span>
                  <span>Proven marketplace model (Shoott validation)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 print:text-green-600">✓</span>
                  <span>$37.96B TAM with strong tailwinds</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 print:text-green-600">✓</span>
                  <span>Experienced founding team</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="text-center py-8 border-t-2 border-blue-500">
          <div className="mb-6 mx-auto w-24">
            <img 
              src="/snapnow-logo.png" 
              alt="SnapNow" 
              className="w-full h-auto rounded-xl"
            />
          </div>
          <h3 className="text-2xl font-bold text-white print:text-gray-900 mb-2">Let's Connect</h3>
          <p className="text-gray-400 print:text-gray-600">Ready to discuss how SnapNow can capture the travel photography market</p>
          <div className="mt-6 flex justify-center gap-8 text-gray-300 print:text-gray-700">
            <div>
              <p className="text-sm text-gray-500 print:text-gray-500">Email</p>
              <p className="font-medium text-white print:text-gray-900">investors@snapnow.app</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 print:text-gray-500">Website</p>
              <p className="font-medium text-white print:text-gray-900">snapnow.app</p>
            </div>
          </div>
        </section>

        {/* Data Sources Footer */}
        <section className="mt-8 pt-6 border-t border-gray-700 print:border-gray-300">
          <h4 className="font-bold text-sm text-gray-400 print:text-gray-600 mb-3">Data Sources & Notes</h4>
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Market size data: Business Research Insights, Precedence Research (2025)</p>
            <p>• Tourism statistics: UNWTO, Mastercard Economics Institute (2024-2025)</p>
            <p>• Competitor data: Crunchbase, PitchBook, Thunder VC podcast, GrowJo</p>
            <p>• Financial projections are estimates based on market analysis and comparable company performance</p>
            <p>• Take rate comparisons from public company filings and Harvard Business School case studies</p>
          </div>
        </section>
      </div>
    </div>
  );
}
