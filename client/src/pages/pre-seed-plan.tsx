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
          
          .pre-seed-page {
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
      <div className="pre-seed-page">
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
              <p className="text-2xl font-semibold text-white mb-1">£200,000 Investment Plan</p>
              <p className="text-lg text-gray-400">How We'll Spend the Money Over 18 Months</p>
            </div>

            {/* The Big Picture */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-violet-400 mb-4 pb-2 border-b border-gray-700">
                The Big Picture
              </h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                SnapNow connects tourists with local photographers. Think of it as <strong className="text-white">"Uber for Photography"</strong> - 
                travelers open the app, find a nearby photographer, book a session, and get beautiful holiday photos.
              </p>
              <p className="text-gray-300 leading-relaxed mb-4">
                We're asking for £200,000 to build iPhone and Android apps and launch in <strong className="text-white">London and Paris</strong> first. 
                We're starting with just 2 cities so we can focus on getting it right before expanding to more places.
              </p>
              
              <div className="grid grid-cols-5 gap-3 mt-6">
                <div className="text-center p-4 bg-violet-900/30 rounded-lg border border-violet-500/30">
                  <p className="text-2xl font-bold text-violet-400">£200k</p>
                  <p className="text-xs text-gray-400">Investment</p>
                </div>
                <div className="text-center p-4 bg-violet-900/30 rounded-lg border border-violet-500/30">
                  <p className="text-2xl font-bold text-violet-400">10%</p>
                  <p className="text-xs text-gray-400">Equity</p>
                </div>
                <div className="text-center p-4 bg-violet-900/30 rounded-lg border border-violet-500/30">
                  <p className="text-2xl font-bold text-violet-400">£2M</p>
                  <p className="text-xs text-gray-400">Valuation</p>
                </div>
                <div className="text-center p-4 bg-violet-900/30 rounded-lg border border-violet-500/30">
                  <p className="text-2xl font-bold text-violet-400">18</p>
                  <p className="text-xs text-gray-400">Months</p>
                </div>
                <div className="text-center p-4 bg-violet-900/30 rounded-lg border border-violet-500/30">
                  <p className="text-2xl font-bold text-violet-400">2</p>
                  <p className="text-xs text-gray-400">Cities</p>
                </div>
              </div>
            </section>

            {/* We've Already Built Most of It */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-violet-400 mb-4 pb-2 border-b border-gray-700">
                We've Already Built Most of It
              </h2>
              <p className="text-gray-300 mb-4">
                Unlike most early-stage companies that come with just an idea, we already have a <strong className="text-white">fully working prototype</strong>. 
                You can try it today. This means less risk - about <strong className="text-white">70-80% of the technical work is already done</strong>.
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-green-900/20 p-4 rounded-lg border border-green-500/30">
                  <h3 className="font-bold text-green-400 mb-3 text-lg">What's Already Working</h3>
                  <ul className="text-green-300 space-y-1 text-sm">
                    <li>✓ Users can sign up and log in</li>
                    <li>✓ We check photographers are real professionals</li>
                    <li>✓ Customers can book and pay online (via Stripe)</li>
                    <li>✓ Photographers can deliver photos through the app</li>
                    <li>✓ Optional photo editing service</li>
                    <li>✓ Reviews and star ratings</li>
                    <li>✓ Map showing nearby photographers</li>
                    <li>✓ Live location sharing (so people can find each other)</li>
                    <li>✓ Admin tools to manage the platform</li>
                  </ul>
                </div>
                <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30">
                  <h3 className="font-bold text-blue-400 mb-3 text-lg">What the Investment Pays For</h3>
                  <ul className="text-blue-300 space-y-1 text-sm">
                    <li>→ iPhone app (in the App Store)</li>
                    <li>→ Android app (in Google Play)</li>
                    <li>→ Notifications when bookings happen</li>
                    <li>→ Better mobile experience</li>
                    <li>→ Sign up photographers in London + Paris</li>
                    <li>→ Marketing to attract customers</li>
                    <li>→ Grow the team</li>
                    <li>→ Founder salary for 18 months</li>
                    <li>→ 18 months to prove the business works</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We'll Spend the Money */}
            <section className="mb-8 page-break">
              <h2 className="text-2xl font-bold text-violet-400 mb-4 pb-2 border-b border-gray-700">
                How We'll Spend the Money
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm mb-4">
                  <thead>
                    <tr className="bg-violet-900/50">
                      <th className="border border-gray-600 p-3 text-left font-bold text-violet-300">What It's For</th>
                      <th className="border border-gray-600 p-3 text-right font-bold text-violet-300">Amount</th>
                      <th className="border border-gray-600 p-3 text-center font-bold text-violet-300">%</th>
                      <th className="border border-gray-600 p-3 text-left font-bold text-violet-300">More Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-800/50">
                      <td className="border border-gray-600 p-3 text-gray-300">Building the Apps</td>
                      <td className="border border-gray-600 p-3 text-right font-semibold text-white">£70,000</td>
                      <td className="border border-gray-600 p-3 text-center text-gray-300">35%</td>
                      <td className="border border-gray-600 p-3 text-gray-400 text-xs">Hiring developers to build iPhone + Android apps</td>
                    </tr>
                    <tr className="bg-gray-800/30">
                      <td className="border border-gray-600 p-3 text-gray-300">Marketing (London + Paris)</td>
                      <td className="border border-gray-600 p-3 text-right font-semibold text-white">£40,000</td>
                      <td className="border border-gray-600 p-3 text-center text-gray-300">20%</td>
                      <td className="border border-gray-600 p-3 text-gray-400 text-xs">Getting photographers to join and customers to book</td>
                    </tr>
                    <tr className="bg-gray-800/50">
                      <td className="border border-gray-600 p-3 text-gray-300">Founder Salary</td>
                      <td className="border border-gray-600 p-3 text-right font-semibold text-white">£36,000</td>
                      <td className="border border-gray-600 p-3 text-center text-gray-300">18%</td>
                      <td className="border border-gray-600 p-3 text-gray-400 text-xs">£2,000/month - just enough to cover living costs</td>
                    </tr>
                    <tr className="bg-gray-800/30">
                      <td className="border border-gray-600 p-3 text-gray-300">Team & Running Costs</td>
                      <td className="border border-gray-600 p-3 text-right font-semibold text-white">£29,000</td>
                      <td className="border border-gray-600 p-3 text-center text-gray-300">14.5%</td>
                      <td className="border border-gray-600 p-3 text-gray-400 text-xs">Part-time marketing help, legal fees, server costs</td>
                    </tr>
                    <tr className="bg-gray-800/50">
                      <td className="border border-gray-600 p-3 text-gray-300">Safety Buffer</td>
                      <td className="border border-gray-600 p-3 text-right font-semibold text-white">£25,000</td>
                      <td className="border border-gray-600 p-3 text-center text-gray-300">12.5%</td>
                      <td className="border border-gray-600 p-3 text-gray-400 text-xs">For unexpected costs or opportunities</td>
                    </tr>
                    <tr className="bg-violet-900/50 font-bold">
                      <td className="border border-gray-600 p-3 text-violet-300">TOTAL</td>
                      <td className="border border-gray-600 p-3 text-right text-violet-300">£200,000</td>
                      <td className="border border-gray-600 p-3 text-center text-violet-300">100%</td>
                      <td className="border border-gray-600 p-3"></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex gap-1 mt-4">
                <div className="h-6 bg-violet-500 rounded-l" style={{flex: '35'}}></div>
                <div className="h-6 bg-blue-500" style={{flex: '20'}}></div>
                <div className="h-6 bg-green-500" style={{flex: '18'}}></div>
                <div className="h-6 bg-orange-500" style={{flex: '14.5'}}></div>
                <div className="h-6 bg-gray-500 rounded-r" style={{flex: '12.5'}}></div>
              </div>
              <div className="flex gap-4 mt-2 text-xs text-gray-400 justify-center flex-wrap">
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-violet-500 rounded"></span> Apps 35%</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded"></span> Marketing 20%</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded"></span> Founder 18%</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-orange-500 rounded"></span> Team 14.5%</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-500 rounded"></span> Buffer 12.5%</span>
              </div>
            </section>

            {/* App Development */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-violet-400 mb-4 pb-2 border-b border-gray-700">
                App Development: £70,000
              </h2>
              <p className="text-gray-300 mb-4">
                We'll hire skilled developers to turn our working website into proper iPhone and Android apps 
                that people can download from the App Store and Google Play.
              </p>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-800">
                      <th className="border border-gray-600 p-3 text-left text-gray-300">Who We're Hiring</th>
                      <th className="border border-gray-600 p-3 text-center text-gray-300">How Long</th>
                      <th className="border border-gray-600 p-3 text-right text-gray-300">Cost</th>
                      <th className="border border-gray-600 p-3 text-left text-gray-300">What They'll Build</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-800/50">
                      <td className="border border-gray-600 p-3 text-gray-300">Lead App Developer</td>
                      <td className="border border-gray-600 p-3 text-center text-gray-400">5 months</td>
                      <td className="border border-gray-600 p-3 text-right text-white font-semibold">£45,000</td>
                      <td className="border border-gray-600 p-3 text-gray-400 text-xs">iPhone + Android apps, all the screens and features</td>
                    </tr>
                    <tr className="bg-gray-800/30">
                      <td className="border border-gray-600 p-3 text-gray-300">Server Developer (Part-time)</td>
                      <td className="border border-gray-600 p-3 text-center text-gray-400">4 months</td>
                      <td className="border border-gray-600 p-3 text-right text-white font-semibold">£18,000</td>
                      <td className="border border-gray-600 p-3 text-gray-400 text-xs">Make the system faster, add notifications</td>
                    </tr>
                    <tr className="bg-gray-800/50">
                      <td className="border border-gray-600 p-3 text-gray-300">App Store Fees & Tools</td>
                      <td className="border border-gray-600 p-3 text-center text-gray-400">-</td>
                      <td className="border border-gray-600 p-3 text-right text-white font-semibold">£7,000</td>
                      <td className="border border-gray-600 p-3 text-gray-400 text-xs">Apple/Google fees, testing phones, software tools</td>
                    </tr>
                    <tr className="bg-gray-800/30">
                      <td className="border border-gray-600 p-3 text-gray-300">App Design</td>
                      <td className="border border-gray-600 p-3 text-center text-gray-400">Ongoing</td>
                      <td className="border border-gray-600 p-3 text-right text-green-400 font-semibold">£0</td>
                      <td className="border border-gray-600 p-3 text-gray-400 text-xs">Done using AI design tools - no cost</td>
                    </tr>
                    <tr className="bg-gray-800/50">
                      <td className="border border-gray-600 p-3 text-gray-300">Testing & Quality Checks</td>
                      <td className="border border-gray-600 p-3 text-center text-gray-400">Ongoing</td>
                      <td className="border border-gray-600 p-3 text-right text-green-400 font-semibold">£0</td>
                      <td className="border border-gray-600 p-3 text-gray-400 text-xs">Founder does this - 12 years of testing experience</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Marketing */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-violet-400 mb-4 pb-2 border-b border-gray-700">
                Marketing: £40,000 (London + Paris)
              </h2>
              <p className="text-gray-300 mb-4">
                We need both sides of the marketplace: photographers to offer services, and tourists to book them. 
                Here's how we'll attract both.
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-white mb-3">What We'll Pay For</h3>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b border-gray-700">
                        <td className="py-2 text-gray-300">Bonuses for photographers who join</td>
                        <td className="py-2 text-right font-semibold text-white">£16,000</td>
                      </tr>
                      <tr className="border-b border-gray-700">
                        <td className="py-2 text-gray-300">Photography events and meetups</td>
                        <td className="py-2 text-right font-semibold text-white">£10,000</td>
                      </tr>
                      <tr className="border-b border-gray-700">
                        <td className="py-2 text-gray-300">Social media ads and content</td>
                        <td className="py-2 text-right font-semibold text-white">£8,000</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-300">Rewards for referrals</td>
                        <td className="py-2 text-right font-semibold text-white">£6,000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="bg-green-900/20 p-4 rounded-lg border border-green-500/30">
                  <h3 className="font-bold text-green-400 mb-3">Free Marketing Channels</h3>
                  <ul className="text-green-300 space-y-1 text-sm">
                    <li>✓ Partner with hotels and tour companies</li>
                    <li>✓ Work with tourism boards</li>
                    <li>✓ Top photographers promote us for commission</li>
                    <li>✓ Free Instagram and TikTok content</li>
                    <li>✓ Appear in Google searches</li>
                    <li>✓ Wedding planner recommendations</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
                <h4 className="font-bold text-blue-400 mb-2">How We Get Photographers to Join</h4>
                <p className="text-blue-300 text-sm">
                  New photographers get to <strong className="text-blue-200">keep 100% of their earnings for their first 3 bookings</strong> (we normally take 20%). 
                  This gets photographers talking to other photographers, and we build up a good supply of professionals 
                  in each city before we start advertising to tourists.
                </p>
              </div>
            </section>

            {/* Team & Running Costs */}
            <section className="mb-8 page-break">
              <h2 className="text-2xl font-bold text-violet-400 mb-4 pb-2 border-b border-gray-700">
                Team & Running Costs: £29,000
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-800">
                      <th className="border border-gray-600 p-3 text-left text-gray-300">Role</th>
                      <th className="border border-gray-600 p-3 text-center text-gray-300">How Much Work</th>
                      <th className="border border-gray-600 p-3 text-right text-gray-300">Cost (18 months)</th>
                      <th className="border border-gray-600 p-3 text-left text-gray-300">What They Do</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-800/50">
                      <td className="border border-gray-600 p-3 text-gray-300">Marketing Helper</td>
                      <td className="border border-gray-600 p-3 text-center text-gray-400">A few hours/week</td>
                      <td className="border border-gray-600 p-3 text-right text-white font-semibold">£10,000</td>
                      <td className="border border-gray-600 p-3 text-gray-400 text-xs">Helps plan ads and track what's working</td>
                    </tr>
                    <tr className="bg-gray-800/30">
                      <td className="border border-gray-600 p-3 text-gray-300">Photographer Support</td>
                      <td className="border border-gray-600 p-3 text-center text-gray-400">Part-time</td>
                      <td className="border border-gray-600 p-3 text-right text-white font-semibold">£7,000</td>
                      <td className="border border-gray-600 p-3 text-gray-400 text-xs">Helps photographers sign up and answers their questions</td>
                    </tr>
                    <tr className="bg-gray-800/50">
                      <td className="border border-gray-600 p-3 text-gray-300">Legal, Accounting, Servers</td>
                      <td className="border border-gray-600 p-3 text-center text-gray-400">-</td>
                      <td className="border border-gray-600 p-3 text-right text-white font-semibold">£12,000</td>
                      <td className="border border-gray-600 p-3 text-gray-400 text-xs">Set up the company properly, contracts, keep the app running</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 mt-2">Founder salary (£36k) is listed separately in the main budget above.</p>
            </section>

            {/* The Plan: 18 Months */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-violet-400 mb-4 pb-2 border-b border-gray-700">
                The Plan: 18 Months Step by Step
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm mb-4">
                  <thead>
                    <tr className="bg-violet-900/50">
                      <th className="border border-gray-600 p-3 text-left text-violet-300">Phase</th>
                      <th className="border border-gray-600 p-3 text-center text-violet-300">When</th>
                      <th className="border border-gray-600 p-3 text-left text-violet-300">What We're Doing</th>
                      <th className="border border-gray-600 p-3 text-right text-violet-300">Spend</th>
                      <th className="border border-gray-600 p-3 text-right text-violet-300">Total Spent</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-800/50">
                      <td className="border border-gray-600 p-3 font-semibold text-white">Build the Apps</td>
                      <td className="border border-gray-600 p-3 text-center text-gray-400">Months 1-5</td>
                      <td className="border border-gray-600 p-3 text-gray-400 text-sm">Build iPhone + Android apps, start signing up London photographers</td>
                      <td className="border border-gray-600 p-3 text-right text-white">£70,000</td>
                      <td className="border border-gray-600 p-3 text-right text-violet-400">£70,000</td>
                    </tr>
                    <tr className="bg-gray-800/30">
                      <td className="border border-gray-600 p-3 font-semibold text-white">🇬🇧 Launch in London</td>
                      <td className="border border-gray-600 p-3 text-center text-gray-400">Months 6-9</td>
                      <td className="border border-gray-600 p-3 text-gray-400 text-sm">Put apps in stores, get customers booking, prove it works</td>
                      <td className="border border-gray-600 p-3 text-right text-white">£45,000</td>
                      <td className="border border-gray-600 p-3 text-right text-violet-400">£115,000</td>
                    </tr>
                    <tr className="bg-gray-800/50">
                      <td className="border border-gray-600 p-3 font-semibold text-white">🇫🇷 Launch in Paris</td>
                      <td className="border border-gray-600 p-3 text-center text-gray-400">Months 10-14</td>
                      <td className="border border-gray-600 p-3 text-gray-400 text-sm">Expand to Paris, translate the app, repeat what worked in London</td>
                      <td className="border border-gray-600 p-3 text-right text-white">£50,000</td>
                      <td className="border border-gray-600 p-3 text-right text-violet-400">£165,000</td>
                    </tr>
                    <tr className="bg-gray-800/30">
                      <td className="border border-gray-600 p-3 font-semibold text-white">Prepare for Growth</td>
                      <td className="border border-gray-600 p-3 text-center text-gray-400">Months 15-18</td>
                      <td className="border border-gray-600 p-3 text-gray-400 text-sm">Fine-tune everything, gather data, prepare to raise more money</td>
                      <td className="border border-gray-600 p-3 text-right text-white">£35,000</td>
                      <td className="border border-gray-600 p-3 text-right text-violet-400">£200,000</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-gray-800/50 rounded-lg">
                <h4 className="font-bold text-white mb-2">How Fast We'll Spend</h4>
                <p className="text-gray-400 text-sm">
                  <strong className="text-white">On average:</strong> £11,000/month | <strong className="text-white">Highest (while building apps):</strong> £16,000/month | <strong className="text-white">Lowest (steady running):</strong> £9,000/month
                </p>
              </div>
            </section>

            {/* The Bigger Picture */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-violet-400 mb-4 pb-2 border-b border-gray-700">
                The Bigger Picture: Where We Go After This
              </h2>
              
              <p className="text-gray-300 mb-4">
                This investment proves SnapNow works in London and Paris. After that, we'll raise more money to expand 
                across Europe's best tourist cities. We've chosen cities that are close together, have famous landmarks, 
                and attract millions of tourists.
              </p>

              <div className="flex items-center justify-between mb-4">
                <div className="text-center p-3 bg-violet-900/40 rounded-lg border-2 border-violet-500 flex-1 mx-1">
                  <p className="text-2xl">🇬🇧</p>
                  <p className="font-bold text-violet-300">London</p>
                  <p className="text-xs text-gray-400">22M tourists/year</p>
                  <p className="text-xs font-semibold text-violet-400">This Round</p>
                </div>
                <span className="text-xl text-gray-600">→</span>
                <div className="text-center p-3 bg-violet-900/40 rounded-lg border-2 border-violet-500 flex-1 mx-1">
                  <p className="text-2xl">🇫🇷</p>
                  <p className="font-bold text-violet-300">Paris</p>
                  <p className="text-xs text-gray-400">19M tourists/year</p>
                  <p className="text-xs font-semibold text-violet-400">This Round</p>
                </div>
                <span className="text-xl text-gray-600">→</span>
                <div className="text-center p-3 bg-gray-800/50 rounded-lg border border-gray-600 flex-1 mx-1">
                  <p className="text-2xl">🇮🇹</p>
                  <p className="font-bold text-gray-300">Rome</p>
                  <p className="text-xs text-gray-500">10M tourists/year</p>
                  <p className="text-xs text-gray-500">Next Round</p>
                </div>
                <span className="text-xl text-gray-600">→</span>
                <div className="text-center p-3 bg-gray-800/50 rounded-lg border border-gray-600 flex-1 mx-1">
                  <p className="text-2xl">🇪🇸</p>
                  <p className="font-bold text-gray-300">Barcelona</p>
                  <p className="text-xs text-gray-500">10M tourists/year</p>
                  <p className="text-xs text-gray-500">Next Round</p>
                </div>
                <span className="text-xl text-gray-600">→</span>
                <div className="text-center p-3 bg-gray-800/50 rounded-lg border border-gray-600 flex-1 mx-1">
                  <p className="text-2xl">🇳🇱</p>
                  <p className="font-bold text-gray-300">Amsterdam</p>
                  <p className="text-xs text-gray-500">8M tourists/year</p>
                  <p className="text-xs text-gray-500">Next Round</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-violet-900/20 rounded-lg border border-violet-500/30">
                  <h4 className="font-bold text-violet-400 mb-2">Why These Cities?</h4>
                  <ul className="text-violet-300 text-sm space-y-1">
                    <li>• All in similar time zones (easy to manage)</li>
                    <li>• World-famous photo spots</li>
                    <li>• Lots of tourists year-round</li>
                    <li>• Many professional photographers available</li>
                    <li>• 2-3 hour flights from London</li>
                  </ul>
                </div>
                <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
                  <h4 className="font-bold text-blue-400 mb-2">Why This Makes Sense</h4>
                  <ul className="text-blue-300 text-sm space-y-1">
                    <li>• Same privacy laws (easier legally)</li>
                    <li>• Most use Euros (simpler payments)</li>
                    <li>• Paris Olympics gave us brand awareness</li>
                    <li>• Easy train from London to Paris</li>
                    <li>• 69 million tourists combined each year</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* What Success Looks Like */}
            <section className="mb-8 page-break">
              <h2 className="text-2xl font-bold text-violet-400 mb-4 pb-2 border-b border-gray-700">
                What Success Looks Like
              </h2>
              <p className="text-gray-300 mb-4">
                These are the goals we're aiming for. We'll track our progress against these targets.
              </p>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-800">
                      <th className="border border-gray-600 p-3 text-left text-gray-300">What We'll Achieve</th>
                      <th className="border border-gray-600 p-3 text-center text-gray-300">When</th>
                      <th className="border border-gray-600 p-3 text-left text-gray-300">How We'll Know</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-800/50">
                      <td className="border border-gray-600 p-3 text-gray-300">Apps in App Stores</td>
                      <td className="border border-gray-600 p-3 text-center text-violet-400 font-semibold">Month 5</td>
                      <td className="border border-gray-600 p-3 text-gray-400">You can download SnapNow on iPhone and Android</td>
                    </tr>
                    <tr className="bg-gray-800/30">
                      <td className="border border-gray-600 p-3 text-gray-300">London photographers signed up</td>
                      <td className="border border-gray-600 p-3 text-center text-violet-400 font-semibold">Month 8</td>
                      <td className="border border-gray-600 p-3 text-gray-400">50+ verified photographers in London</td>
                    </tr>
                    <tr className="bg-gray-800/50">
                      <td className="border border-gray-600 p-3 text-gray-300">First money coming in</td>
                      <td className="border border-gray-600 p-3 text-center text-violet-400 font-semibold">Month 7</td>
                      <td className="border border-gray-600 p-3 text-gray-400">100+ photo sessions completed and paid for</td>
                    </tr>
                    <tr className="bg-gray-800/30">
                      <td className="border border-gray-600 p-3 text-gray-300">Paris up and running</td>
                      <td className="border border-gray-600 p-3 text-center text-violet-400 font-semibold">Month 10</td>
                      <td className="border border-gray-600 p-3 text-gray-400">30+ photographers in Paris, French translation done</td>
                    </tr>
                    <tr className="bg-gray-800/50">
                      <td className="border border-gray-600 p-3 text-gray-300">Both cities working well</td>
                      <td className="border border-gray-600 p-3 text-center text-violet-400 font-semibold">Month 14</td>
                      <td className="border border-gray-600 p-3 text-gray-400">100+ photographers, 1,500+ bookings total</td>
                    </tr>
                    <tr className="bg-violet-900/30">
                      <td className="border border-gray-600 p-3 text-white font-semibold">Ready for bigger investment</td>
                      <td className="border border-gray-600 p-3 text-center text-violet-400 font-bold">Month 18</td>
                      <td className="border border-gray-600 p-3 text-violet-300 font-semibold">£30k+ in bookings per month, proof the business model works</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* How We Make Money */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-violet-400 mb-4 pb-2 border-b border-gray-700">
                How We Make Money
              </h2>
              <p className="text-gray-300 mb-4">
                We take a percentage of each booking. Both the customer and the photographer pay us a small fee.
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-white mb-3">Our Fees</h3>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b border-gray-700">
                        <td className="py-2 text-gray-300">Customer pays us</td>
                        <td className="py-2 text-right font-semibold text-violet-400">10%</td>
                      </tr>
                      <tr className="border-b border-gray-700">
                        <td className="py-2 text-gray-300">Photographer pays us</td>
                        <td className="py-2 text-right font-semibold text-violet-400">20%</td>
                      </tr>
                      <tr className="border-b border-gray-700">
                        <td className="py-2 text-gray-300">Photo editing fee (optional)</td>
                        <td className="py-2 text-right font-semibold text-violet-400">20%</td>
                      </tr>
                      <tr className="border-b border-gray-700">
                        <td className="py-2 font-semibold text-white">Total we keep from each booking</td>
                        <td className="py-2 text-right font-bold text-violet-400 text-lg">30%</td>
                      </tr>
                      <tr className="border-b border-gray-700">
                        <td className="py-2 text-gray-300">Average booking price</td>
                        <td className="py-2 text-right font-semibold text-white">£65</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-300">We make per booking</td>
                        <td className="py-2 text-right font-semibold text-green-400">£19.50</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div>
                  <h3 className="font-bold text-white mb-3">Our 18-Month Targets</h3>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b border-gray-700">
                        <td className="py-2 text-gray-300">Photographers on platform</td>
                        <td className="py-2 text-right font-semibold text-white">100-120</td>
                      </tr>
                      <tr className="border-b border-gray-700">
                        <td className="py-2 text-gray-300">Total bookings</td>
                        <td className="py-2 text-right font-semibold text-white">1,500+</td>
                      </tr>
                      <tr className="border-b border-gray-700">
                        <td className="py-2 text-gray-300">Total value of bookings</td>
                        <td className="py-2 text-right font-semibold text-white">£97,500</td>
                      </tr>
                      <tr className="border-b border-gray-700">
                        <td className="py-2 text-gray-300">Our revenue (30%)</td>
                        <td className="py-2 text-right font-semibold text-white">£29,250</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-semibold text-white">Monthly revenue by Month 18</td>
                        <td className="py-2 text-right font-bold text-green-400 text-lg">£10,000/mo</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 p-4 bg-orange-900/20 rounded-lg border border-orange-500/30">
                <p className="text-orange-300 text-sm">
                  <strong className="text-orange-200">Important:</strong> At this stage, we're focused on proving the business works, not maximizing profit. 
                  Revenue grows much faster once we've proven the model and can spend more on marketing in more cities.
                </p>
              </div>
            </section>

            {/* Why This Plan Works */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-violet-400 mb-4 pb-2 border-b border-gray-700">
                Why This Plan Works
              </h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-green-900/20 p-4 rounded-lg border border-green-500/30">
                  <h3 className="font-bold text-green-400 mb-3 text-lg">How We Keep Costs Low</h3>
                  <ul className="text-green-300 space-y-2 text-sm">
                    <li>✓ Most of the product is already built</li>
                    <li>✓ Founder does all testing (12 years experience)</li>
                    <li>✓ Using AI tools for design work</li>
                    <li>✓ Hiring contractors, not full-time employees</li>
                    <li>✓ Free marketing first, paid marketing second</li>
                    <li>✓ Starting with just 2 cities, not 5</li>
                    <li>✓ Founder takes minimal salary</li>
                  </ul>
                </div>
                <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30">
                  <h3 className="font-bold text-blue-400 mb-3 text-lg">How We Reduce Risk</h3>
                  <ul className="text-blue-300 space-y-2 text-sm">
                    <li>→ £25,000 saved for unexpected costs</li>
                    <li>→ Technology already tested and working</li>
                    <li>→ Prove it works in one city before expanding</li>
                    <li>→ Start earning money from Month 7</li>
                    <li>→ 18 months is plenty of time (most get 12)</li>
                    <li>→ Clear plan for raising more money</li>
                    <li>→ Less competition in Europe than US</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* About the Founder */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-violet-400 mb-4 pb-2 border-b border-gray-700">
                About the Founder
              </h2>
              
              <p className="text-gray-300 mb-4">
                12+ years working in software, mostly making sure apps work properly before they launch. 
                Built the entire SnapNow product from scratch using modern AI tools.
              </p>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• <strong className="text-white">Technical background:</strong> Led testing teams at major tech companies</li>
                <li>• <strong className="text-white">Built this product:</strong> Created SnapNow end-to-end, it's fully working today</li>
                <li>• <strong className="text-white">Startup experience:</strong> Worked at early-stage companies before</li>
                <li>• <strong className="text-white">Understands the problem:</strong> Active photographer and traveler</li>
                <li>• <strong className="text-white">Can do multiple jobs:</strong> Handles product, testing, design, and operations</li>
              </ul>
            </section>

            {/* Footer */}
            <div className="text-center pt-6 border-t border-gray-700">
              <p className="text-violet-400 font-bold text-2xl">SnapNow</p>
              <p className="text-gray-400">Connecting Tourists with Professional Photographers</p>
              <p className="text-sm text-gray-500 mt-2">
                £200,000 for 10% Equity | £2M Pre-Money Valuation | 18 Months | London + Paris
              </p>
              <p className="text-xs text-gray-600 mt-4">
                Numbers based on: Our own data, Euromonitor 2024, industry research
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
