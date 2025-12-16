import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function PreSeedPlan() {
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style>{`
        .pre-seed-page {
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
            margin: 0.3in; 
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
            background: white !important;
          }
          
          .pre-seed-page {
            position: static !important;
            overflow: visible !important;
            height: auto !important;
            width: auto !important;
            padding: 0 !important;
            background: white !important;
          }
          
          .print-wrapper {
            max-width: none !important;
            background: white !important;
          }
          
          .print-content {
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 0 !important;
            background: white !important;
            color: #1a1a1a !important;
          }
          
          .no-print {
            display: none !important;
          }
          
          .page-break {
            page-break-before: always !important;
            break-before: page !important;
          }
          
          section { 
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          table { 
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          .print-dark-bg {
            background: #1e293b !important;
            color: white !important;
          }
          
          .print-section {
            margin-bottom: 1rem !important;
          }
        }
      `}</style>
      <div className="pre-seed-page">
        <div className="print-wrapper max-w-4xl mx-auto">
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
            className="print-content bg-white text-gray-900 p-8 rounded-lg shadow-xl"
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
            {/* Header */}
            <div className="text-center mb-8 pb-6 border-b-2 border-violet-600">
              <h1 className="text-4xl font-bold text-violet-600 mb-2">SnapNow</h1>
              <p className="text-2xl font-semibold text-gray-800 mb-1">£200,000 Pre-Seed Deployment Plan</p>
              <p className="text-lg text-gray-600">European Launch Strategy | 18-Month Runway</p>
            </div>

            {/* Executive Summary */}
            <section className="mb-8 print-section">
              <h2 className="text-xl font-bold text-violet-600 mb-4 pb-2 border-b border-gray-300">
                Executive Summary
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                SnapNow is seeking £200,000 in pre-seed funding to launch native iOS and Android apps 
                and establish market dominance in Europe's top tourist destinations. Our focused strategy 
                prioritizes <strong>depth over breadth</strong> - proving unit economics in London and Paris 
                before expanding to Rome, Barcelona, and Amsterdam.
              </p>
              
              <div className="grid grid-cols-4 gap-4 mt-6">
                <div className="text-center p-4 bg-violet-50 rounded-lg border border-violet-200">
                  <p className="text-2xl font-bold text-violet-600">£200k</p>
                  <p className="text-sm text-gray-600">Total Raise</p>
                </div>
                <div className="text-center p-4 bg-violet-50 rounded-lg border border-violet-200">
                  <p className="text-2xl font-bold text-violet-600">2</p>
                  <p className="text-sm text-gray-600">Cities (Pre-Seed)</p>
                </div>
                <div className="text-center p-4 bg-violet-50 rounded-lg border border-violet-200">
                  <p className="text-2xl font-bold text-violet-600">18</p>
                  <p className="text-sm text-gray-600">Months Runway</p>
                </div>
                <div className="text-center p-4 bg-violet-50 rounded-lg border border-violet-200">
                  <p className="text-2xl font-bold text-violet-600">2</p>
                  <p className="text-sm text-gray-600">Native Apps</p>
                </div>
              </div>
            </section>

            {/* Our Competitive Advantage */}
            <section className="mb-8 print-section">
              <h2 className="text-xl font-bold text-violet-600 mb-4 pb-2 border-b border-gray-300">
                Our Competitive Advantage: Working MVP
              </h2>
              <p className="text-gray-700 mb-4">
                Unlike typical pre-seed startups, we already have a fully functional prototype with all core 
                features built and tested. This reduces development risk by <strong>70-80%</strong> compared to building from scratch.
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-bold text-green-700 mb-3">Already Built</h3>
                  <ul className="text-green-800 space-y-1 text-sm">
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
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-bold text-blue-700 mb-3">What Funding Enables</h3>
                  <ul className="text-blue-800 space-y-1 text-sm">
                    <li>→ Native iOS app (App Store)</li>
                    <li>→ Native Android app (Play Store)</li>
                    <li>→ Push notifications</li>
                    <li>→ Mobile-optimized UX</li>
                    <li>→ London + Paris photographer network</li>
                    <li>→ Marketing & user acquisition</li>
                    <li>→ Operational scaling</li>
                    <li>→ Founder salary (18 months)</li>
                    <li>→ 18 months runway to Series A</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Use of Funds */}
            <section className="mb-8 print-section page-break">
              <h2 className="text-xl font-bold text-violet-600 mb-4 pb-2 border-b border-gray-300">
                Use of Funds: £200,000 Allocation
              </h2>
              
              <table className="w-full border-collapse text-sm mb-4">
                <thead>
                  <tr className="bg-violet-100">
                    <th className="border border-gray-300 p-3 text-left font-bold text-violet-700">Category</th>
                    <th className="border border-gray-300 p-3 text-right font-bold text-violet-700">Amount</th>
                    <th className="border border-gray-300 p-3 text-center font-bold text-violet-700">%</th>
                    <th className="border border-gray-300 p-3 text-left font-bold text-violet-700">Details</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="border border-gray-300 p-3">Mobile App Development</td>
                    <td className="border border-gray-300 p-3 text-right font-semibold">£70,000</td>
                    <td className="border border-gray-300 p-3 text-center">35%</td>
                    <td className="border border-gray-300 p-3 text-gray-600 text-xs">React Native engineers, backend updates, app store fees, QA</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 p-3">Marketing (2 Cities)</td>
                    <td className="border border-gray-300 p-3 text-right font-semibold">£40,000</td>
                    <td className="border border-gray-300 p-3 text-center">20%</td>
                    <td className="border border-gray-300 p-3 text-gray-600 text-xs">Photographer incentives, events, content, referrals, ads</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-gray-300 p-3">Founder Salary</td>
                    <td className="border border-gray-300 p-3 text-right font-semibold">£36,000</td>
                    <td className="border border-gray-300 p-3 text-center">18%</td>
                    <td className="border border-gray-300 p-3 text-gray-600 text-xs">£2,000/month for 18 months (minimal living costs)</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 p-3">Team & Operations</td>
                    <td className="border border-gray-300 p-3 text-right font-semibold">£29,000</td>
                    <td className="border border-gray-300 p-3 text-center">14.5%</td>
                    <td className="border border-gray-300 p-3 text-gray-600 text-xs">Growth marketer, community manager, legal, hosting</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-gray-300 p-3">Contingency Buffer</td>
                    <td className="border border-gray-300 p-3 text-right font-semibold">£25,000</td>
                    <td className="border border-gray-300 p-3 text-center">12.5%</td>
                    <td className="border border-gray-300 p-3 text-gray-600 text-xs">Unexpected costs, opportunities, runway extension</td>
                  </tr>
                  <tr className="bg-violet-100 font-bold">
                    <td className="border border-gray-300 p-3">TOTAL</td>
                    <td className="border border-gray-300 p-3 text-right">£200,000</td>
                    <td className="border border-gray-300 p-3 text-center">100%</td>
                    <td className="border border-gray-300 p-3"></td>
                  </tr>
                </tbody>
              </table>

              <div className="flex gap-2 mt-4">
                <div className="flex-1 h-6 bg-violet-500 rounded-l" style={{flex: '35'}}></div>
                <div className="flex-1 h-6 bg-blue-500" style={{flex: '20'}}></div>
                <div className="flex-1 h-6 bg-green-500" style={{flex: '18'}}></div>
                <div className="flex-1 h-6 bg-orange-500" style={{flex: '14.5'}}></div>
                <div className="flex-1 h-6 bg-gray-400 rounded-r" style={{flex: '12.5'}}></div>
              </div>
              <div className="flex gap-4 mt-2 text-xs text-gray-600 justify-center flex-wrap">
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-violet-500 rounded"></span> Development 35%</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded"></span> Marketing 20%</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded"></span> Founder 18%</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-orange-500 rounded"></span> Ops 14.5%</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-400 rounded"></span> Buffer 12.5%</span>
              </div>
            </section>

            {/* Development Budget */}
            <section className="mb-8 print-section">
              <h2 className="text-xl font-bold text-violet-600 mb-4 pb-2 border-b border-gray-300">
                Development Budget: £70,000
              </h2>
              
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-3 text-left">Role</th>
                    <th className="border border-gray-300 p-3 text-center">Duration</th>
                    <th className="border border-gray-300 p-3 text-right">Cost</th>
                    <th className="border border-gray-300 p-3 text-left">Deliverables</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-3">Lead React Native Engineer</td>
                    <td className="border border-gray-300 p-3 text-center">5 months</td>
                    <td className="border border-gray-300 p-3 text-right">£45,000</td>
                    <td className="border border-gray-300 p-3 text-gray-600 text-xs">iOS + Android apps, UI implementation, testing</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 p-3">Backend Engineer (Part-time)</td>
                    <td className="border border-gray-300 p-3 text-center">4 months</td>
                    <td className="border border-gray-300 p-3 text-right">£18,000</td>
                    <td className="border border-gray-300 p-3 text-gray-600 text-xs">Auth upgrade, push notifications, API optimization</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3">App Store Fees & Tools</td>
                    <td className="border border-gray-300 p-3 text-center">-</td>
                    <td className="border border-gray-300 p-3 text-right">£7,000</td>
                    <td className="border border-gray-300 p-3 text-gray-600 text-xs">Apple/Google fees, dev tools, testing devices, CI/CD</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 p-3">UI/UX Design</td>
                    <td className="border border-gray-300 p-3 text-center">Ongoing</td>
                    <td className="border border-gray-300 p-3 text-right">£0</td>
                    <td className="border border-gray-300 p-3 text-gray-600 text-xs">Handled via AI tools (Replit Agent)</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3">QA & Testing</td>
                    <td className="border border-gray-300 p-3 text-center">Ongoing</td>
                    <td className="border border-gray-300 p-3 text-right">£0</td>
                    <td className="border border-gray-300 p-3 text-gray-600 text-xs">Founder (12 years QA experience)</td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* Marketing Budget */}
            <section className="mb-8 print-section">
              <h2 className="text-xl font-bold text-violet-600 mb-4 pb-2 border-b border-gray-300">
                Marketing Budget: £40,000 (2 Cities)
              </h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-gray-800 mb-3">Paid Strategies</h3>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b border-gray-200">
                        <td className="py-2">Photographer Incentives</td>
                        <td className="py-2 text-right font-semibold">£16,000</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2">Photo Walk Events</td>
                        <td className="py-2 text-right font-semibold">£10,000</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2">Content & Social Ads</td>
                        <td className="py-2 text-right font-semibold">£8,000</td>
                      </tr>
                      <tr>
                        <td className="py-2">Referral Rewards</td>
                        <td className="py-2 text-right font-semibold">£6,000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-bold text-green-700 mb-3">Zero-Cost Strategies</h3>
                  <ul className="text-green-800 space-y-1 text-sm">
                    <li>✓ Hotel & venue partnerships</li>
                    <li>✓ Tourism board collaborations</li>
                    <li>✓ Ambassador photographers (commission-only)</li>
                    <li>✓ Instagram/TikTok organic content</li>
                    <li>✓ SEO for "photographer in [city]"</li>
                    <li>✓ Wedding planner referral network</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-bold text-blue-700 mb-2">Photographer Acquisition Strategy</h4>
                <p className="text-blue-800 text-sm">
                  New photographers receive <strong>0% commission on their first 3 bookings</strong> as an incentive to join. 
                  This creates strong word-of-mouth within photography communities and ensures quality supply in each city 
                  before customer marketing begins.
                </p>
              </div>
            </section>

            {/* Team & Operations */}
            <section className="mb-8 print-section page-break">
              <h2 className="text-xl font-bold text-violet-600 mb-4 pb-2 border-b border-gray-300">
                Team & Operations: £29,000
              </h2>
              
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-3 text-left">Role</th>
                    <th className="border border-gray-300 p-3 text-center">Type</th>
                    <th className="border border-gray-300 p-3 text-right">Cost (18 mo)</th>
                    <th className="border border-gray-300 p-3 text-left">Responsibilities</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-3">Founder/CEO</td>
                    <td className="border border-gray-300 p-3 text-center">Full-time</td>
                    <td className="border border-gray-300 p-3 text-right">£36,000*</td>
                    <td className="border border-gray-300 p-3 text-gray-600 text-xs">CEO, PM, QA Lead, Ops, Design Direction</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 p-3">Growth Marketer</td>
                    <td className="border border-gray-300 p-3 text-center">Fractional</td>
                    <td className="border border-gray-300 p-3 text-right">£10,000</td>
                    <td className="border border-gray-300 p-3 text-gray-600 text-xs">Campaign strategy, analytics, paid acquisition</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3">Photographer Success</td>
                    <td className="border border-gray-300 p-3 text-center">Part-time</td>
                    <td className="border border-gray-300 p-3 text-right">£7,000</td>
                    <td className="border border-gray-300 p-3 text-gray-600 text-xs">Onboarding, support, community building</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 p-3">Legal, Accounting, Hosting</td>
                    <td className="border border-gray-300 p-3 text-center">-</td>
                    <td className="border border-gray-300 p-3 text-right">£12,000</td>
                    <td className="border border-gray-300 p-3 text-gray-600 text-xs">Company formation, contracts, infrastructure</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs text-gray-500 mt-2">*Founder salary budgeted separately at £2,000/month</p>
            </section>

            {/* 18-Month Rollout Timeline */}
            <section className="mb-8 print-section">
              <h2 className="text-xl font-bold text-violet-600 mb-4 pb-2 border-b border-gray-300">
                18-Month Rollout Timeline
              </h2>
              
              <table className="w-full border-collapse text-sm mb-4">
                <thead>
                  <tr className="bg-violet-100">
                    <th className="border border-gray-300 p-3 text-left">Phase</th>
                    <th className="border border-gray-300 p-3 text-center">Months</th>
                    <th className="border border-gray-300 p-3 text-left">Focus</th>
                    <th className="border border-gray-300 p-3 text-right">Spend</th>
                    <th className="border border-gray-300 p-3 text-right">Cumulative</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-3 font-semibold">Build + London Prep</td>
                    <td className="border border-gray-300 p-3 text-center">1-5</td>
                    <td className="border border-gray-300 p-3 text-gray-600 text-sm">Native apps development, seed London photographers</td>
                    <td className="border border-gray-300 p-3 text-right">£70,000</td>
                    <td className="border border-gray-300 p-3 text-right">£70,000</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 p-3 font-semibold">🇬🇧 London Launch</td>
                    <td className="border border-gray-300 p-3 text-center">6-9</td>
                    <td className="border border-gray-300 p-3 text-gray-600 text-sm">App Store launch, customer acquisition, prove unit economics</td>
                    <td className="border border-gray-300 p-3 text-right">£45,000</td>
                    <td className="border border-gray-300 p-3 text-right">£115,000</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3 font-semibold">🇫🇷 Paris Expansion</td>
                    <td className="border border-gray-300 p-3 text-center">10-14</td>
                    <td className="border border-gray-300 p-3 text-gray-600 text-sm">European expansion, localization, repeat London playbook</td>
                    <td className="border border-gray-300 p-3 text-right">£50,000</td>
                    <td className="border border-gray-300 p-3 text-right">£165,000</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 p-3 font-semibold">Series A Prep</td>
                    <td className="border border-gray-300 p-3 text-center">15-18</td>
                    <td className="border border-gray-300 p-3 text-gray-600 text-sm">Optimization, data collection, investor outreach</td>
                    <td className="border border-gray-300 p-3 text-right">£35,000</td>
                    <td className="border border-gray-300 p-3 text-right">£200,000</td>
                  </tr>
                </tbody>
              </table>

              <div className="p-4 bg-gray-100 rounded-lg">
                <h4 className="font-bold text-gray-800 mb-2">Monthly Burn Rate</h4>
                <p className="text-gray-700 text-sm">
                  <strong>Average:</strong> £11,000/month | <strong>Peak (dev phase):</strong> £16,000/month | <strong>Steady state:</strong> £9,000/month
                </p>
              </div>
            </section>

            {/* Series A Expansion Plan */}
            <section className="mb-8 print-section">
              <h2 className="text-xl font-bold text-violet-600 mb-4 pb-2 border-b border-gray-300">
                Series A Expansion: European City Roadmap
              </h2>
              
              <p className="text-gray-700 mb-4">
                Pre-seed proves the model in London and Paris. Series A expands to Europe's top tourist destinations 
                with proven playbooks and established operational excellence.
              </p>

              <div className="flex items-center justify-between mb-4">
                <div className="text-center p-4 bg-violet-100 rounded-lg border-2 border-violet-400 flex-1 mx-1">
                  <p className="text-2xl">🇬🇧</p>
                  <p className="font-bold text-violet-700">London</p>
                  <p className="text-xs text-gray-600">21.7M tourists/yr</p>
                  <p className="text-xs font-semibold text-violet-600">Pre-Seed</p>
                </div>
                <span className="text-2xl text-gray-400">→</span>
                <div className="text-center p-4 bg-violet-100 rounded-lg border-2 border-violet-400 flex-1 mx-1">
                  <p className="text-2xl">🇫🇷</p>
                  <p className="font-bold text-violet-700">Paris</p>
                  <p className="text-xs text-gray-600">19.1M tourists/yr</p>
                  <p className="text-xs font-semibold text-violet-600">Pre-Seed</p>
                </div>
                <span className="text-2xl text-gray-400">→</span>
                <div className="text-center p-4 bg-gray-100 rounded-lg border border-gray-300 flex-1 mx-1">
                  <p className="text-2xl">🇮🇹</p>
                  <p className="font-bold text-gray-700">Rome</p>
                  <p className="text-xs text-gray-600">10.1M tourists/yr</p>
                  <p className="text-xs text-gray-500">Series A</p>
                </div>
                <span className="text-2xl text-gray-400">→</span>
                <div className="text-center p-4 bg-gray-100 rounded-lg border border-gray-300 flex-1 mx-1">
                  <p className="text-2xl">🇪🇸</p>
                  <p className="font-bold text-gray-700">Barcelona</p>
                  <p className="text-xs text-gray-600">9.5M tourists/yr</p>
                  <p className="text-xs text-gray-500">Series A</p>
                </div>
                <span className="text-2xl text-gray-400">→</span>
                <div className="text-center p-4 bg-gray-100 rounded-lg border border-gray-300 flex-1 mx-1">
                  <p className="text-2xl">🇳🇱</p>
                  <p className="font-bold text-gray-700">Amsterdam</p>
                  <p className="text-xs text-gray-600">8.3M tourists/yr</p>
                  <p className="text-xs text-gray-500">Series A</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-violet-50 rounded-lg border border-violet-200">
                  <h4 className="font-bold text-violet-700 mb-2">Why These Cities?</h4>
                  <ul className="text-violet-800 text-sm space-y-1">
                    <li>• All in Central European timezone (easy ops)</li>
                    <li>• World-famous photography landmarks</li>
                    <li>• Strong tourist infrastructure</li>
                    <li>• Established freelance photographer markets</li>
                    <li>• 2-3 hour flights from London HQ</li>
                  </ul>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-bold text-blue-700 mb-2">Strategic Advantages</h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Same legal framework (GDPR)</li>
                    <li>• Euro zone simplifies payments (4/5 cities)</li>
                    <li>• Paris 2024 Olympics brand awareness</li>
                    <li>• Eurostar connectivity (London-Paris)</li>
                    <li>• 68.7M combined annual tourists</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Key Milestones & KPIs */}
            <section className="mb-8 print-section page-break">
              <h2 className="text-xl font-bold text-violet-600 mb-4 pb-2 border-b border-gray-300">
                Key Milestones & KPIs
              </h2>
              
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-3 text-left">Milestone</th>
                    <th className="border border-gray-300 p-3 text-center">Target Date</th>
                    <th className="border border-gray-300 p-3 text-left">Success Metric</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-3">Apps in App Stores</td>
                    <td className="border border-gray-300 p-3 text-center">Month 5</td>
                    <td className="border border-gray-300 p-3 text-gray-600">iOS + Android live, passing review</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 p-3">London Photographer Network</td>
                    <td className="border border-gray-300 p-3 text-center">Month 8</td>
                    <td className="border border-gray-300 p-3 text-gray-600">50+ verified photographers</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3">First Revenue</td>
                    <td className="border border-gray-300 p-3 text-center">Month 7</td>
                    <td className="border border-gray-300 p-3 text-gray-600">100+ bookings completed</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 p-3">Paris Launch</td>
                    <td className="border border-gray-300 p-3 text-center">Month 10</td>
                    <td className="border border-gray-300 p-3 text-gray-600">30+ Paris photographers, localized app</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3">2 Cities Proven</td>
                    <td className="border border-gray-300 p-3 text-center">Month 14</td>
                    <td className="border border-gray-300 p-3 text-gray-600">100+ photographers, 1,500+ bookings</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 p-3 font-semibold">Series A Ready</td>
                    <td className="border border-gray-300 p-3 text-center font-semibold">Month 18</td>
                    <td className="border border-gray-300 p-3 text-gray-600 font-semibold">£30k+ monthly GMV, proven unit economics, investor materials</td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* Revenue Model & Projections */}
            <section className="mb-8 print-section">
              <h2 className="text-xl font-bold text-violet-600 mb-4 pb-2 border-b border-gray-300">
                Revenue Model & Projections
              </h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-gray-800 mb-3">Platform Economics</h3>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b border-gray-200">
                        <td className="py-2">Customer Service Fee</td>
                        <td className="py-2 text-right font-semibold text-violet-600">10%</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2">Photographer Commission</td>
                        <td className="py-2 text-right font-semibold text-violet-600">20%</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2">Editing Add-on Commission</td>
                        <td className="py-2 text-right font-semibold text-violet-600">20%</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2 font-semibold">Total Platform Take</td>
                        <td className="py-2 text-right font-bold text-violet-700">30%</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2">Avg Booking Value</td>
                        <td className="py-2 text-right font-semibold">£65</td>
                      </tr>
                      <tr>
                        <td className="py-2">Revenue per Booking</td>
                        <td className="py-2 text-right font-semibold">£19.50</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-3">18-Month Targets</h3>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b border-gray-200">
                        <td className="py-2">Total Photographers</td>
                        <td className="py-2 text-right font-semibold">100-120</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2">Total Bookings</td>
                        <td className="py-2 text-right font-semibold">1,500+</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2">Total GMV</td>
                        <td className="py-2 text-right font-semibold">£97,500</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2">Platform Revenue</td>
                        <td className="py-2 text-right font-semibold">£29,250</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-semibold">Month 18 Run Rate</td>
                        <td className="py-2 text-right font-bold text-violet-700">£10,000/mo</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> Focus during pre-seed is proving product-market fit and building supply, not maximizing revenue. 
                  Revenue scales significantly post-Series A with increased marketing spend and 5-city expansion.
                </p>
              </div>
            </section>

            {/* Why £200k Works */}
            <section className="mb-8 print-section">
              <h2 className="text-xl font-bold text-violet-600 mb-4 pb-2 border-b border-gray-300">
                Why £200k Works
              </h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-bold text-green-700 mb-3">Cost Advantages</h3>
                  <ul className="text-green-800 space-y-2 text-sm">
                    <li>✓ Working prototype (70-80% built)</li>
                    <li>✓ Founder handles QA (12 years exp)</li>
                    <li>✓ AI-assisted design (Replit Agent)</li>
                    <li>✓ Lean contractor model</li>
                    <li>✓ Organic-first marketing</li>
                    <li>✓ 2-city focus (not spread thin)</li>
                    <li>✓ Founder minimal salary (skin in the game)</li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-bold text-blue-700 mb-3">Risk Mitigations</h3>
                  <ul className="text-blue-800 space-y-2 text-sm">
                    <li>→ 12.5% contingency buffer (£25k)</li>
                    <li>→ Proven tech stack (no R&D risk)</li>
                    <li>→ City-by-city validation</li>
                    <li>→ Revenue from Month 7</li>
                    <li>→ 18-month runway (vs typical 12)</li>
                    <li>→ Clear path to Series A</li>
                    <li>→ European focus (lower competition)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Founder Background */}
            <section className="mb-8 print-section">
              <h2 className="text-xl font-bold text-violet-600 mb-4 pb-2 border-b border-gray-300">
                Founder Background
              </h2>
              
              <div className="flex gap-6 items-start">
                <div className="flex-1">
                  <p className="text-gray-700 mb-4">
                    12+ years in Quality Assurance and Software Engineering leadership, with hands-on experience 
                    building and shipping products at scale. Proven track record of:
                  </p>
                  <ul className="text-gray-700 space-y-2 text-sm">
                    <li>• <strong>Technical Leadership:</strong> Led QA teams at major tech companies</li>
                    <li>• <strong>Product Development:</strong> Built SnapNow MVP end-to-end using AI-assisted development</li>
                    <li>• <strong>Startup Experience:</strong> Previous early-stage company experience</li>
                    <li>• <strong>Domain Knowledge:</strong> Active photographer and travel enthusiast</li>
                    <li>• <strong>Full-Stack Capability:</strong> Can ship features without external dependencies</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Footer */}
            <div className="text-center pt-6 border-t-2 border-violet-600">
              <p className="text-2xl font-bold text-violet-600">SnapNow</p>
              <p className="text-gray-600">Connecting Travelers with Professional Photographers</p>
              <p className="text-sm text-gray-500 mt-2">
                Pre-Seed Ask: £200,000 | Runway: 18 months | Goal: 2 cities proven, Series A ready
              </p>
              <p className="text-xs text-gray-400 mt-4">
                Data sources: Internal projections, Euromonitor 2024, industry benchmarks
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
