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
            margin: 0.4in; 
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
          
          .investor-projections-page {
            position: static !important;
            overflow: visible !important;
            height: auto !important;
            width: auto !important;
            padding: 0 !important;
            background: white !important;
          }
          
          .print-wrapper {
            max-width: none !important;
          }
          
          .print-content {
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 0.5in !important;
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
            <p className="text-xl text-gray-300">5-City Financial Projections</p>
            <p className="text-sm text-gray-500 mt-2">Investor Data Pack - December 2025</p>
          </div>

          {/* Market Overview */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-violet-400 mb-4 pb-2 border-b border-gray-700">
              Target Market: 5 Global Tourism Capitals
            </h2>
            <p className="text-gray-300 text-sm mb-4">
              Tourism data based on official 2024 statistics from city tourism authorities and national statistics offices.
            </p>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm mb-4">
                <thead>
                  <tr className="bg-violet-900/50">
                    <th className="border border-gray-600 p-3 text-left font-bold text-violet-300">City</th>
                    <th className="border border-gray-600 p-3 text-right font-bold text-violet-300">Int'l Tourists (2024)</th>
                    <th className="border border-gray-600 p-3 text-right font-bold text-violet-300">Photo Market (4%)</th>
                    <th className="border border-gray-600 p-3 text-right font-bold text-violet-300">Avg Session Rate</th>
                    <th className="border border-gray-600 p-3 text-left font-bold text-violet-300">Source</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-gray-800/50">
                    <td className="border border-gray-600 p-3 text-gray-300">🇬🇧 London</td>
                    <td className="border border-gray-600 p-3 text-right text-white font-medium">20.95M</td>
                    <td className="border border-gray-600 p-3 text-right text-green-400">838,000</td>
                    <td className="border border-gray-600 p-3 text-right text-gray-300">£45</td>
                    <td className="border border-gray-600 p-3 text-gray-400 text-xs">VisitBritain, ONS</td>
                  </tr>
                  <tr className="bg-gray-800/30">
                    <td className="border border-gray-600 p-3 text-gray-300">🇫🇷 Paris</td>
                    <td className="border border-gray-600 p-3 text-right text-white font-medium">22.6M</td>
                    <td className="border border-gray-600 p-3 text-right text-green-400">904,000</td>
                    <td className="border border-gray-600 p-3 text-right text-gray-300">€50 (£43)</td>
                    <td className="border border-gray-600 p-3 text-gray-400 text-xs">CRT Paris Île-de-France</td>
                  </tr>
                  <tr className="bg-gray-800/50">
                    <td className="border border-gray-600 p-3 text-gray-300">🇺🇸 New York</td>
                    <td className="border border-gray-600 p-3 text-right text-white font-medium">13.0M</td>
                    <td className="border border-gray-600 p-3 text-right text-green-400">520,000</td>
                    <td className="border border-gray-600 p-3 text-right text-gray-300">$60 (£48)</td>
                    <td className="border border-gray-600 p-3 text-gray-400 text-xs">NYC Tourism + Conventions</td>
                  </tr>
                  <tr className="bg-gray-800/30">
                    <td className="border border-gray-600 p-3 text-gray-300">🇯🇵 Tokyo</td>
                    <td className="border border-gray-600 p-3 text-right text-white font-medium">14.0M</td>
                    <td className="border border-gray-600 p-3 text-right text-green-400">560,000</td>
                    <td className="border border-gray-600 p-3 text-right text-gray-300">¥8,000 (£42)</td>
                    <td className="border border-gray-600 p-3 text-gray-400 text-xs">Tokyo Metro Tourism Data</td>
                  </tr>
                  <tr className="bg-gray-800/50">
                    <td className="border border-gray-600 p-3 text-gray-300">🇮🇹 Rome</td>
                    <td className="border border-gray-600 p-3 text-right text-white font-medium">11.7M</td>
                    <td className="border border-gray-600 p-3 text-right text-green-400">468,000</td>
                    <td className="border border-gray-600 p-3 text-right text-gray-300">€45 (£39)</td>
                    <td className="border border-gray-600 p-3 text-gray-400 text-xs">Turismo Roma Official</td>
                  </tr>
                  <tr className="bg-violet-900/30">
                    <td className="border border-gray-600 p-3 text-violet-300 font-bold">TOTAL</td>
                    <td className="border border-gray-600 p-3 text-right text-violet-300 font-bold">82.25M</td>
                    <td className="border border-gray-600 p-3 text-right text-green-400 font-bold">3.29M</td>
                    <td className="border border-gray-600 p-3 text-right text-violet-300 font-bold">£43 avg</td>
                    <td className="border border-gray-600 p-3"></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-gray-400 text-xs italic">
              * Photo Market assumes 4% of international tourists seek professional photography services (industry benchmark for "Instagram-era" travelers, 2024)
            </p>
          </section>

          {/* Platform Economics */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-violet-400 mb-4 pb-2 border-b border-gray-700">
              Platform Economics
            </h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <h3 className="font-bold text-white mb-3">Revenue Model</h3>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>Platform Commission:</span>
                    <span className="text-green-400 font-bold">20%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Editing Add-on Commission:</span>
                    <span className="text-green-400 font-bold">20%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Avg Session Duration:</span>
                    <span className="text-white">1 hour</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Avg Booking Value:</span>
                    <span className="text-white font-bold">£43</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Platform Revenue/Booking:</span>
                    <span className="text-green-400 font-bold">£8.60</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <h3 className="font-bold text-white mb-3">Industry Benchmarks</h3>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>Airbnb Take Rate:</span>
                    <span className="text-gray-400">15-17%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Flytographer Take Rate:</span>
                    <span className="text-gray-400">~30%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Uber Take Rate:</span>
                    <span className="text-gray-400">25-30%</span>
                  </li>
                  <li className="flex justify-between border-t border-gray-600 pt-2 mt-2">
                    <span className="text-violet-300">SnapNow (Competitive):</span>
                    <span className="text-violet-400 font-bold">20%</span>
                  </li>
                </ul>
                <p className="text-gray-400 text-xs mt-3 italic">
                  Lower commission attracts quality photographers
                </p>
              </div>
            </div>
          </section>

          {/* Photographer Unit Economics */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-violet-400 mb-4 pb-2 border-b border-gray-700">
              Photographer Unit Economics
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-violet-900/50">
                    <th className="border border-gray-600 p-3 text-left font-bold text-violet-300">Metric</th>
                    <th className="border border-gray-600 p-3 text-center font-bold text-violet-300">Conservative</th>
                    <th className="border border-gray-600 p-3 text-center font-bold text-violet-300">Moderate</th>
                    <th className="border border-gray-600 p-3 text-center font-bold text-violet-300">Optimistic</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-gray-800/50">
                    <td className="border border-gray-600 p-3 text-gray-300">Sessions per Photographer/Day</td>
                    <td className="border border-gray-600 p-3 text-center text-white">1.5</td>
                    <td className="border border-gray-600 p-3 text-center text-white">2.0</td>
                    <td className="border border-gray-600 p-3 text-center text-white">2.5</td>
                  </tr>
                  <tr className="bg-gray-800/30">
                    <td className="border border-gray-600 p-3 text-gray-300">Avg Hourly Rate</td>
                    <td className="border border-gray-600 p-3 text-center text-white">£40</td>
                    <td className="border border-gray-600 p-3 text-center text-white">£45</td>
                    <td className="border border-gray-600 p-3 text-center text-white">£50</td>
                  </tr>
                  <tr className="bg-gray-800/50">
                    <td className="border border-gray-600 p-3 text-gray-300">Daily GMV per Photographer</td>
                    <td className="border border-gray-600 p-3 text-center text-white">£60</td>
                    <td className="border border-gray-600 p-3 text-center text-white">£90</td>
                    <td className="border border-gray-600 p-3 text-center text-white">£125</td>
                  </tr>
                  <tr className="bg-gray-800/30">
                    <td className="border border-gray-600 p-3 text-gray-300">Platform Revenue per Photographer/Day</td>
                    <td className="border border-gray-600 p-3 text-center text-green-400">£12</td>
                    <td className="border border-gray-600 p-3 text-center text-green-400">£18</td>
                    <td className="border border-gray-600 p-3 text-center text-green-400">£25</td>
                  </tr>
                  <tr className="bg-gray-800/50">
                    <td className="border border-gray-600 p-3 text-gray-300">Editing Add-on Attach Rate</td>
                    <td className="border border-gray-600 p-3 text-center text-white">20%</td>
                    <td className="border border-gray-600 p-3 text-center text-white">25%</td>
                    <td className="border border-gray-600 p-3 text-center text-white">35%</td>
                  </tr>
                  <tr className="bg-violet-900/30">
                    <td className="border border-gray-600 p-3 text-violet-300 font-bold">Monthly Revenue per Photographer</td>
                    <td className="border border-gray-600 p-3 text-center text-green-400 font-bold">£360</td>
                    <td className="border border-gray-600 p-3 text-center text-green-400 font-bold">£540</td>
                    <td className="border border-gray-600 p-3 text-center text-green-400 font-bold">£750</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-gray-400 text-xs mt-2 italic">
              * Based on 30 active days per month. Professional photographers can realistically complete 2-3 sessions/day accounting for travel, setup, and post-processing.
            </p>
          </section>

          {/* Page Break for Print */}
          <div className="page-break"></div>

          {/* Year 1 Projections */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-violet-400 mb-4 pb-2 border-b border-gray-700">
              Year 1: 5-City Rollout Projections
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm mb-4">
                <thead>
                  <tr className="bg-violet-900/50">
                    <th className="border border-gray-600 p-3 text-left font-bold text-violet-300">Phase</th>
                    <th className="border border-gray-600 p-3 text-center font-bold text-violet-300">Cities</th>
                    <th className="border border-gray-600 p-3 text-center font-bold text-violet-300">Photographers</th>
                    <th className="border border-gray-600 p-3 text-center font-bold text-violet-300">Sessions/Day</th>
                    <th className="border border-gray-600 p-3 text-right font-bold text-violet-300">Monthly GMV</th>
                    <th className="border border-gray-600 p-3 text-right font-bold text-violet-300">Platform Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-gray-800/50">
                    <td className="border border-gray-600 p-3 text-gray-300">Q1 (Launch)</td>
                    <td className="border border-gray-600 p-3 text-center text-white">London</td>
                    <td className="border border-gray-600 p-3 text-center text-white">25</td>
                    <td className="border border-gray-600 p-3 text-center text-white">38</td>
                    <td className="border border-gray-600 p-3 text-right text-white">£49,000</td>
                    <td className="border border-gray-600 p-3 text-right text-green-400">£9,800</td>
                  </tr>
                  <tr className="bg-gray-800/30">
                    <td className="border border-gray-600 p-3 text-gray-300">Q2 (Expand)</td>
                    <td className="border border-gray-600 p-3 text-center text-white">+ Paris</td>
                    <td className="border border-gray-600 p-3 text-center text-white">75</td>
                    <td className="border border-gray-600 p-3 text-center text-white">113</td>
                    <td className="border border-gray-600 p-3 text-right text-white">£146,000</td>
                    <td className="border border-gray-600 p-3 text-right text-green-400">£29,200</td>
                  </tr>
                  <tr className="bg-gray-800/50">
                    <td className="border border-gray-600 p-3 text-gray-300">Q3 (Scale)</td>
                    <td className="border border-gray-600 p-3 text-center text-white">+ New York</td>
                    <td className="border border-gray-600 p-3 text-center text-white">175</td>
                    <td className="border border-gray-600 p-3 text-center text-white">263</td>
                    <td className="border border-gray-600 p-3 text-right text-white">£339,000</td>
                    <td className="border border-gray-600 p-3 text-right text-green-400">£67,800</td>
                  </tr>
                  <tr className="bg-gray-800/30">
                    <td className="border border-gray-600 p-3 text-gray-300">Q4 (Mature)</td>
                    <td className="border border-gray-600 p-3 text-center text-white">+ Tokyo, Rome</td>
                    <td className="border border-gray-600 p-3 text-center text-white">300</td>
                    <td className="border border-gray-600 p-3 text-center text-white">450</td>
                    <td className="border border-gray-600 p-3 text-right text-white">£581,000</td>
                    <td className="border border-gray-600 p-3 text-right text-green-400">£116,200</td>
                  </tr>
                  <tr className="bg-violet-900/30">
                    <td className="border border-gray-600 p-3 text-violet-300 font-bold" colSpan={4}>Year 1 Total</td>
                    <td className="border border-gray-600 p-3 text-right text-violet-300 font-bold">£3.45M GMV</td>
                    <td className="border border-gray-600 p-3 text-right text-green-400 font-bold">£690,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Year 2 Projections */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-violet-400 mb-4 pb-2 border-b border-gray-700">
              Year 2: Mature Market Projections (by City)
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm mb-4">
                <thead>
                  <tr className="bg-violet-900/50">
                    <th className="border border-gray-600 p-3 text-left font-bold text-violet-300">City</th>
                    <th className="border border-gray-600 p-3 text-center font-bold text-violet-300">Active Photographers</th>
                    <th className="border border-gray-600 p-3 text-center font-bold text-violet-300">Sessions/Day</th>
                    <th className="border border-gray-600 p-3 text-right font-bold text-violet-300">Monthly GMV</th>
                    <th className="border border-gray-600 p-3 text-right font-bold text-violet-300">Platform Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-gray-800/50">
                    <td className="border border-gray-600 p-3 text-gray-300">🇬🇧 London</td>
                    <td className="border border-gray-600 p-3 text-center text-white">400</td>
                    <td className="border border-gray-600 p-3 text-center text-white">600</td>
                    <td className="border border-gray-600 p-3 text-right text-white">£810,000</td>
                    <td className="border border-gray-600 p-3 text-right text-green-400">£162,000</td>
                  </tr>
                  <tr className="bg-gray-800/30">
                    <td className="border border-gray-600 p-3 text-gray-300">🇫🇷 Paris</td>
                    <td className="border border-gray-600 p-3 text-center text-white">350</td>
                    <td className="border border-gray-600 p-3 text-center text-white">525</td>
                    <td className="border border-gray-600 p-3 text-right text-white">£677,000</td>
                    <td className="border border-gray-600 p-3 text-right text-green-400">£135,400</td>
                  </tr>
                  <tr className="bg-gray-800/50">
                    <td className="border border-gray-600 p-3 text-gray-300">🇺🇸 New York</td>
                    <td className="border border-gray-600 p-3 text-center text-white">500</td>
                    <td className="border border-gray-600 p-3 text-center text-white">750</td>
                    <td className="border border-gray-600 p-3 text-right text-white">£1,080,000</td>
                    <td className="border border-gray-600 p-3 text-right text-green-400">£216,000</td>
                  </tr>
                  <tr className="bg-gray-800/30">
                    <td className="border border-gray-600 p-3 text-gray-300">🇯🇵 Tokyo</td>
                    <td className="border border-gray-600 p-3 text-center text-white">300</td>
                    <td className="border border-gray-600 p-3 text-center text-white">450</td>
                    <td className="border border-gray-600 p-3 text-right text-white">£567,000</td>
                    <td className="border border-gray-600 p-3 text-right text-green-400">£113,400</td>
                  </tr>
                  <tr className="bg-gray-800/50">
                    <td className="border border-gray-600 p-3 text-gray-300">🇮🇹 Rome</td>
                    <td className="border border-gray-600 p-3 text-center text-white">200</td>
                    <td className="border border-gray-600 p-3 text-center text-white">300</td>
                    <td className="border border-gray-600 p-3 text-right text-white">£351,000</td>
                    <td className="border border-gray-600 p-3 text-right text-green-400">£70,200</td>
                  </tr>
                  <tr className="bg-violet-900/30">
                    <td className="border border-gray-600 p-3 text-violet-300 font-bold">TOTAL (Monthly)</td>
                    <td className="border border-gray-600 p-3 text-center text-violet-300 font-bold">1,750</td>
                    <td className="border border-gray-600 p-3 text-center text-violet-300 font-bold">2,625</td>
                    <td className="border border-gray-600 p-3 text-right text-violet-300 font-bold">£3.49M</td>
                    <td className="border border-gray-600 p-3 text-right text-green-400 font-bold">£697,000</td>
                  </tr>
                  <tr className="bg-green-900/30">
                    <td className="border border-gray-600 p-3 text-green-300 font-bold" colSpan={3}>Year 2 Annual Total</td>
                    <td className="border border-gray-600 p-3 text-right text-green-300 font-bold">£41.8M GMV</td>
                    <td className="border border-gray-600 p-3 text-right text-green-400 font-bold">£8.36M</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Key Investor Metrics */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-violet-400 mb-4 pb-2 border-b border-gray-700">
              Key Investor Metrics
            </h2>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-violet-900/30 p-4 rounded-lg border border-violet-500/30 text-center">
                <p className="text-3xl font-bold text-violet-400">3.29M</p>
                <p className="text-gray-400 text-sm">Serviceable Market (5 Cities)</p>
              </div>
              <div className="bg-green-900/30 p-4 rounded-lg border border-green-500/30 text-center">
                <p className="text-3xl font-bold text-green-400">£43</p>
                <p className="text-gray-400 text-sm">Average Order Value</p>
              </div>
              <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-500/30 text-center">
                <p className="text-3xl font-bold text-blue-400">20%</p>
                <p className="text-gray-400 text-sm">Platform Take Rate</p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <tbody>
                  <tr className="bg-gray-800/50">
                    <td className="border border-gray-600 p-3 text-gray-300">Total Addressable Market (TAM)</td>
                    <td className="border border-gray-600 p-3 text-right text-white font-medium">3.29M photo-seeking tourists (5 cities)</td>
                  </tr>
                  <tr className="bg-gray-800/30">
                    <td className="border border-gray-600 p-3 text-gray-300">Editing Add-on Attach Rate Target</td>
                    <td className="border border-gray-600 p-3 text-right text-white">25% (+£15-30 per booking)</td>
                  </tr>
                  <tr className="bg-gray-800/50">
                    <td className="border border-gray-600 p-3 text-gray-300">Photographer Churn (Target)</td>
                    <td className="border border-gray-600 p-3 text-right text-green-400">&lt;10% annually</td>
                  </tr>
                  <tr className="bg-gray-800/30">
                    <td className="border border-gray-600 p-3 text-gray-300">Customer Acquisition Cost (CAC)</td>
                    <td className="border border-gray-600 p-3 text-right text-white">£5-8 (Instagram/TikTok ads)</td>
                  </tr>
                  <tr className="bg-gray-800/50">
                    <td className="border border-gray-600 p-3 text-gray-300">Customer Lifetime Value (LTV)</td>
                    <td className="border border-gray-600 p-3 text-right text-white">£52 (1.2 sessions avg + editing)</td>
                  </tr>
                  <tr className="bg-green-900/30">
                    <td className="border border-gray-600 p-3 text-green-300 font-bold">LTV:CAC Ratio</td>
                    <td className="border border-gray-600 p-3 text-right text-green-400 font-bold">6.5:1 ✓ (healthy &gt;3:1)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Page Break for Print */}
          <div className="page-break"></div>

          {/* Competitive Pricing */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-violet-400 mb-4 pb-2 border-b border-gray-700">
              Competitive Pricing Analysis
            </h2>
            <p className="text-gray-300 text-sm mb-4">
              SnapNow's pricing is competitive with market leaders while offering better photographer compensation.
            </p>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-violet-900/50">
                    <th className="border border-gray-600 p-3 text-left font-bold text-violet-300">Platform</th>
                    <th className="border border-gray-600 p-3 text-center font-bold text-violet-300">30 min</th>
                    <th className="border border-gray-600 p-3 text-center font-bold text-violet-300">60 min</th>
                    <th className="border border-gray-600 p-3 text-center font-bold text-violet-300">90 min</th>
                    <th className="border border-gray-600 p-3 text-center font-bold text-violet-300">Platform Take</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-gray-800/50">
                    <td className="border border-gray-600 p-3 text-gray-300">Flytographer</td>
                    <td className="border border-gray-600 p-3 text-center text-white">$325 (£260)</td>
                    <td className="border border-gray-600 p-3 text-center text-white">$385 (£308)</td>
                    <td className="border border-gray-600 p-3 text-center text-white">$525 (£420)</td>
                    <td className="border border-gray-600 p-3 text-center text-red-400">~30%</td>
                  </tr>
                  <tr className="bg-gray-800/30">
                    <td className="border border-gray-600 p-3 text-gray-300">Local Lens</td>
                    <td className="border border-gray-600 p-3 text-center text-white">-</td>
                    <td className="border border-gray-600 p-3 text-center text-white">$275 (£220)</td>
                    <td className="border border-gray-600 p-3 text-center text-white">$300 (£240)</td>
                    <td className="border border-gray-600 p-3 text-center text-red-400">~25%</td>
                  </tr>
                  <tr className="bg-gray-800/50">
                    <td className="border border-gray-600 p-3 text-gray-300">Snappr</td>
                    <td className="border border-gray-600 p-3 text-center text-white">$89 (£71)</td>
                    <td className="border border-gray-600 p-3 text-center text-white">$175 (£140)</td>
                    <td className="border border-gray-600 p-3 text-center text-white">$235 (£188)</td>
                    <td className="border border-gray-600 p-3 text-center text-red-400">~35%</td>
                  </tr>
                  <tr className="bg-violet-900/30">
                    <td className="border border-gray-600 p-3 text-violet-300 font-bold">SnapNow (Target)</td>
                    <td className="border border-gray-600 p-3 text-center text-violet-300 font-bold">£25</td>
                    <td className="border border-gray-600 p-3 text-center text-violet-300 font-bold">£40-50</td>
                    <td className="border border-gray-600 p-3 text-center text-violet-300 font-bold">£60-75</td>
                    <td className="border border-gray-600 p-3 text-center text-green-400 font-bold">20%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-gray-400 text-xs mt-2 italic">
              SnapNow's lower prices + lower platform take = more bookings for photographers + higher earnings retention
            </p>
          </section>

          {/* Market Size Context */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-violet-400 mb-4 pb-2 border-b border-gray-700">
              Global Photography Services Market
            </h2>
            
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <h3 className="font-bold text-white mb-3">Market Size (2024-2030)</h3>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>2024 Global Market:</span>
                    <span className="text-white font-bold">$37.5B</span>
                  </li>
                  <li className="flex justify-between">
                    <span>2030 Projected:</span>
                    <span className="text-white font-bold">$47.5B</span>
                  </li>
                  <li className="flex justify-between">
                    <span>CAGR:</span>
                    <span className="text-green-400 font-bold">4.8%</span>
                  </li>
                  <li className="flex justify-between border-t border-gray-600 pt-2 mt-2">
                    <span>Travel/Vacation Segment:</span>
                    <span className="text-violet-400 font-bold">$10B+</span>
                  </li>
                </ul>
                <p className="text-gray-400 text-xs mt-3">Source: Mordor Intelligence, 2024</p>
              </div>
              
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <h3 className="font-bold text-white mb-3">Key Growth Drivers</h3>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li>📱 Instagram/TikTok culture driving demand</li>
                  <li>✈️ Post-COVID travel boom (record 2024 numbers)</li>
                  <li>💰 Travelers spend more on experiences</li>
                  <li>🤳 "Everyone in the photo" trend vs selfies</li>
                  <li>💍 Proposals, anniversaries, family reunions</li>
                  <li>🌍 Remote work = more leisure travel</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Expansion Roadmap */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-violet-400 mb-4 pb-2 border-b border-gray-700">
              Expansion Roadmap
            </h2>
            
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-400 font-bold text-sm">Y1</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Phase 1: Foundation</h4>
                  <p className="text-gray-400 text-sm">London → Paris → New York</p>
                  <p className="text-gray-300 text-sm">Focus on quality, verification, and product-market fit</p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-400 font-bold text-sm">Y2</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Phase 2: Scale</h4>
                  <p className="text-gray-400 text-sm">+ Tokyo, Rome, Barcelona, Dubai</p>
                  <p className="text-gray-300 text-sm">Proven playbook, aggressive photographer acquisition</p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-violet-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-violet-400 font-bold text-sm">Y3</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Phase 3: Global</h4>
                  <p className="text-gray-400 text-sm">+ Sydney, Singapore, LA, Miami, Amsterdam, Prague, Vienna</p>
                  <p className="text-gray-300 text-sm">50+ tourist destinations, enterprise partnerships</p>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="text-center pt-6 border-t border-gray-700">
            <p className="text-gray-400 text-sm">
              SnapNow - Connecting Travelers with Professional Photographers
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Data sources: VisitBritain, CRT Paris, NYC Tourism + Conventions, Tokyo Metro Tourism, Turismo Roma, Mordor Intelligence (2024)
            </p>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
