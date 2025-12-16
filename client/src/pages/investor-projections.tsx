import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function InvestorProjections() {
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style>{`
        .investor-projections-page {
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
          
          .investor-projections-page {
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
      <div className="investor-projections-page">
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
            <p className="text-xl text-gray-300">Financial Projections</p>
            <p className="text-sm text-gray-500 mt-2">Pre-Seed (London + Paris) → Series A (European Expansion)</p>
          </div>

          {/* Market Overview */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-violet-400 mb-4 pb-2 border-b border-gray-700">
              Our Target Markets
            </h2>
            <p className="text-gray-300 text-sm mb-4">
              We're starting with London and Paris - two of the world's most visited cities. After proving the business works, 
              we'll expand to Rome, Barcelona, and Amsterdam. These cities together attract <strong className="text-white">69 million tourists per year</strong>.
            </p>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm mb-2">
                <thead>
                  <tr className="bg-violet-900/50">
                    <th className="border border-gray-600 p-3 text-left text-violet-300">City</th>
                    <th className="border border-gray-600 p-3 text-right text-violet-300">Tourists per Year</th>
                    <th className="border border-gray-600 p-3 text-right text-violet-300">Potential Customers*</th>
                    <th className="border border-gray-600 p-3 text-right text-violet-300">Avg Session Price</th>
                    <th className="border border-gray-600 p-3 text-center text-violet-300">When</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-violet-900/30">
                    <td className="border border-gray-600 p-3 text-white font-semibold">🇬🇧 London</td>
                    <td className="border border-gray-600 p-3 text-right text-gray-300">21.7 million</td>
                    <td className="border border-gray-600 p-3 text-right text-gray-300">868,000</td>
                    <td className="border border-gray-600 p-3 text-right text-gray-300">£45</td>
                    <td className="border border-gray-600 p-3 text-center text-violet-400 font-semibold">Pre-Seed</td>
                  </tr>
                  <tr className="bg-violet-900/30">
                    <td className="border border-gray-600 p-3 text-white font-semibold">🇫🇷 Paris</td>
                    <td className="border border-gray-600 p-3 text-right text-gray-300">19.1 million</td>
                    <td className="border border-gray-600 p-3 text-right text-gray-300">764,000</td>
                    <td className="border border-gray-600 p-3 text-right text-gray-300">£43 (€50)</td>
                    <td className="border border-gray-600 p-3 text-center text-violet-400 font-semibold">Pre-Seed</td>
                  </tr>
                  <tr className="bg-gray-800/50">
                    <td className="border border-gray-600 p-3 text-gray-300">🇮🇹 Rome</td>
                    <td className="border border-gray-600 p-3 text-right text-gray-400">10.1 million</td>
                    <td className="border border-gray-600 p-3 text-right text-gray-400">404,000</td>
                    <td className="border border-gray-600 p-3 text-right text-gray-400">£39 (€45)</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-500">Series A</td>
                  </tr>
                  <tr className="bg-gray-800/30">
                    <td className="border border-gray-600 p-3 text-gray-300">🇪🇸 Barcelona</td>
                    <td className="border border-gray-600 p-3 text-right text-gray-400">9.5 million</td>
                    <td className="border border-gray-600 p-3 text-right text-gray-400">380,000</td>
                    <td className="border border-gray-600 p-3 text-right text-gray-400">£38 (€44)</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-500">Series A</td>
                  </tr>
                  <tr className="bg-gray-800/50">
                    <td className="border border-gray-600 p-3 text-gray-300">🇳🇱 Amsterdam</td>
                    <td className="border border-gray-600 p-3 text-right text-gray-400">8.3 million</td>
                    <td className="border border-gray-600 p-3 text-right text-gray-400">332,000</td>
                    <td className="border border-gray-600 p-3 text-right text-gray-400">£42 (€49)</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-500">Series A</td>
                  </tr>
                  <tr className="bg-violet-900/50 font-bold">
                    <td className="border border-gray-600 p-3 text-violet-300">TOTAL (5 Cities)</td>
                    <td className="border border-gray-600 p-3 text-right text-violet-300">68.7 million</td>
                    <td className="border border-gray-600 p-3 text-right text-violet-300">2.75 million</td>
                    <td className="border border-gray-600 p-3 text-right text-violet-300">£41 avg</td>
                    <td className="border border-gray-600 p-3"></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500">
              *Potential Customers = 4% of tourists who want professional photos (industry benchmark for social media-focused travelers)
            </p>
          </section>

          {/* How We Make Money */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-violet-400 mb-4 pb-2 border-b border-gray-700">
              How We Make Money
            </h2>
            <p className="text-gray-300 text-sm mb-4">
              We charge a small fee to both the customer and the photographer. This is fair because we provide value to both sides - 
              customers find trusted photographers, and photographers get new clients without any marketing costs.
            </p>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-white mb-3">Our Fees</h3>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-gray-700">
                      <td className="py-2 text-gray-300">Customer pays us (service fee)</td>
                      <td className="py-2 text-right font-semibold text-violet-400">10%</td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-2 text-gray-300">Photographer pays us (commission)</td>
                      <td className="py-2 text-right font-semibold text-violet-400">20%</td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-2 text-gray-300">Photo editing add-on (optional)</td>
                      <td className="py-2 text-right font-semibold text-violet-400">20%</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-semibold text-white">Total we keep per booking</td>
                      <td className="py-2 text-right font-bold text-violet-400 text-lg">30%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30">
                <h3 className="font-bold text-blue-400 mb-3">How Our Fees Compare</h3>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-gray-700">
                      <td className="py-1 text-gray-300">Airbnb</td>
                      <td className="py-1 text-right text-gray-400">15-17%</td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-1 text-gray-300">Uber</td>
                      <td className="py-1 text-right text-gray-400">25-30%</td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-1 text-gray-300">Flytographer (competitor)</td>
                      <td className="py-1 text-right text-gray-400">~30%</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-white font-semibold">SnapNow</td>
                      <td className="py-1 text-right text-violet-400 font-semibold">30%</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-xs text-blue-300 mt-2">Our 30% is split fairly between both sides</p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-green-900/20 rounded-lg border border-green-500/30">
              <h4 className="font-bold text-green-400 mb-2">Example Booking</h4>
              <p className="text-green-300 text-sm">
                A tourist books a 1-hour session for <strong className="text-green-200">£65</strong>. 
                The customer pays £71.50 (including 10% fee). The photographer receives £52 (after 20% commission). 
                <strong className="text-green-200"> We make £19.50</strong>.
              </p>
            </div>
          </section>

          {/* What Each Photographer Earns Us */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-violet-400 mb-4 pb-2 border-b border-gray-700">
              What Each Photographer Earns Us
            </h2>
            <p className="text-gray-300 text-sm mb-4">
              The more photographers we have on the platform, the more we earn. Here's what we expect each photographer to generate:
            </p>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="border border-gray-600 p-3 text-left text-gray-300">Metric</th>
                    <th className="border border-gray-600 p-3 text-center text-gray-300">Slow Start</th>
                    <th className="border border-gray-600 p-3 text-center text-violet-300">Expected</th>
                    <th className="border border-gray-600 p-3 text-center text-gray-300">Best Case</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-gray-800/50">
                    <td className="border border-gray-600 p-3 text-gray-300">Sessions per day (per photographer)</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-400">1.5</td>
                    <td className="border border-gray-600 p-3 text-center text-white font-semibold">2.0</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-400">2.5</td>
                  </tr>
                  <tr className="bg-gray-800/30">
                    <td className="border border-gray-600 p-3 text-gray-300">Average hourly rate</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-400">£40</td>
                    <td className="border border-gray-600 p-3 text-center text-white font-semibold">£45</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-400">£50</td>
                  </tr>
                  <tr className="bg-gray-800/50">
                    <td className="border border-gray-600 p-3 text-gray-300">Bookings value per day</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-400">£60</td>
                    <td className="border border-gray-600 p-3 text-center text-white font-semibold">£90</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-400">£125</td>
                  </tr>
                  <tr className="bg-gray-800/30">
                    <td className="border border-gray-600 p-3 text-gray-300">Our revenue per day (30%)</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-400">£18</td>
                    <td className="border border-gray-600 p-3 text-center text-violet-400 font-semibold">£27</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-400">£37.50</td>
                  </tr>
                  <tr className="bg-gray-800/50">
                    <td className="border border-gray-600 p-3 text-gray-300">Customers who add editing</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-400">20%</td>
                    <td className="border border-gray-600 p-3 text-center text-white font-semibold">25%</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-400">35%</td>
                  </tr>
                  <tr className="bg-violet-900/30">
                    <td className="border border-gray-600 p-3 text-white font-semibold">Our revenue per photographer/month</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-400">£540</td>
                    <td className="border border-gray-600 p-3 text-center text-violet-400 font-bold text-lg">£810</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-400">£1,125</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Based on 30 active days per month. Professional photographers can realistically do 2-3 sessions per day.
            </p>
          </section>

          {/* Pre-Seed Projections */}
          <section className="mb-8 page-break">
            <h2 className="text-2xl font-bold text-violet-400 mb-4 pb-2 border-b border-gray-700">
              Pre-Seed: 18-Month Projections (London + Paris)
            </h2>
            <p className="text-gray-300 text-sm mb-4">
              With £200,000, we'll launch in London first, then Paris. Here's what we expect to achieve:
            </p>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm mb-4">
                <thead>
                  <tr className="bg-violet-900/50">
                    <th className="border border-gray-600 p-3 text-left text-violet-300">Phase</th>
                    <th className="border border-gray-600 p-3 text-center text-violet-300">Cities</th>
                    <th className="border border-gray-600 p-3 text-center text-violet-300">Photographers</th>
                    <th className="border border-gray-600 p-3 text-center text-violet-300">Bookings/Day</th>
                    <th className="border border-gray-600 p-3 text-right text-violet-300">Monthly Bookings Value</th>
                    <th className="border border-gray-600 p-3 text-right text-violet-300">Our Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-gray-800/50">
                    <td className="border border-gray-600 p-3 text-white font-semibold">Months 1-5</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-400">Building apps</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-400">-</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-400">-</td>
                    <td className="border border-gray-600 p-3 text-right text-gray-400">-</td>
                    <td className="border border-gray-600 p-3 text-right text-gray-400">-</td>
                  </tr>
                  <tr className="bg-gray-800/30">
                    <td className="border border-gray-600 p-3 text-white font-semibold">Months 6-9</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-300">🇬🇧 London</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-300">30-50</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-300">20-40</td>
                    <td className="border border-gray-600 p-3 text-right text-gray-300">£39,000 - £78,000</td>
                    <td className="border border-gray-600 p-3 text-right text-violet-400">£11,700 - £23,400</td>
                  </tr>
                  <tr className="bg-gray-800/50">
                    <td className="border border-gray-600 p-3 text-white font-semibold">Months 10-14</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-300">🇬🇧🇫🇷 London + Paris</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-300">60-80</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-300">50-80</td>
                    <td className="border border-gray-600 p-3 text-right text-gray-300">£97,500 - £156,000</td>
                    <td className="border border-gray-600 p-3 text-right text-violet-400">£29,250 - £46,800</td>
                  </tr>
                  <tr className="bg-gray-800/30">
                    <td className="border border-gray-600 p-3 text-white font-semibold">Months 15-18</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-300">🇬🇧🇫🇷 Both cities growing</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-300">100-120</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-300">80-120</td>
                    <td className="border border-gray-600 p-3 text-right text-gray-300">£156,000 - £234,000</td>
                    <td className="border border-gray-600 p-3 text-right text-violet-400">£46,800 - £70,200</td>
                  </tr>
                  <tr className="bg-violet-900/50 font-bold">
                    <td className="border border-gray-600 p-3 text-violet-300" colSpan={4}>18-Month Totals (Expected Range)</td>
                    <td className="border border-gray-600 p-3 text-right text-violet-300">£585,000 - £936,000</td>
                    <td className="border border-gray-600 p-3 text-right text-violet-300">£175,000 - £281,000</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-violet-900/30 rounded-lg border border-violet-500/30">
                <p className="text-3xl font-bold text-violet-400">100+</p>
                <p className="text-sm text-gray-400">Photographers by Month 18</p>
              </div>
              <div className="text-center p-4 bg-violet-900/30 rounded-lg border border-violet-500/30">
                <p className="text-3xl font-bold text-violet-400">1,500+</p>
                <p className="text-sm text-gray-400">Bookings Completed</p>
              </div>
              <div className="text-center p-4 bg-violet-900/30 rounded-lg border border-violet-500/30">
                <p className="text-3xl font-bold text-violet-400">£10k+</p>
                <p className="text-sm text-gray-400">Monthly Revenue by End</p>
              </div>
            </div>
          </section>

          {/* Series A Projections */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-violet-400 mb-4 pb-2 border-b border-gray-700">
              Series A: European Expansion (Year 2-3)
            </h2>
            <p className="text-gray-300 text-sm mb-4">
              After proving the business works in London and Paris, we'll raise more money to expand across Europe. 
              By the end of Year 2, we expect to be in all 5 cities:
            </p>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm mb-4">
                <thead>
                  <tr className="bg-violet-900/50">
                    <th className="border border-gray-600 p-3 text-left text-violet-300">City</th>
                    <th className="border border-gray-600 p-3 text-center text-violet-300">Photographers</th>
                    <th className="border border-gray-600 p-3 text-center text-violet-300">Bookings/Day</th>
                    <th className="border border-gray-600 p-3 text-right text-violet-300">Monthly Bookings Value</th>
                    <th className="border border-gray-600 p-3 text-right text-violet-300">Our Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-gray-800/50">
                    <td className="border border-gray-600 p-3 text-white font-semibold">🇬🇧 London</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-300">200</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-300">300</td>
                    <td className="border border-gray-600 p-3 text-right text-gray-300">£405,000</td>
                    <td className="border border-gray-600 p-3 text-right text-violet-400">£121,500</td>
                  </tr>
                  <tr className="bg-gray-800/30">
                    <td className="border border-gray-600 p-3 text-white font-semibold">🇫🇷 Paris</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-300">175</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-300">260</td>
                    <td className="border border-gray-600 p-3 text-right text-gray-300">£335,000</td>
                    <td className="border border-gray-600 p-3 text-right text-violet-400">£100,500</td>
                  </tr>
                  <tr className="bg-gray-800/50">
                    <td className="border border-gray-600 p-3 text-gray-300">🇮🇹 Rome</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-400">100</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-400">150</td>
                    <td className="border border-gray-600 p-3 text-right text-gray-400">£175,000</td>
                    <td className="border border-gray-600 p-3 text-right text-gray-400">£52,500</td>
                  </tr>
                  <tr className="bg-gray-800/30">
                    <td className="border border-gray-600 p-3 text-gray-300">🇪🇸 Barcelona</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-400">100</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-400">150</td>
                    <td className="border border-gray-600 p-3 text-right text-gray-400">£171,000</td>
                    <td className="border border-gray-600 p-3 text-right text-gray-400">£51,300</td>
                  </tr>
                  <tr className="bg-gray-800/50">
                    <td className="border border-gray-600 p-3 text-gray-300">🇳🇱 Amsterdam</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-400">75</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-400">110</td>
                    <td className="border border-gray-600 p-3 text-right text-gray-400">£139,000</td>
                    <td className="border border-gray-600 p-3 text-right text-gray-400">£41,700</td>
                  </tr>
                  <tr className="bg-violet-900/50 font-bold">
                    <td className="border border-gray-600 p-3 text-violet-300">TOTAL (Monthly)</td>
                    <td className="border border-gray-600 p-3 text-center text-violet-300">650</td>
                    <td className="border border-gray-600 p-3 text-center text-violet-300">970</td>
                    <td className="border border-gray-600 p-3 text-right text-violet-300">£1.23M</td>
                    <td className="border border-gray-600 p-3 text-right text-violet-300">£367,500</td>
                  </tr>
                  <tr className="bg-green-900/30 font-bold">
                    <td className="border border-gray-600 p-3 text-green-300" colSpan={3}>Year 2 Annual Total</td>
                    <td className="border border-gray-600 p-3 text-right text-green-300">£14.7M</td>
                    <td className="border border-gray-600 p-3 text-right text-green-300">£4.4M</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Key Numbers for Investors */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-violet-400 mb-4 pb-2 border-b border-gray-700">
              Key Numbers for Investors
            </h2>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-violet-900/30 rounded-lg border border-violet-500/30">
                <p className="text-3xl font-bold text-violet-400">1.63M</p>
                <p className="text-sm text-gray-400">Potential Customers</p>
                <p className="text-xs text-gray-500">(London + Paris only)</p>
              </div>
              <div className="text-center p-4 bg-violet-900/30 rounded-lg border border-violet-500/30">
                <p className="text-3xl font-bold text-violet-400">£44</p>
                <p className="text-sm text-gray-400">Average Booking Price</p>
              </div>
              <div className="text-center p-4 bg-violet-900/30 rounded-lg border border-violet-500/30">
                <p className="text-3xl font-bold text-violet-400">30%</p>
                <p className="text-sm text-gray-400">Our Cut Per Booking</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <tbody>
                  <tr className="bg-gray-800/50">
                    <td className="border border-gray-600 p-3 text-gray-300">Cost to get a new customer (ads)</td>
                    <td className="border border-gray-600 p-3 text-right text-white font-semibold">£5-8</td>
                    <td className="border border-gray-600 p-3 text-gray-400 text-xs">Instagram/TikTok ads targeting tourists</td>
                  </tr>
                  <tr className="bg-gray-800/30">
                    <td className="border border-gray-600 p-3 text-gray-300">Value of each customer over time</td>
                    <td className="border border-gray-600 p-3 text-right text-white font-semibold">£52</td>
                    <td className="border border-gray-600 p-3 text-gray-400 text-xs">1.2 sessions average + editing add-on</td>
                  </tr>
                  <tr className="bg-gray-800/50">
                    <td className="border border-gray-600 p-3 text-gray-300">Return on customer acquisition</td>
                    <td className="border border-gray-600 p-3 text-right text-green-400 font-bold">6.5:1</td>
                    <td className="border border-gray-600 p-3 text-gray-400 text-xs">Healthy ratio (above 3:1 is good)</td>
                  </tr>
                  <tr className="bg-gray-800/30">
                    <td className="border border-gray-600 p-3 text-gray-300">Photographers who leave per year</td>
                    <td className="border border-gray-600 p-3 text-right text-white font-semibold">&lt;10%</td>
                    <td className="border border-gray-600 p-3 text-gray-400 text-xs">Low churn because we help them earn money</td>
                  </tr>
                  <tr className="bg-gray-800/50">
                    <td className="border border-gray-600 p-3 text-gray-300">Customers who add photo editing</td>
                    <td className="border border-gray-600 p-3 text-right text-white font-semibold">25%</td>
                    <td className="border border-gray-600 p-3 text-gray-400 text-xs">Extra £15-30 per booking</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* How Our Prices Compare */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-violet-400 mb-4 pb-2 border-b border-gray-700">
              How Our Prices Compare to Competitors
            </h2>
            <p className="text-gray-300 text-sm mb-4">
              We're significantly cheaper than competitors, making professional photography accessible to more travelers. 
              And photographers still keep 80% of their rate.
            </p>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="border border-gray-600 p-3 text-left text-gray-300">Platform</th>
                    <th className="border border-gray-600 p-3 text-center text-gray-300">30 min</th>
                    <th className="border border-gray-600 p-3 text-center text-gray-300">60 min</th>
                    <th className="border border-gray-600 p-3 text-center text-gray-300">90 min</th>
                    <th className="border border-gray-600 p-3 text-center text-gray-300">Their Cut</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-gray-800/50">
                    <td className="border border-gray-600 p-3 text-gray-300">Flytographer</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-400">£260</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-400">£308</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-400">£420</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-400">~30%</td>
                  </tr>
                  <tr className="bg-gray-800/30">
                    <td className="border border-gray-600 p-3 text-gray-300">Local Lens</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-400">-</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-400">£220</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-400">£240</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-400">~25%</td>
                  </tr>
                  <tr className="bg-gray-800/50">
                    <td className="border border-gray-600 p-3 text-gray-300">Snappr</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-400">£71</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-400">£140</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-400">£188</td>
                    <td className="border border-gray-600 p-3 text-center text-gray-400">~35%</td>
                  </tr>
                  <tr className="bg-violet-900/40">
                    <td className="border border-gray-600 p-3 text-violet-300 font-bold">SnapNow</td>
                    <td className="border border-gray-600 p-3 text-center text-violet-400 font-bold">£25</td>
                    <td className="border border-gray-600 p-3 text-center text-violet-400 font-bold">£40-50</td>
                    <td className="border border-gray-600 p-3 text-center text-violet-400 font-bold">£60-75</td>
                    <td className="border border-gray-600 p-3 text-center text-violet-400 font-bold">30%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Our prices are 50-80% lower than competitors. This makes us accessible to budget-conscious travelers 
              while still paying photographers well.
            </p>
          </section>

          {/* The Big Market */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-violet-400 mb-4 pb-2 border-b border-gray-700">
              Why This Market is Growing
            </h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-white mb-3">The Photography Market</h3>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-gray-700">
                      <td className="py-2 text-gray-300">Global market (2024)</td>
                      <td className="py-2 text-right font-semibold text-white">$37.5 billion</td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-2 text-gray-300">Expected by 2030</td>
                      <td className="py-2 text-right font-semibold text-white">$47.5 billion</td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-2 text-gray-300">Yearly growth</td>
                      <td className="py-2 text-right font-semibold text-green-400">4.8%</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-300">Travel/vacation segment</td>
                      <td className="py-2 text-right font-semibold text-white">$10+ billion</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-xs text-gray-500 mt-2">Source: Mordor Intelligence, 2024</p>
              </div>
              <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30">
                <h3 className="font-bold text-blue-400 mb-3">Why It's Growing</h3>
                <ul className="text-blue-300 space-y-2 text-sm">
                  <li>📱 Instagram/TikTok culture - everyone wants great photos</li>
                  <li>✈️ Travel is booming - 2024 had record tourist numbers</li>
                  <li>💰 People spend more on experiences than things</li>
                  <li>🤳 "Everyone in the photo" trend replacing selfies</li>
                  <li>💍 Proposals, anniversaries, family reunions abroad</li>
                  <li>🌍 Remote work = more leisure travel</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Expansion Roadmap */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-violet-400 mb-4 pb-2 border-b border-gray-700">
              Our Growth Plan
            </h2>
            
            <div className="space-y-4">
              <div className="bg-violet-900/30 p-4 rounded-lg border border-violet-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🚀</span>
                  <h3 className="font-bold text-violet-300 text-lg">Pre-Seed (Now - 18 months)</h3>
                </div>
                <p className="text-violet-200 text-sm mb-2">London → Paris</p>
                <p className="text-gray-400 text-sm">Focus on building great apps, getting verified photographers, and proving people will pay for this.</p>
              </div>
              
              <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">📈</span>
                  <h3 className="font-bold text-blue-300 text-lg">Series A (Year 2)</h3>
                </div>
                <p className="text-blue-200 text-sm mb-2">+ Rome, Barcelona, Amsterdam</p>
                <p className="text-gray-400 text-sm">Use what we learned in London/Paris to quickly expand across Europe. Sign up photographers fast.</p>
              </div>
              
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-600">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🌍</span>
                  <h3 className="font-bold text-gray-300 text-lg">Series B (Year 3+)</h3>
                </div>
                <p className="text-gray-400 text-sm mb-2">+ Dubai, Sydney, Singapore, LA, Miami, Prague, Vienna...</p>
                <p className="text-gray-500 text-sm">50+ tourist destinations worldwide, partnerships with hotels and tour operators.</p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="text-center pt-6 border-t border-gray-700">
            <p className="text-violet-400 font-bold text-2xl">SnapNow</p>
            <p className="text-gray-400">Connecting Tourists with Professional Photographers</p>
            <p className="text-xs text-gray-600 mt-4">
              Data sources: VisitBritain, Euromonitor 2024, CRT Paris, Turismo Roma, Mordor Intelligence
            </p>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
