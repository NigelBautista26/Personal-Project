import { useRef } from "react";
import { Download, ArrowLeft, Printer } from "lucide-react";
import { useLocation } from "wouter";

export default function BusinessCase() {
  const [, navigate] = useLocation();
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 p-4 flex items-center justify-between print:hidden">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
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

      <div ref={contentRef} className="max-w-4xl mx-auto p-8 text-gray-900 bg-white">
        {/* Cover Page */}
        <div className="text-center py-16 mb-8 border-b-4 border-blue-600">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
            <span className="text-white text-3xl font-bold">S</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">SnapNow</h1>
          <p className="text-2xl text-gray-600 mb-2">Business Case</p>
          <p className="text-lg text-blue-600 font-medium">On-Demand Photography at Your Fingertips</p>
          <p className="text-sm text-gray-500 mt-8">Investor Presentation | 2025</p>
        </div>

        {/* Executive Summary */}
        <section className="mb-12" style={{ pageBreakInside: "avoid" }}>
          <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-blue-600">Executive Summary</h2>
          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            SnapNow is a mobile-first marketplace connecting travelers with professional photographers at popular destinations worldwide. Built on a proven 20% commission model used by successful platforms like Uber and Airbnb, SnapNow captures a slice of the <strong>$37.96 billion</strong> photography services market while addressing a clear gap: <strong>78% of travelers struggle to find quality photographers abroad</strong>.
          </p>
          
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
              <p className="text-3xl font-bold text-blue-600">$37.96B</p>
              <p className="text-sm text-gray-600">Global Photography Market (2025)</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-100">
              <p className="text-3xl font-bold text-purple-600">1.4B</p>
              <p className="text-sm text-gray-600">Annual International Tourists</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
              <p className="text-3xl font-bold text-green-600">$10M</p>
              <p className="text-sm text-gray-600">Shoott Revenue (Comparable)*</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 text-center border border-orange-100">
              <p className="text-3xl font-bold text-orange-600">20%</p>
              <p className="text-sm text-gray-600">Commission Model</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 italic">*Shoott scaled to $10M revenue with just $2.7M in funding</p>
        </section>

        {/* The Problem */}
        <section className="mb-12" style={{ pageBreakInside: "avoid" }}>
          <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-blue-600">The Problem</h2>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-red-50 rounded-xl p-6 border border-red-100">
              <h3 className="font-bold text-lg text-red-800 mb-4">For Travelers</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span><strong>$2.4 trillion</strong> spent on travel annually, yet 78% struggle to find photographers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Complex booking processes with language barriers and payment friction</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Inconsistent quality with no ratings, portfolios, or guarantees</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Traditional photographers charge £200-500/hour</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-orange-50 rounded-xl p-6 border border-orange-100">
              <h3 className="font-bold text-lg text-orange-800 mb-4">For Photographers</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Inconsistent income with feast-or-famine booking cycles</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>High customer acquisition costs (marketing takes years)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Payment collection challenges with international clients</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Limited geographic reach - only serve local clients</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Market Opportunity */}
        <section className="mb-12" style={{ pageBreakInside: "avoid" }}>
          <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-blue-600">Market Opportunity</h2>
          
          <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
            <h3 className="font-bold text-lg text-gray-900 mb-4">Global Photography Market Size</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-2 text-gray-600">Segment</th>
                  <th className="text-right py-2 text-gray-600">2025 Value</th>
                  <th className="text-right py-2 text-gray-600">Growth Rate</th>
                  <th className="text-right py-2 text-gray-600">2035 Forecast</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-2 font-medium">Photography Services</td>
                  <td className="text-right text-blue-600 font-bold">$37.96B</td>
                  <td className="text-right text-green-600">7.6% CAGR</td>
                  <td className="text-right">$93.1B</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-2 font-medium">Event/Portrait Photography</td>
                  <td className="text-right">$12.4B</td>
                  <td className="text-right text-green-600">6.2% CAGR</td>
                  <td className="text-right">$22.5B</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">Online Photography Platforms</td>
                  <td className="text-right">$4.2B</td>
                  <td className="text-right text-green-600 font-bold">7.12% CAGR</td>
                  <td className="text-right">$8.3B</td>
                </tr>
              </tbody>
            </table>
            <p className="text-xs text-gray-500 mt-3 italic">Source: Business Research Insights, Precedence Research 2025</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
              <h4 className="font-bold text-blue-800 mb-3">Travel & Tourism Tailwinds</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• <strong>1.4 billion</strong> international tourists in 2024</li>
                <li>• <strong>$2.4 trillion</strong> tourism spending in 2025</li>
                <li>• <strong>$270 billion</strong> tours & activities market</li>
                <li>• <strong>44%</strong> plan to spend MORE on experiences</li>
              </ul>
            </div>
            <div className="bg-green-50 rounded-xl p-5 border border-green-100">
              <h4 className="font-bold text-green-800 mb-3">Why Now?</h4>
              <ul className="space-y-2 text-sm text-gray-700">
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
          <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-blue-600">Business Model</h2>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 mb-6 border border-blue-100">
            <h3 className="font-bold text-xl text-center text-gray-900 mb-6">Commission Structure</h3>
            <div className="flex justify-center items-center gap-4 flex-wrap">
              <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-200">
                <p className="text-sm text-gray-600">Customer Pays</p>
                <p className="text-3xl font-bold text-gray-900">£100</p>
              </div>
              <span className="text-2xl text-gray-400">→</span>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-200">
                <p className="text-sm text-gray-600">Photographer Gets (80%)</p>
                <p className="text-3xl font-bold text-green-600">£80</p>
              </div>
              <span className="text-2xl text-gray-400">+</span>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm border-2 border-blue-600">
                <p className="text-sm text-gray-600">SnapNow Earns (20%)</p>
                <p className="text-3xl font-bold text-blue-600">£20</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
            <h4 className="font-bold text-gray-900 mb-4">Proven Marketplace Take Rates</h4>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-700">12-15%</p>
                <p className="text-xs text-gray-500">Airbnb</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-700">20-25%</p>
                <p className="text-xs text-gray-500">Uber</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-700">15-20%</p>
                <p className="text-xs text-gray-500">Etsy</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">20%</p>
                <p className="text-xs text-gray-500">SnapNow</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h4 className="font-bold text-gray-900 mb-4">Revenue Streams</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-2">Stream</th>
                  <th className="text-right py-2">Year 1</th>
                  <th className="text-right py-2">Year 2</th>
                  <th className="text-right py-2">Year 3</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-2">Booking Commissions (20%)</td>
                  <td className="text-right">£30K</td>
                  <td className="text-right">£150K</td>
                  <td className="text-right">£500K</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-2">Premium Photographer Features</td>
                  <td className="text-right text-gray-400">-</td>
                  <td className="text-right">£15K</td>
                  <td className="text-right">£50K</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-2">Sponsored Destinations</td>
                  <td className="text-right text-gray-400">-</td>
                  <td className="text-right">£10K</td>
                  <td className="text-right">£40K</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-2">Travel Partnerships</td>
                  <td className="text-right text-gray-400">-</td>
                  <td className="text-right">£5K</td>
                  <td className="text-right">£30K</td>
                </tr>
                <tr className="font-bold bg-gray-50">
                  <td className="py-2">Total Revenue</td>
                  <td className="text-right text-blue-600">£30K</td>
                  <td className="text-right text-blue-600">£180K</td>
                  <td className="text-right text-blue-600">£620K</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Competitive Landscape */}
        <section className="mb-12" style={{ pageBreakInside: "avoid" }}>
          <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-blue-600">Competitive Landscape</h2>
          
          <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
            <h3 className="font-bold text-lg text-gray-900 mb-4">Direct Competitors</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-2">Company</th>
                  <th className="text-right py-2">Funding</th>
                  <th className="text-right py-2">Revenue</th>
                  <th className="text-left py-2 pl-4">Our Advantage</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-3 font-medium">Flytographer</td>
                  <td className="text-right">$1.7M</td>
                  <td className="text-right">~$3.5M</td>
                  <td className="text-left pl-4 text-sm">Lower prices, mobile-first</td>
                </tr>
                <tr className="border-b border-gray-200 bg-yellow-50">
                  <td className="py-3 font-medium">Shoott</td>
                  <td className="text-right font-bold">$2.7M</td>
                  <td className="text-right font-bold text-green-600">$10M</td>
                  <td className="text-left pl-4 text-sm">Travel-focused, global ambition</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">Snappr</td>
                  <td className="text-right">$20M+</td>
                  <td className="text-right">~$15M</td>
                  <td className="text-left pl-4 text-sm">Consumer & travel focus</td>
                </tr>
              </tbody>
            </table>
            <div className="mt-4 p-3 bg-green-100 rounded-lg border border-green-200">
              <p className="text-sm text-green-800"><strong>Key Insight:</strong> Shoott proved you can scale to $10M with just $2.7M funding. Our model is equally capital-efficient.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
              <h4 className="font-bold text-blue-800 mb-3">Our Competitive Moat</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li><strong>1. Network Effects:</strong> More photographers → better coverage → more customers</li>
                <li><strong>2. Location Data:</strong> Curated photo spots create unique content moat</li>
                <li><strong>3. Trust System:</strong> Two-sided ratings build quality</li>
                <li><strong>4. Mobile-First:</strong> Built for on-the-go travelers</li>
              </ul>
            </div>
            <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
              <h4 className="font-bold text-purple-800 mb-3">Lessons from Uber & Airbnb</h4>
              <ul className="space-y-2 text-sm text-gray-700">
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
          <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-blue-600">Go-to-Market Strategy</h2>
          
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-xl p-5 border-l-4 border-blue-500">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-blue-800">Phase 1: London MVP</h4>
                <span className="text-sm bg-blue-200 text-blue-800 px-2 py-1 rounded">Q1 2026</span>
              </div>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• 50 vetted photographers covering key tourist areas</li>
                <li>• Focus: Tower Bridge, Big Ben, Notting Hill, South Bank</li>
                <li>• Target: <strong>500 bookings</strong> in first quarter</li>
                <li>• Marketing: Instagram influencers, hotel concierge partnerships</li>
              </ul>
            </div>

            <div className="bg-purple-50 rounded-xl p-5 border-l-4 border-purple-500">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-purple-800">Phase 2: European Expansion</h4>
                <span className="text-sm bg-purple-200 text-purple-800 px-2 py-1 rounded">Q2-Q3 2026</span>
              </div>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Expand to Barcelona, Paris, Rome</li>
                <li>• 150 photographers across 4 cities</li>
                <li>• Target: <strong>3,000 bookings</strong> by Q3</li>
                <li>• Partnerships with travel agencies, Airbnb Experiences</li>
              </ul>
            </div>

            <div className="bg-green-50 rounded-xl p-5 border-l-4 border-green-500">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-green-800">Phase 3: Global Scale</h4>
                <span className="text-sm bg-green-200 text-green-800 px-2 py-1 rounded">Q4 2026+</span>
              </div>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Tokyo, NYC, Dubai, Sydney</li>
                <li>• 500+ photographers worldwide</li>
                <li>• Premium features launch</li>
                <li>• Target: <strong>10,000 bookings/year</strong> by end of Year 2</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Financial Projections */}
        <section className="mb-12" style={{ pageBreakInside: "avoid" }}>
          <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-blue-600">Financial Projections</h2>
          
          <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
            <h3 className="font-bold text-lg text-gray-900 mb-4">3-Year Financial Model</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-2">Metric</th>
                  <th className="text-right py-2">Year 1</th>
                  <th className="text-right py-2">Year 2</th>
                  <th className="text-right py-2">Year 3</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-2">Bookings</td>
                  <td className="text-right">2,000</td>
                  <td className="text-right">10,000</td>
                  <td className="text-right">35,000</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-2">Avg Booking Value</td>
                  <td className="text-right">£75</td>
                  <td className="text-right">£85</td>
                  <td className="text-right">£95</td>
                </tr>
                <tr className="border-b border-gray-200 bg-blue-50">
                  <td className="py-2 font-medium">GMV (Gross Merchandise Value)</td>
                  <td className="text-right font-medium">£150,000</td>
                  <td className="text-right font-medium">£850,000</td>
                  <td className="text-right font-medium">£3,325,000</td>
                </tr>
                <tr className="border-b border-gray-200 bg-green-50">
                  <td className="py-2 font-medium">Revenue (20% Take Rate)</td>
                  <td className="text-right font-medium text-green-600">£30,000</td>
                  <td className="text-right font-medium text-green-600">£170,000</td>
                  <td className="text-right font-medium text-green-600">£665,000</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-2">Gross Margin</td>
                  <td className="text-right">85%</td>
                  <td className="text-right">87%</td>
                  <td className="text-right">90%</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-2">Operating Expenses</td>
                  <td className="text-right">£120,000</td>
                  <td className="text-right">£180,000</td>
                  <td className="text-right">£350,000</td>
                </tr>
                <tr className="font-bold">
                  <td className="py-2">Net Income</td>
                  <td className="text-right text-red-600">-£90,000</td>
                  <td className="text-right text-red-600">-£17,000</td>
                  <td className="text-right text-green-600">+£248,500</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
            <h3 className="font-bold text-lg text-gray-900 mb-4">Unit Economics</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center bg-white rounded-lg p-3 border border-gray-200">
                <p className="text-2xl font-bold text-gray-900">£15-25</p>
                <p className="text-sm text-gray-600">CAC (Target)</p>
              </div>
              <div className="text-center bg-white rounded-lg p-3 border border-gray-200">
                <p className="text-2xl font-bold text-gray-900">£75-150</p>
                <p className="text-sm text-gray-600">LTV (2-3 bookings)</p>
              </div>
              <div className="text-center bg-white rounded-lg p-3 border border-gray-200">
                <p className="text-2xl font-bold text-green-600">4-6x</p>
                <p className="text-sm text-gray-600">LTV/CAC Ratio</p>
              </div>
              <div className="text-center bg-white rounded-lg p-3 border border-gray-200">
                <p className="text-2xl font-bold text-blue-600">20%</p>
                <p className="text-sm text-gray-600">Take Rate</p>
              </div>
              <div className="text-center bg-white rounded-lg p-3 border border-gray-200">
                <p className="text-2xl font-bold text-gray-900">70%+</p>
                <p className="text-sm text-gray-600">Contribution Margin</p>
              </div>
              <div className="text-center bg-white rounded-lg p-3 border border-gray-200">
                <p className="text-2xl font-bold text-gray-900">25%</p>
                <p className="text-sm text-gray-600">Repeat Rate Target</p>
              </div>
            </div>
          </div>
        </section>

        {/* Key Investor Metrics */}
        <section className="mb-12" style={{ pageBreakInside: "avoid" }}>
          <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-blue-600">Key Investor Metrics We'll Track</h2>
          
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-2">Metric</th>
                  <th className="text-left py-2">Description</th>
                  <th className="text-right py-2">Year 1 Target</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-2 font-medium">GMV</td>
                  <td className="py-2 text-gray-600">Total booking value</td>
                  <td className="text-right font-bold">£150,000</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-2 font-medium">Take Rate</td>
                  <td className="py-2 text-gray-600">Revenue / GMV</td>
                  <td className="text-right font-bold">20%</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-2 font-medium">MoM Growth</td>
                  <td className="py-2 text-gray-600">Monthly GMV growth</td>
                  <td className="text-right font-bold">15%+</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-2 font-medium">LTV/CAC</td>
                  <td className="py-2 text-gray-600">Customer value vs acquisition cost</td>
                  <td className="text-right font-bold text-green-600">&gt;3x</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-2 font-medium">Repeat Rate</td>
                  <td className="py-2 text-gray-600">Customers booking 2+ times</td>
                  <td className="text-right font-bold">25%</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-2 font-medium">NPS</td>
                  <td className="py-2 text-gray-600">Customer satisfaction score</td>
                  <td className="text-right font-bold">50+</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">Photographer Retention</td>
                  <td className="py-2 text-gray-600">Active after 6 months</td>
                  <td className="text-right font-bold">70%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Funding Requirements */}
        <section className="mb-12" style={{ pageBreakInside: "avoid" }}>
          <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-blue-600">Funding Requirements</h2>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 mb-6 text-center border border-blue-100">
            <p className="text-lg text-gray-600 mb-2">Seed Round</p>
            <p className="text-5xl font-bold text-blue-600 mb-2">£130,000</p>
            <p className="text-gray-600">18-month runway to Series A</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-4">Use of Funds</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-700">Product Development</span>
                    <span className="font-bold">£50,000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '38%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-700">Marketing & User Acquisition</span>
                    <span className="font-bold">£40,000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{width: '31%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-700">Operations</span>
                    <span className="font-bold">£30,000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '23%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-700">Legal & Compliance</span>
                    <span className="font-bold">£10,000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{width: '8%'}}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-4">Milestones Timeline</h4>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-3 h-3 mt-1.5 rounded-full bg-blue-600"></div>
                  <div>
                    <p className="font-medium text-gray-900">Q1 2026</p>
                    <p className="text-sm text-gray-600">London launch, 50 photographers, 500 bookings</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-3 h-3 mt-1.5 rounded-full bg-purple-500"></div>
                  <div>
                    <p className="font-medium text-gray-900">Q2 2026</p>
                    <p className="text-sm text-gray-600">Barcelona expansion, 100 photographers</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-3 h-3 mt-1.5 rounded-full bg-green-500"></div>
                  <div>
                    <p className="font-medium text-gray-900">Q3 2026</p>
                    <p className="text-sm text-gray-600">Paris launch, 150 photographers, 3K bookings</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-3 h-3 mt-1.5 rounded-full bg-orange-500"></div>
                  <div>
                    <p className="font-medium text-gray-900">Q4 2026</p>
                    <p className="text-sm text-gray-600">Series A prep, 200+ photographers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why This Will Work */}
        <section className="mb-12" style={{ pageBreakInside: "avoid" }}>
          <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-blue-600">Why SnapNow Will Succeed</h2>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-xl p-5 border border-green-100">
              <div className="text-2xl mb-2">✓</div>
              <h4 className="font-bold text-green-800 mb-2">Proven Model</h4>
              <p className="text-sm text-gray-700">Shoott reached $10M revenue with $2.7M funding</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
              <div className="text-2xl mb-2">📈</div>
              <h4 className="font-bold text-blue-800 mb-2">Massive Market</h4>
              <p className="text-sm text-gray-700">$38B photography + $2.4T travel = huge TAM</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
              <div className="text-2xl mb-2">🎯</div>
              <h4 className="font-bold text-purple-800 mb-2">Clear Demand</h4>
              <p className="text-sm text-gray-700">78% of travelers can't find photographers</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-5 border border-orange-100">
              <div className="text-2xl mb-2">💰</div>
              <h4 className="font-bold text-orange-800 mb-2">Capital Efficient</h4>
              <p className="text-sm text-gray-700">Software margins, no inventory</p>
            </div>
            <div className="bg-pink-50 rounded-xl p-5 border border-pink-100">
              <div className="text-2xl mb-2">🌍</div>
              <h4 className="font-bold text-pink-800 mb-2">Network Effects</h4>
              <p className="text-sm text-gray-700">Each city strengthens the network</p>
            </div>
            <div className="bg-teal-50 rounded-xl p-5 border border-teal-100">
              <div className="text-2xl mb-2">⏰</div>
              <h4 className="font-bold text-teal-800 mb-2">Perfect Timing</h4>
              <p className="text-sm text-gray-700">Post-pandemic travel boom</p>
            </div>
          </div>
        </section>

        {/* Closing */}
        <section className="text-center py-12 border-t-4 border-blue-600">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">The Opportunity</h2>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-8">
            SnapNow is positioned to capture a share of the <strong>$37.96B+ global photography market</strong> by connecting travelers with photographers on-demand and at scale.
          </p>
          
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white max-w-lg mx-auto">
            <p className="text-lg mb-2">Raising</p>
            <p className="text-4xl font-bold mb-4">£130,000 Seed</p>
            <p className="text-sm opacity-90">To launch in London and expand across Europe</p>
          </div>

          <div className="mt-12">
            <p className="text-2xl font-bold text-blue-600 mb-2">SnapNow</p>
            <p className="text-gray-600 italic">Connecting travelers with photographers, one snap at a time.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
