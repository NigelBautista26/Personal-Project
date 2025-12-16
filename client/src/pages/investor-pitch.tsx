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
          
          .page-break {
            page-break-before: always !important;
            break-before: page !important;
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
            {/* Title Slide */}
            <div className="text-center mb-12 py-8">
              <h1 className="text-5xl font-bold text-violet-400 mb-4">SnapNow</h1>
              <p className="text-2xl text-white mb-2">Uber for Photography</p>
              <p className="text-lg text-gray-400 mb-6">Connecting Tourists with Local Photographers</p>
              <div className="flex justify-center gap-6 mt-8">
                <div className="text-center">
                  <p className="text-3xl font-bold text-violet-400">£200k</p>
                  <p className="text-sm text-gray-500">Pre-Seed Round</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-violet-400">10%</p>
                  <p className="text-sm text-gray-500">Equity</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-violet-400">🇬🇧 🇫🇷</p>
                  <p className="text-sm text-gray-500">London + Paris</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-violet-400">18mo</p>
                  <p className="text-sm text-gray-500">Runway</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-8">Pre-Seed Investor Presentation | December 2025</p>
            </div>

            {/* The Problem */}
            <section className="mb-10 page-break">
              <h2 className="text-2xl font-bold text-violet-400 mb-6 pb-2 border-b border-gray-700">
                The Problem
              </h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-red-900/20 p-5 rounded-lg border border-red-500/30">
                  <h3 className="font-bold text-red-400 mb-4 text-lg">For Tourists</h3>
                  <ul className="text-red-300 space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500">✗</span>
                      <span>Selfies and tourist photos don't capture the magic of travel</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500">✗</span>
                      <span>Finding a good local photographer is risky and time-consuming</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500">✗</span>
                      <span>No easy way to book, pay, or get photos while traveling</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500">✗</span>
                      <span>Language barriers and payment problems with international photographers</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-red-900/20 p-5 rounded-lg border border-red-500/30">
                  <h3 className="font-bold text-red-400 mb-4 text-lg">For Photographers</h3>
                  <ul className="text-red-300 space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500">✗</span>
                      <span>Hard to find consistent clients, especially tourists</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500">✗</span>
                      <span>No platform designed for quick, on-demand photo sessions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500">✗</span>
                      <span>Getting paid by international clients is complicated</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500">✗</span>
                      <span>High marketing costs to reach new customers</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-800/50 rounded-lg text-center">
                <p className="text-gray-300 italic">
                  "78% of millennials say they'd rather spend money on experiences than things"
                </p>
                <p className="text-gray-500 text-sm mt-1">— Harris Poll</p>
              </div>
            </section>

            {/* The Solution */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-violet-400 mb-6 pb-2 border-b border-gray-700">
                The Solution: SnapNow
              </h2>
              
              <p className="text-gray-300 text-lg mb-6 text-center">
                <strong className="text-white">Book a professional photographer as easily as you'd book an Uber</strong>
              </p>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-violet-900/20 p-5 rounded-lg border border-violet-500/30 text-center">
                  <div className="text-4xl mb-3">🔍</div>
                  <h3 className="font-bold text-violet-300 mb-2">Discover</h3>
                  <p className="text-gray-400 text-sm">
                    Find verified local photographers near any tourist spot with real portfolios and reviews
                  </p>
                </div>
                <div className="bg-violet-900/20 p-5 rounded-lg border border-violet-500/30 text-center">
                  <div className="text-4xl mb-3">📱</div>
                  <h3 className="font-bold text-violet-300 mb-2">Book Instantly</h3>
                  <p className="text-gray-400 text-sm">
                    Request sessions in minutes, not days. Photographers respond quickly with live availability
                  </p>
                </div>
                <div className="bg-violet-900/20 p-5 rounded-lg border border-violet-500/30 text-center">
                  <div className="text-4xl mb-3">📸</div>
                  <h3 className="font-bold text-violet-300 mb-2">Get Your Photos</h3>
                  <p className="text-gray-400 text-sm">
                    Professionally edited photos delivered to your personal gallery within hours
                  </p>
                </div>
              </div>
            </section>

            {/* What's Already Built */}
            <section className="mb-10 page-break">
              <h2 className="text-2xl font-bold text-violet-400 mb-6 pb-2 border-b border-gray-700">
                We've Already Built Most of It
              </h2>
              
              <p className="text-gray-300 mb-4">
                Unlike most early-stage companies, we come with a <strong className="text-white">fully working prototype</strong>. 
                You can try it today. This dramatically reduces execution risk.
              </p>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-green-900/20 p-5 rounded-lg border border-green-500/30">
                  <h3 className="font-bold text-green-400 mb-3">✓ Already Working</h3>
                  <ul className="text-green-300 space-y-2 text-sm">
                    <li>✓ User sign up and login</li>
                    <li>✓ Photographer verification system</li>
                    <li>✓ Booking and payment (Stripe)</li>
                    <li>✓ Photo delivery through the app</li>
                    <li>✓ Reviews and star ratings</li>
                    <li>✓ Map showing nearby photographers</li>
                    <li>✓ Live location sharing</li>
                    <li>✓ Photo editing add-on service</li>
                    <li>✓ Admin dashboard</li>
                  </ul>
                </div>
                <div className="bg-blue-900/20 p-5 rounded-lg border border-blue-500/30">
                  <h3 className="font-bold text-blue-400 mb-3">→ What Investment Buys</h3>
                  <ul className="text-blue-300 space-y-2 text-sm">
                    <li>→ iPhone app (App Store)</li>
                    <li>→ Android app (Google Play)</li>
                    <li>→ Push notifications</li>
                    <li>→ Sign up photographers in London + Paris</li>
                    <li>→ Marketing to attract customers</li>
                    <li>→ 18 months to prove it works</li>
                  </ul>
                  <div className="mt-4 p-3 bg-green-900/30 rounded border border-green-500/20">
                    <p className="text-green-300 text-sm font-semibold">
                      70-80% of technical work is already done
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Market Opportunity */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-violet-400 mb-6 pb-2 border-b border-gray-700">
                Market Opportunity
              </h2>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-5 bg-violet-900/30 rounded-lg border border-violet-500/30">
                  <p className="text-4xl font-bold text-violet-400">$37B</p>
                  <p className="text-sm text-gray-400 mt-1">Global Photography Market</p>
                  <p className="text-xs text-gray-500">Growing 4.8% yearly</p>
                </div>
                <div className="text-center p-5 bg-violet-900/30 rounded-lg border border-violet-500/30">
                  <p className="text-4xl font-bold text-violet-400">41M</p>
                  <p className="text-sm text-gray-400 mt-1">Tourists per Year</p>
                  <p className="text-xs text-gray-500">London + Paris combined</p>
                </div>
                <div className="text-center p-5 bg-violet-900/30 rounded-lg border border-violet-500/30">
                  <p className="text-4xl font-bold text-violet-400">1.6M</p>
                  <p className="text-sm text-gray-400 mt-1">Potential Customers</p>
                  <p className="text-xs text-gray-500">4% want professional photos</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-white mb-3">Target Customers</h3>
                  <ul className="text-gray-300 space-y-2 text-sm">
                    <li>• Couples on honeymoons and proposals</li>
                    <li>• Families on vacation</li>
                    <li>• Solo travelers and influencers</li>
                    <li>• Business travelers capturing experiences</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-white mb-3">Why London + Paris First</h3>
                  <ul className="text-gray-300 space-y-2 text-sm">
                    <li>• World's most visited cities</li>
                    <li>• Iconic photo locations (Big Ben, Eiffel Tower)</li>
                    <li>• High concentration of professional photographers</li>
                    <li>• Founder based in London (local knowledge)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Business Model */}
            <section className="mb-10 page-break">
              <h2 className="text-2xl font-bold text-violet-400 mb-6 pb-2 border-b border-gray-700">
                Business Model
              </h2>
              
              <p className="text-gray-300 mb-4">
                We take a small fee from both sides of every booking. This is fair because we help customers find trusted photographers, 
                and help photographers find new clients without marketing costs.
              </p>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-white mb-3">Our Fees</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-violet-900/30 rounded">
                      <span className="text-gray-300">Customer service fee</span>
                      <span className="text-violet-400 font-bold text-xl">10%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-violet-900/30 rounded">
                      <span className="text-gray-300">Photographer commission</span>
                      <span className="text-violet-400 font-bold text-xl">20%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-violet-900/30 rounded">
                      <span className="text-gray-300">Editing add-on</span>
                      <span className="text-violet-400 font-bold text-xl">20%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-violet-900/50 rounded border border-violet-500/30">
                      <span className="text-white font-semibold">Total per booking</span>
                      <span className="text-violet-400 font-bold text-2xl">30%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-white mb-3">Example Booking</h3>
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <table className="w-full text-sm">
                      <tbody>
                        <tr className="border-b border-gray-700">
                          <td className="py-2 text-gray-300">Photographer's rate</td>
                          <td className="py-2 text-right text-white font-semibold">£65</td>
                        </tr>
                        <tr className="border-b border-gray-700">
                          <td className="py-2 text-gray-300">Customer pays (+ 10% fee)</td>
                          <td className="py-2 text-right text-white font-semibold">£71.50</td>
                        </tr>
                        <tr className="border-b border-gray-700">
                          <td className="py-2 text-gray-300">Photographer receives (80%)</td>
                          <td className="py-2 text-right text-white font-semibold">£52</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-white font-semibold">SnapNow keeps</td>
                          <td className="py-2 text-right text-green-400 font-bold text-lg">£19.50</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Same as Airbnb and Uber take rates</p>
                </div>
              </div>
            </section>

            {/* Competitive Advantage */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-violet-400 mb-6 pb-2 border-b border-gray-700">
                Why SnapNow Wins
              </h2>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-green-900/20 p-5 rounded-lg border border-green-500/30">
                  <h3 className="font-bold text-green-400 mb-3">vs. Competitors</h3>
                  <ul className="text-green-300 space-y-2 text-sm">
                    <li>✓ <strong className="text-green-200">50-80% cheaper</strong> than Flytographer</li>
                    <li>✓ Book in minutes, not days of research</li>
                    <li>✓ Verified portfolios and real reviews</li>
                    <li>✓ Photographers keep 80% (vs 65-70%)</li>
                    <li>✓ In-app delivery with permanent gallery</li>
                  </ul>
                </div>
                <div className="bg-blue-900/20 p-5 rounded-lg border border-blue-500/30">
                  <h3 className="font-bold text-blue-400 mb-3">Network Effects</h3>
                  <p className="text-blue-300 text-sm mb-3">
                    Once we reach critical mass in a city, growth becomes self-sustaining:
                  </p>
                  <p className="text-gray-400 text-sm">
                    More photographers → Better coverage → More customers → Higher earnings → More photographers want to join
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-800">
                      <th className="border border-gray-600 p-3 text-left text-gray-300">Platform</th>
                      <th className="border border-gray-600 p-3 text-center text-gray-300">1 Hour Session</th>
                      <th className="border border-gray-600 p-3 text-center text-gray-300">Platform Fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-800/50">
                      <td className="border border-gray-600 p-3 text-gray-300">Flytographer</td>
                      <td className="border border-gray-600 p-3 text-center text-gray-400">£308</td>
                      <td className="border border-gray-600 p-3 text-center text-gray-400">~30%</td>
                    </tr>
                    <tr className="bg-gray-800/30">
                      <td className="border border-gray-600 p-3 text-gray-300">Local Lens</td>
                      <td className="border border-gray-600 p-3 text-center text-gray-400">£220</td>
                      <td className="border border-gray-600 p-3 text-center text-gray-400">~25%</td>
                    </tr>
                    <tr className="bg-violet-900/40">
                      <td className="border border-gray-600 p-3 text-violet-300 font-bold">SnapNow</td>
                      <td className="border border-gray-600 p-3 text-center text-violet-400 font-bold">£40-50</td>
                      <td className="border border-gray-600 p-3 text-center text-violet-400 font-bold">30%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* The Ask */}
            <section className="mb-10 page-break">
              <h2 className="text-2xl font-bold text-violet-400 mb-6 pb-2 border-b border-gray-700">
                The Ask: £200,000 Pre-Seed
              </h2>

              {/* Deal Terms */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-5 bg-violet-900/40 rounded-lg border-2 border-violet-500">
                  <p className="text-4xl font-bold text-violet-400">£200k</p>
                  <p className="text-sm text-gray-400 mt-1">Investment</p>
                </div>
                <div className="text-center p-5 bg-violet-900/40 rounded-lg border-2 border-violet-500">
                  <p className="text-4xl font-bold text-violet-400">10%</p>
                  <p className="text-sm text-gray-400 mt-1">Equity</p>
                </div>
                <div className="text-center p-5 bg-violet-900/40 rounded-lg border-2 border-violet-500">
                  <p className="text-4xl font-bold text-violet-400">£2M</p>
                  <p className="text-sm text-gray-400 mt-1">Pre-Money Valuation</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-bold text-white mb-4">How We'll Spend It</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-6 bg-violet-500 rounded flex items-center justify-center text-xs font-bold">35%</div>
                      <span className="text-gray-300">Building the Apps (£70k)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-6 bg-blue-500 rounded flex items-center justify-center text-xs font-bold">20%</div>
                      <span className="text-gray-300">Marketing (£40k)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-6 bg-green-500 rounded flex items-center justify-center text-xs font-bold">18%</div>
                      <span className="text-gray-300">Founder Salary (£36k)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-6 bg-orange-500 rounded flex items-center justify-center text-xs font-bold">14.5%</div>
                      <span className="text-gray-300">Team & Ops (£29k)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-6 bg-gray-500 rounded flex items-center justify-center text-xs font-bold">12.5%</div>
                      <span className="text-gray-300">Safety Buffer (£25k)</span>
                    </div>
                  </div>
                </div>
                <div className="bg-violet-900/30 p-5 rounded-lg border border-violet-500/30">
                  <h3 className="font-bold text-violet-300 mb-4">What You Get</h3>
                  <ul className="text-violet-200 space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-violet-400">•</span>
                      <span>18 months of runway to prove the model</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-violet-400">•</span>
                      <span>iPhone + Android apps in stores</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-violet-400">•</span>
                      <span>100+ verified photographers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-violet-400">•</span>
                      <span>1,500+ completed bookings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-violet-400">•</span>
                      <span>£10k+ monthly revenue by Month 18</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-violet-400">•</span>
                      <span>Ready to raise Series A for European expansion</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-1">
                <div className="h-4 bg-violet-500 rounded-l" style={{flex: '35'}}></div>
                <div className="h-4 bg-blue-500" style={{flex: '20'}}></div>
                <div className="h-4 bg-green-500" style={{flex: '18'}}></div>
                <div className="h-4 bg-orange-500" style={{flex: '14.5'}}></div>
                <div className="h-4 bg-gray-500 rounded-r" style={{flex: '12.5'}}></div>
              </div>
            </section>

            {/* Roadmap */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-violet-400 mb-6 pb-2 border-b border-gray-700">
                18-Month Roadmap
              </h2>
              
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-24 shrink-0 text-right">
                    <span className="text-violet-400 font-bold">Months 1-5</span>
                  </div>
                  <div className="w-4 h-4 bg-violet-500 rounded-full mt-1 shrink-0"></div>
                  <div className="flex-1 bg-gray-800/50 p-4 rounded-lg">
                    <h3 className="font-bold text-white mb-1">Build the Apps</h3>
                    <p className="text-gray-400 text-sm">Hire developers, build iPhone + Android apps, start recruiting London photographers</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-24 shrink-0 text-right">
                    <span className="text-violet-400 font-bold">Months 6-9</span>
                  </div>
                  <div className="w-4 h-4 bg-blue-500 rounded-full mt-1 shrink-0"></div>
                  <div className="flex-1 bg-gray-800/50 p-4 rounded-lg">
                    <h3 className="font-bold text-white mb-1">🇬🇧 Launch in London</h3>
                    <p className="text-gray-400 text-sm">Apps in stores, 50+ photographers, first paying customers, prove people will pay</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-24 shrink-0 text-right">
                    <span className="text-violet-400 font-bold">Months 10-14</span>
                  </div>
                  <div className="w-4 h-4 bg-green-500 rounded-full mt-1 shrink-0"></div>
                  <div className="flex-1 bg-gray-800/50 p-4 rounded-lg">
                    <h3 className="font-bold text-white mb-1">🇫🇷 Launch in Paris</h3>
                    <p className="text-gray-400 text-sm">Translate app, recruit Paris photographers, repeat London playbook</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-24 shrink-0 text-right">
                    <span className="text-violet-400 font-bold">Months 15-18</span>
                  </div>
                  <div className="w-4 h-4 bg-orange-500 rounded-full mt-1 shrink-0"></div>
                  <div className="flex-1 bg-gray-800/50 p-4 rounded-lg">
                    <h3 className="font-bold text-white mb-1">Prepare for Growth</h3>
                    <p className="text-gray-400 text-sm">100+ photographers, £10k+/month revenue, prepare data pack for Series A</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Future Vision */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-violet-400 mb-6 pb-2 border-b border-gray-700">
                The Bigger Picture
              </h2>
              
              <p className="text-gray-300 mb-4">
                Pre-seed proves it works. Series A expands across Europe. Then the world.
              </p>

              <div className="flex items-center justify-between mb-6">
                <div className="text-center p-3 bg-violet-900/40 rounded-lg border-2 border-violet-500 flex-1 mx-1">
                  <p className="font-bold text-violet-300">Pre-Seed</p>
                  <p className="text-2xl">🇬🇧 🇫🇷</p>
                  <p className="text-xs text-gray-400">London + Paris</p>
                </div>
                <span className="text-xl text-gray-600">→</span>
                <div className="text-center p-3 bg-gray-800/50 rounded-lg border border-gray-600 flex-1 mx-1">
                  <p className="font-bold text-gray-300">Series A</p>
                  <p className="text-2xl">🇮🇹 🇪🇸 🇳🇱</p>
                  <p className="text-xs text-gray-500">Rome, Barcelona, Amsterdam</p>
                </div>
                <span className="text-xl text-gray-600">→</span>
                <div className="text-center p-3 bg-gray-800/50 rounded-lg border border-gray-600 flex-1 mx-1">
                  <p className="font-bold text-gray-300">Series B</p>
                  <p className="text-2xl">🌍</p>
                  <p className="text-xs text-gray-500">50+ Global Destinations</p>
                </div>
              </div>

              <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30">
                <h4 className="font-bold text-blue-400 mb-2">Series A Target (Year 2)</h4>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-xl font-bold text-blue-300">5</p>
                    <p className="text-xs text-gray-400">Cities</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-blue-300">650</p>
                    <p className="text-xs text-gray-400">Photographers</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-blue-300">£1.2M</p>
                    <p className="text-xs text-gray-400">Monthly Bookings</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-blue-300">£360k</p>
                    <p className="text-xs text-gray-400">Monthly Revenue</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Team */}
            <section className="mb-10 page-break">
              <h2 className="text-2xl font-bold text-violet-400 mb-6 pb-2 border-b border-gray-700">
                The Team
              </h2>
              
              <div className="bg-gray-800/50 p-6 rounded-lg">
                <h3 className="font-bold text-white text-lg mb-4">Founder</h3>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li>• <strong className="text-white">12+ years</strong> in software development and quality assurance</li>
                  <li>• Led testing teams at major tech companies</li>
                  <li>• <strong className="text-white">Built the entire SnapNow prototype</strong> - fully working product you can try today</li>
                  <li>• Active photographer and frequent traveler</li>
                  <li>• Can handle product, testing, design, and operations</li>
                  <li>• Taking minimal salary (£2k/month) to maximize runway</li>
                </ul>
              </div>

              <div className="mt-4 p-4 bg-green-900/20 rounded-lg border border-green-500/30">
                <p className="text-green-300 text-sm">
                  <strong className="text-green-200">Why this reduces risk:</strong> The founder can do multiple jobs (product, testing, operations), 
                  has already built the product without outside funding, and is taking a below-market salary to stretch the investment further.
                </p>
              </div>
            </section>

            {/* Key Metrics */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-violet-400 mb-6 pb-2 border-b border-gray-700">
                Key Numbers
              </h2>
              
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-violet-900/30 rounded-lg border border-violet-500/30">
                  <p className="text-2xl font-bold text-violet-400">£200k</p>
                  <p className="text-xs text-gray-400">Investment</p>
                </div>
                <div className="text-center p-4 bg-violet-900/30 rounded-lg border border-violet-500/30">
                  <p className="text-2xl font-bold text-violet-400">18 mo</p>
                  <p className="text-xs text-gray-400">Runway</p>
                </div>
                <div className="text-center p-4 bg-violet-900/30 rounded-lg border border-violet-500/30">
                  <p className="text-2xl font-bold text-violet-400">30%</p>
                  <p className="text-xs text-gray-400">Take Rate</p>
                </div>
                <div className="text-center p-4 bg-violet-900/30 rounded-lg border border-violet-500/30">
                  <p className="text-2xl font-bold text-violet-400">6.5:1</p>
                  <p className="text-xs text-gray-400">LTV:CAC</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <tbody>
                    <tr className="bg-gray-800/50">
                      <td className="border border-gray-600 p-3 text-gray-300">Average booking value</td>
                      <td className="border border-gray-600 p-3 text-right text-white font-semibold">£65</td>
                    </tr>
                    <tr className="bg-gray-800/30">
                      <td className="border border-gray-600 p-3 text-gray-300">Revenue per booking</td>
                      <td className="border border-gray-600 p-3 text-right text-white font-semibold">£19.50</td>
                    </tr>
                    <tr className="bg-gray-800/50">
                      <td className="border border-gray-600 p-3 text-gray-300">Cost to acquire a customer</td>
                      <td className="border border-gray-600 p-3 text-right text-white font-semibold">£5-8</td>
                    </tr>
                    <tr className="bg-gray-800/30">
                      <td className="border border-gray-600 p-3 text-gray-300">Lifetime value per customer</td>
                      <td className="border border-gray-600 p-3 text-right text-white font-semibold">£52</td>
                    </tr>
                    <tr className="bg-gray-800/50">
                      <td className="border border-gray-600 p-3 text-gray-300">Target photographers (Month 18)</td>
                      <td className="border border-gray-600 p-3 text-right text-white font-semibold">100+</td>
                    </tr>
                    <tr className="bg-gray-800/30">
                      <td className="border border-gray-600 p-3 text-gray-300">Target monthly revenue (Month 18)</td>
                      <td className="border border-gray-600 p-3 text-right text-green-400 font-semibold">£10k+</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Closing */}
            <section className="mb-8">
              <div className="text-center p-8 bg-violet-900/30 rounded-lg border border-violet-500/30">
                <h2 className="text-3xl font-bold text-violet-400 mb-4">Let's capture the world's memories, together.</h2>
                <p className="text-gray-300 mb-6">
                  £200,000 to prove SnapNow works in London and Paris.<br/>
                  Then raise more to expand across Europe.
                </p>
                <div className="flex justify-center gap-8">
                  <div>
                    <p className="text-violet-400 font-bold">Companion Documents</p>
                    <p className="text-gray-400 text-sm">/pre-seed-plan - Detailed spending plan</p>
                    <p className="text-gray-400 text-sm">/investor-projections - Financial projections</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer */}
            <div className="text-center pt-6 border-t border-gray-700">
              <p className="text-violet-400 font-bold text-2xl">SnapNow</p>
              <p className="text-gray-400">Connecting Tourists with Professional Photographers</p>
              <p className="text-sm text-gray-600 mt-4">
                Pre-Seed Round | £200,000 for 10% Equity | £2M Valuation | 18 Months | London + Paris
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
