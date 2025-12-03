import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function FundingPlan() {
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style>{`
        .funding-plan-page {
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
          
          .funding-plan-page {
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
          
          .page-break {
            page-break-before: always !important;
            break-before: page !important;
          }
        }
      `}</style>
      <div className="funding-plan-page">
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
              <p className="text-xl text-gray-300">£150,000 Pre-Seed Deployment Plan</p>
              <p className="text-sm text-gray-500 mt-2">5-City Launch Strategy | 15-Month Runway</p>
            </div>

            {/* Executive Summary */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-violet-400 mb-4 pb-2 border-b border-gray-700">
                Executive Summary
              </h2>
              <div className="bg-violet-900/20 p-4 rounded-lg border border-violet-500/30 mb-4">
                <p className="text-gray-300 leading-relaxed">
                  SnapNow is seeking <strong className="text-violet-400">£150,000</strong> in pre-seed funding to launch native iOS and Android apps 
                  across <strong className="text-violet-400">5 major tourist cities</strong> (London, Paris, New York, Tokyo, Rome) within 15 months.
                </p>
              </div>
              
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-3xl font-bold text-green-400">£150k</p>
                  <p className="text-gray-400 text-sm">Total Raise</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-3xl font-bold text-violet-400">5</p>
                  <p className="text-gray-400 text-sm">Cities</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-3xl font-bold text-blue-400">15</p>
                  <p className="text-gray-400 text-sm">Months Runway</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-3xl font-bold text-amber-400">2</p>
                  <p className="text-gray-400 text-sm">Native Apps</p>
                </div>
              </div>
            </section>

            {/* Competitive Advantage */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-violet-400 mb-4 pb-2 border-b border-gray-700">
                Our Competitive Advantage: Working MVP
              </h2>
              <p className="text-gray-300 mb-4">
                Unlike typical pre-seed startups, we already have a <strong className="text-white">fully functional prototype</strong> with all core features built and tested:
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-900/20 p-4 rounded-lg border border-green-500/30">
                  <h3 className="font-bold text-green-400 mb-3">Already Built</h3>
                  <ul className="text-gray-300 space-y-1 text-sm">
                    <li>✓ User authentication & profiles</li>
                    <li>✓ Photographer verification system</li>
                    <li>✓ Booking & payment (Stripe)</li>
                    <li>✓ Photo delivery galleries</li>
                    <li>✓ Photo editing add-on service</li>
                    <li>✓ Reviews & ratings</li>
                    <li>✓ Location-based discovery</li>
                    <li>✓ Live location sharing</li>
                    <li>✓ Admin dashboard</li>
                  </ul>
                </div>
                <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30">
                  <h3 className="font-bold text-blue-400 mb-3">What Funding Enables</h3>
                  <ul className="text-gray-300 space-y-1 text-sm">
                    <li>→ Native iOS app (App Store)</li>
                    <li>→ Native Android app (Play Store)</li>
                    <li>→ Push notifications</li>
                    <li>→ Mobile-optimized UX</li>
                    <li>→ 5-city photographer network</li>
                    <li>→ Marketing & user acquisition</li>
                    <li>→ Operational scaling</li>
                    <li>→ 15 months runway to Series A</li>
                  </ul>
                </div>
              </div>
              <p className="text-gray-400 text-sm mt-4 italic">
                Having a working prototype reduces development risk by 70-80% compared to building from scratch.
              </p>
            </section>

            {/* Page Break */}
            <div className="page-break"></div>

            {/* Use of Funds */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-violet-400 mb-4 pb-2 border-b border-gray-700">
                Use of Funds: £150,000 Allocation
              </h2>
              
              <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-violet-900/50">
                      <th className="border border-gray-600 p-3 text-left font-bold text-violet-300">Category</th>
                      <th className="border border-gray-600 p-3 text-right font-bold text-violet-300">Amount</th>
                      <th className="border border-gray-600 p-3 text-right font-bold text-violet-300">% of Total</th>
                      <th className="border border-gray-600 p-3 text-left font-bold text-violet-300">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-800/50">
                      <td className="border border-gray-600 p-3 text-white font-medium">Mobile App Development</td>
                      <td className="border border-gray-600 p-3 text-right text-green-400 font-bold">£55,000</td>
                      <td className="border border-gray-600 p-3 text-right text-gray-300">37%</td>
                      <td className="border border-gray-600 p-3 text-gray-400 text-xs">React Native engineers, backend updates, app store fees</td>
                    </tr>
                    <tr className="bg-gray-800/30">
                      <td className="border border-gray-600 p-3 text-white font-medium">Marketing (5 Cities)</td>
                      <td className="border border-gray-600 p-3 text-right text-green-400 font-bold">£40,000</td>
                      <td className="border border-gray-600 p-3 text-right text-gray-300">27%</td>
                      <td className="border border-gray-600 p-3 text-gray-400 text-xs">Photographer incentives, events, content, referrals</td>
                    </tr>
                    <tr className="bg-gray-800/50">
                      <td className="border border-gray-600 p-3 text-white font-medium">Team & Operations</td>
                      <td className="border border-gray-600 p-3 text-right text-green-400 font-bold">£37,000</td>
                      <td className="border border-gray-600 p-3 text-right text-gray-300">25%</td>
                      <td className="border border-gray-600 p-3 text-gray-400 text-xs">Growth marketer, community manager, legal, hosting</td>
                    </tr>
                    <tr className="bg-gray-800/30">
                      <td className="border border-gray-600 p-3 text-white font-medium">Contingency Buffer</td>
                      <td className="border border-gray-600 p-3 text-right text-green-400 font-bold">£18,000</td>
                      <td className="border border-gray-600 p-3 text-right text-gray-300">12%</td>
                      <td className="border border-gray-600 p-3 text-gray-400 text-xs">Unexpected costs, opportunities, runway extension</td>
                    </tr>
                    <tr className="bg-violet-900/30">
                      <td className="border border-gray-600 p-3 text-violet-300 font-bold">TOTAL</td>
                      <td className="border border-gray-600 p-3 text-right text-violet-400 font-bold">£150,000</td>
                      <td className="border border-gray-600 p-3 text-right text-violet-300 font-bold">100%</td>
                      <td className="border border-gray-600 p-3"></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Visual breakdown */}
              <div className="flex gap-1 h-8 rounded-lg overflow-hidden mb-4">
                <div className="bg-violet-500 flex-[37]"></div>
                <div className="bg-amber-500 flex-[27]"></div>
                <div className="bg-blue-500 flex-[25]"></div>
                <div className="bg-gray-500 flex-[12]"></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-violet-500 rounded"></span> Development 37%</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-500 rounded"></span> Marketing 27%</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded"></span> Team/Ops 25%</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-500 rounded"></span> Buffer 12%</span>
              </div>
            </section>

            {/* Development Breakdown */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-violet-400 mb-4 pb-2 border-b border-gray-700">
                Development Budget: £55,000
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-violet-900/50">
                      <th className="border border-gray-600 p-3 text-left font-bold text-violet-300">Role</th>
                      <th className="border border-gray-600 p-3 text-center font-bold text-violet-300">Duration</th>
                      <th className="border border-gray-600 p-3 text-right font-bold text-violet-300">Cost</th>
                      <th className="border border-gray-600 p-3 text-left font-bold text-violet-300">Deliverables</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-800/50">
                      <td className="border border-gray-600 p-3 text-white">Lead React Native Engineer</td>
                      <td className="border border-gray-600 p-3 text-center text-gray-300">4 months</td>
                      <td className="border border-gray-600 p-3 text-right text-green-400 font-bold">£32,000</td>
                      <td className="border border-gray-600 p-3 text-gray-400 text-xs">iOS + Android apps, UI implementation</td>
                    </tr>
                    <tr className="bg-gray-800/30">
                      <td className="border border-gray-600 p-3 text-white">Backend Engineer (Part-time)</td>
                      <td className="border border-gray-600 p-3 text-center text-gray-300">3 months</td>
                      <td className="border border-gray-600 p-3 text-right text-green-400 font-bold">£18,000</td>
                      <td className="border border-gray-600 p-3 text-gray-400 text-xs">Auth upgrade, push notifications, API optimization</td>
                    </tr>
                    <tr className="bg-gray-800/50">
                      <td className="border border-gray-600 p-3 text-white">App Store Fees & Tools</td>
                      <td className="border border-gray-600 p-3 text-center text-gray-300">-</td>
                      <td className="border border-gray-600 p-3 text-right text-green-400 font-bold">£5,000</td>
                      <td className="border border-gray-600 p-3 text-gray-400 text-xs">Apple/Google fees, dev tools, testing devices</td>
                    </tr>
                    <tr className="bg-green-900/20">
                      <td className="border border-gray-600 p-3 text-green-400">UI/UX Design</td>
                      <td className="border border-gray-600 p-3 text-center text-green-400">Ongoing</td>
                      <td className="border border-gray-600 p-3 text-right text-green-400 font-bold">£0</td>
                      <td className="border border-gray-600 p-3 text-green-400 text-xs">Handled via AI tools (Replit Agent)</td>
                    </tr>
                    <tr className="bg-green-900/20">
                      <td className="border border-gray-600 p-3 text-green-400">QA & Testing</td>
                      <td className="border border-gray-600 p-3 text-center text-green-400">Ongoing</td>
                      <td className="border border-gray-600 p-3 text-right text-green-400 font-bold">£0</td>
                      <td className="border border-gray-600 p-3 text-green-400 text-xs">Founder (12 years QA experience)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Page Break */}
            <div className="page-break"></div>

            {/* Marketing Breakdown */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-violet-400 mb-4 pb-2 border-b border-gray-700">
                Marketing Budget: £40,000 (5 Cities)
              </h2>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <h3 className="font-bold text-amber-400 mb-3">Paid Strategies</h3>
                  <ul className="text-gray-300 space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span>Photographer Incentives</span>
                      <span className="text-white font-bold">£18,000</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Photo Walk Events</span>
                      <span className="text-white font-bold">£8,000</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Content & Social Ads</span>
                      <span className="text-white font-bold">£8,000</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Referral Rewards</span>
                      <span className="text-white font-bold">£6,000</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <h3 className="font-bold text-green-400 mb-3">Zero-Cost Strategies</h3>
                  <ul className="text-gray-300 space-y-2 text-sm">
                    <li>✓ Hotel & venue partnerships</li>
                    <li>✓ Tourism board collaborations</li>
                    <li>✓ Ambassador photographers (commission-only)</li>
                    <li>✓ Instagram/TikTok organic content</li>
                    <li>✓ SEO for "photographer in [city]"</li>
                    <li>✓ Wedding planner referral network</li>
                  </ul>
                </div>
              </div>

              <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-500/30">
                <h3 className="font-bold text-amber-400 mb-2">Photographer Acquisition Strategy</h3>
                <p className="text-gray-300 text-sm">
                  New photographers receive <strong className="text-white">0% commission on their first 3 bookings</strong> as an incentive to join.
                  This creates strong word-of-mouth within photography communities and ensures quality supply in each city before customer marketing begins.
                </p>
              </div>
            </section>

            {/* Team Structure */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-violet-400 mb-4 pb-2 border-b border-gray-700">
                Team & Operations: £37,000
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-violet-900/50">
                      <th className="border border-gray-600 p-3 text-left font-bold text-violet-300">Role</th>
                      <th className="border border-gray-600 p-3 text-center font-bold text-violet-300">Type</th>
                      <th className="border border-gray-600 p-3 text-right font-bold text-violet-300">Cost (15 mo)</th>
                      <th className="border border-gray-600 p-3 text-left font-bold text-violet-300">Responsibilities</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-green-900/20">
                      <td className="border border-gray-600 p-3 text-green-400 font-medium">Founder/CEO</td>
                      <td className="border border-gray-600 p-3 text-center text-green-400">Full-time</td>
                      <td className="border border-gray-600 p-3 text-right text-green-400 font-bold">£0</td>
                      <td className="border border-gray-600 p-3 text-green-400 text-xs">CEO, PM, QA Lead, Ops, Design Direction</td>
                    </tr>
                    <tr className="bg-gray-800/50">
                      <td className="border border-gray-600 p-3 text-white">Growth Marketer</td>
                      <td className="border border-gray-600 p-3 text-center text-gray-300">Fractional</td>
                      <td className="border border-gray-600 p-3 text-right text-green-400 font-bold">£12,000</td>
                      <td className="border border-gray-600 p-3 text-gray-400 text-xs">Campaign strategy, analytics, paid acquisition</td>
                    </tr>
                    <tr className="bg-gray-800/30">
                      <td className="border border-gray-600 p-3 text-white">Photographer Success</td>
                      <td className="border border-gray-600 p-3 text-center text-gray-300">Part-time</td>
                      <td className="border border-gray-600 p-3 text-right text-green-400 font-bold">£9,000</td>
                      <td className="border border-gray-600 p-3 text-gray-400 text-xs">Onboarding, support, community building</td>
                    </tr>
                    <tr className="bg-gray-800/50">
                      <td className="border border-gray-600 p-3 text-white">Content Creator</td>
                      <td className="border border-gray-600 p-3 text-center text-gray-300">Part-time</td>
                      <td className="border border-gray-600 p-3 text-right text-green-400 font-bold">£6,000</td>
                      <td className="border border-gray-600 p-3 text-gray-400 text-xs">Social media, video content, UGC coordination</td>
                    </tr>
                    <tr className="bg-gray-800/30">
                      <td className="border border-gray-600 p-3 text-white">Legal, Accounting, Hosting</td>
                      <td className="border border-gray-600 p-3 text-center text-gray-300">-</td>
                      <td className="border border-gray-600 p-3 text-right text-green-400 font-bold">£10,000</td>
                      <td className="border border-gray-600 p-3 text-gray-400 text-xs">Company formation, contracts, infrastructure</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Page Break */}
            <div className="page-break"></div>

            {/* 15-Month Timeline */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-violet-400 mb-4 pb-2 border-b border-gray-700">
                15-Month Rollout Timeline
              </h2>
              
              <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-violet-900/50">
                      <th className="border border-gray-600 p-3 text-left font-bold text-violet-300">Phase</th>
                      <th className="border border-gray-600 p-3 text-center font-bold text-violet-300">Months</th>
                      <th className="border border-gray-600 p-3 text-left font-bold text-violet-300">Focus</th>
                      <th className="border border-gray-600 p-3 text-right font-bold text-violet-300">Spend</th>
                      <th className="border border-gray-600 p-3 text-right font-bold text-violet-300">Cumulative</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-800/50">
                      <td className="border border-gray-600 p-3 text-white font-medium">Build + London Prep</td>
                      <td className="border border-gray-600 p-3 text-center text-gray-300">1-4</td>
                      <td className="border border-gray-600 p-3 text-gray-300 text-xs">Native apps development, seed London photographers</td>
                      <td className="border border-gray-600 p-3 text-right text-green-400">£55,000</td>
                      <td className="border border-gray-600 p-3 text-right text-white">£55,000</td>
                    </tr>
                    <tr className="bg-gray-800/30">
                      <td className="border border-gray-600 p-3 text-white font-medium">🇬🇧 London Launch</td>
                      <td className="border border-gray-600 p-3 text-center text-gray-300">5-6</td>
                      <td className="border border-gray-600 p-3 text-gray-300 text-xs">App Store launch, customer acquisition, Paris prep</td>
                      <td className="border border-gray-600 p-3 text-right text-green-400">£20,000</td>
                      <td className="border border-gray-600 p-3 text-right text-white">£75,000</td>
                    </tr>
                    <tr className="bg-gray-800/50">
                      <td className="border border-gray-600 p-3 text-white font-medium">🇫🇷 Paris + 🇺🇸 NYC</td>
                      <td className="border border-gray-600 p-3 text-center text-gray-300">7-9</td>
                      <td className="border border-gray-600 p-3 text-gray-300 text-xs">European expansion, US market entry</td>
                      <td className="border border-gray-600 p-3 text-right text-green-400">£25,000</td>
                      <td className="border border-gray-600 p-3 text-right text-white">£100,000</td>
                    </tr>
                    <tr className="bg-gray-800/30">
                      <td className="border border-gray-600 p-3 text-white font-medium">🇯🇵 Tokyo</td>
                      <td className="border border-gray-600 p-3 text-center text-gray-300">10-12</td>
                      <td className="border border-gray-600 p-3 text-gray-300 text-xs">Asia Pacific expansion, localization</td>
                      <td className="border border-gray-600 p-3 text-right text-green-400">£25,000</td>
                      <td className="border border-gray-600 p-3 text-right text-white">£125,000</td>
                    </tr>
                    <tr className="bg-gray-800/50">
                      <td className="border border-gray-600 p-3 text-white font-medium">🇮🇹 Rome + Scale</td>
                      <td className="border border-gray-600 p-3 text-center text-gray-300">13-15</td>
                      <td className="border border-gray-600 p-3 text-gray-300 text-xs">Final city, optimization, Series A prep</td>
                      <td className="border border-gray-600 p-3 text-right text-green-400">£25,000</td>
                      <td className="border border-gray-600 p-3 text-right text-white">£150,000</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30">
                <h3 className="font-bold text-blue-400 mb-2">Monthly Burn Rate</h3>
                <p className="text-gray-300 text-sm">
                  Average monthly burn: <strong className="text-white">£10,000/month</strong> | Peak (development phase): £15,000/month | Steady state: £8,000/month
                </p>
              </div>
            </section>

            {/* Milestones */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-violet-400 mb-4 pb-2 border-b border-gray-700">
                Key Milestones & KPIs
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-violet-900/50">
                      <th className="border border-gray-600 p-3 text-left font-bold text-violet-300">Milestone</th>
                      <th className="border border-gray-600 p-3 text-center font-bold text-violet-300">Target Date</th>
                      <th className="border border-gray-600 p-3 text-left font-bold text-violet-300">Success Metric</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-800/50">
                      <td className="border border-gray-600 p-3 text-white">Apps in App Stores</td>
                      <td className="border border-gray-600 p-3 text-center text-gray-300">Month 4</td>
                      <td className="border border-gray-600 p-3 text-green-400">iOS + Android live</td>
                    </tr>
                    <tr className="bg-gray-800/30">
                      <td className="border border-gray-600 p-3 text-white">London Photographer Network</td>
                      <td className="border border-gray-600 p-3 text-center text-gray-300">Month 6</td>
                      <td className="border border-gray-600 p-3 text-green-400">50+ verified photographers</td>
                    </tr>
                    <tr className="bg-gray-800/50">
                      <td className="border border-gray-600 p-3 text-white">First Revenue</td>
                      <td className="border border-gray-600 p-3 text-center text-gray-300">Month 6</td>
                      <td className="border border-gray-600 p-3 text-green-400">100+ bookings completed</td>
                    </tr>
                    <tr className="bg-gray-800/30">
                      <td className="border border-gray-600 p-3 text-white">5 Cities Live</td>
                      <td className="border border-gray-600 p-3 text-center text-gray-300">Month 15</td>
                      <td className="border border-gray-600 p-3 text-green-400">250+ photographers, 2,500+ bookings</td>
                    </tr>
                    <tr className="bg-gray-800/50">
                      <td className="border border-gray-600 p-3 text-white">Series A Ready</td>
                      <td className="border border-gray-600 p-3 text-center text-gray-300">Month 15</td>
                      <td className="border border-gray-600 p-3 text-green-400">£50k+ monthly GMV, proven unit economics</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Page Break */}
            <div className="page-break"></div>

            {/* Revenue Projections */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-violet-400 mb-4 pb-2 border-b border-gray-700">
                Revenue Model & Projections
              </h2>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <h3 className="font-bold text-white mb-3">Platform Economics</h3>
                  <ul className="text-gray-300 space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span>Customer Service Fee:</span>
                      <span className="text-green-400 font-bold">10%</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Photographer Commission:</span>
                      <span className="text-green-400 font-bold">20%</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Editing Add-on Commission:</span>
                      <span className="text-green-400 font-bold">20%</span>
                    </li>
                    <li className="flex justify-between border-t border-gray-600 pt-2 mt-2">
                      <span className="text-violet-300">Total Platform Take:</span>
                      <span className="text-violet-400 font-bold">30%</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Avg Booking Value:</span>
                      <span className="text-white font-bold">£43</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Revenue per Booking:</span>
                      <span className="text-green-400 font-bold">£12.90</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <h3 className="font-bold text-white mb-3">15-Month Targets</h3>
                  <ul className="text-gray-300 space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span>Total Photographers:</span>
                      <span className="text-white font-bold">250-300</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Total Bookings:</span>
                      <span className="text-white font-bold">2,500+</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Total GMV:</span>
                      <span className="text-white font-bold">£107,500</span>
                    </li>
                    <li className="flex justify-between border-t border-gray-600 pt-2 mt-2">
                      <span className="text-green-300">Platform Revenue:</span>
                      <span className="text-green-400 font-bold">£32,250</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Month 15 Run Rate:</span>
                      <span className="text-green-400 font-bold">£15,000/mo</span>
                    </li>
                  </ul>
                </div>
              </div>

              <p className="text-gray-400 text-sm italic">
                Note: Focus during pre-seed is proving product-market fit and building supply, not maximizing revenue. 
                Revenue scales significantly post-Series A with increased marketing spend.
              </p>
            </section>

            {/* Why This Works */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-violet-400 mb-4 pb-2 border-b border-gray-700">
                Why £150k Works
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-900/20 p-4 rounded-lg border border-green-500/30">
                  <h3 className="font-bold text-green-400 mb-3">Cost Advantages</h3>
                  <ul className="text-gray-300 space-y-2 text-sm">
                    <li>✓ Working prototype (70-80% built)</li>
                    <li>✓ Founder handles QA (12 years exp)</li>
                    <li>✓ AI-assisted design (Replit Agent)</li>
                    <li>✓ Lean contractor model</li>
                    <li>✓ Organic-first marketing</li>
                    <li>✓ Phased city rollout</li>
                  </ul>
                </div>
                <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30">
                  <h3 className="font-bold text-blue-400 mb-3">Risk Mitigations</h3>
                  <ul className="text-gray-300 space-y-2 text-sm">
                    <li>→ 12% contingency buffer (£18k)</li>
                    <li>→ Proven tech stack</li>
                    <li>→ City-by-city validation</li>
                    <li>→ Revenue from Month 6</li>
                    <li>→ Clear path to Series A</li>
                    <li>→ Founder skin in the game</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Footer */}
            <div className="text-center pt-6 border-t border-gray-700">
              <p className="text-violet-400 font-bold text-lg">SnapNow</p>
              <p className="text-gray-500 text-sm">Connecting Travelers with Professional Photographers</p>
              <p className="text-gray-400 text-sm mt-4">
                <strong>Pre-Seed Ask:</strong> £150,000 | <strong>Runway:</strong> 15 months | <strong>Goal:</strong> 5 cities, Series A ready
              </p>
              <p className="text-gray-600 text-xs mt-4">
                Data sources: Internal projections, industry benchmarks (Mordor Intelligence 2024), competitive analysis
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}