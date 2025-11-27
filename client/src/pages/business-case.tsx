import { useRef } from "react";
import html2pdf from "html2pdf.js";
import { Download, TrendingUp, Users, Zap, DollarSign } from "lucide-react";

export default function BusinessCase() {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = () => {
    if (!contentRef.current) return;

    const element = contentRef.current;
    const opt = {
      margin: 10,
      filename: "SnapNow_Business_Case.pdf",
      image: { type: "png" as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header with Download Button */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">SnapNow Business Case</h1>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
            data-testid="button-download-pdf"
          >
            <Download size={20} />
            Download PDF
          </button>
        </div>

        {/* Content for PDF */}
        <div
          ref={contentRef}
          className="bg-slate-900 rounded-xl p-8 space-y-8"
        >
          {/* Title Page */}
          <div className="text-center py-12 border-b border-slate-700">
            <div className="inline-block mb-6">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                SnapNow
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">
              On-Demand Photography at Your Fingertips
            </h2>
            <p className="text-gray-400 text-lg">
              The Uber for Photography - Connecting Travelers with Professional
              Photographers
            </p>
            <p className="text-gray-500 mt-4">Business Case & Pitch Deck</p>
          </div>

          {/* Executive Summary */}
          <section>
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Zap size={24} className="text-blue-400" />
              Executive Summary
            </h3>
            <div className="bg-slate-800 rounded-lg p-6 space-y-4">
              <p className="text-gray-300">
                SnapNow is a mobile-first platform that connects travelers and
                tourists with professional photographers for on-demand photoshoots
                at popular destinations. Operating on a 20% commission model, we
                capture revenue from both travelers seeking professional photos and
                photographers seeking flexible income opportunities.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-blue-600/20 border border-blue-600 rounded p-3">
                  <div className="text-sm text-gray-400">Commission Model</div>
                  <div className="text-xl font-bold text-blue-400">20% Platform Fee</div>
                </div>
                <div className="bg-green-600/20 border border-green-600 rounded p-3">
                  <div className="text-sm text-gray-400">Target Launch</div>
                  <div className="text-xl font-bold text-green-400">Q2 2026</div>
                </div>
              </div>
            </div>
          </section>

          {/* Problem & Opportunity */}
          <section>
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp size={24} className="text-blue-400" />
              Problem & Opportunity
            </h3>
            <div className="space-y-4">
              <div className="bg-slate-800 rounded-lg p-6">
                <h4 className="font-bold text-blue-300 mb-2">Problem</h4>
                <ul className="text-gray-300 space-y-2">
                  <li>• Travelers spend $2T+ annually on experiences</li>
                  <li>• 78% of travelers struggle to find good photographers</li>
                  <li>• Hiring photographers is complex, time-consuming, and expensive</li>
                  <li>• Photographers face inconsistent income and difficulty finding clients</li>
                </ul>
              </div>
              <div className="bg-slate-800 rounded-lg p-6">
                <h4 className="font-bold text-green-300 mb-2">Opportunity</h4>
                <ul className="text-gray-300 space-y-2">
                  <li>• Global photography market: $10B+ annually</li>
                  <li>• 1.4B international tourists annually (growing 4% YoY)</li>
                  <li>• On-demand service model proven by Uber, TaskRabbit, Fiverr</li>
                  <li>• Photographers seeking flexible income opportunities: 2M+ globally</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Business Model */}
          <section>
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <DollarSign size={24} className="text-blue-400" />
              Business Model
            </h3>
            <div className="bg-slate-800 rounded-lg p-6 space-y-4">
              <div>
                <h4 className="font-bold text-blue-300 mb-3">Revenue Streams</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                    <span>Platform Commission (20%)</span>
                    <span className="text-blue-400 font-bold">Primary</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                    <span>Photographer Premium Features</span>
                    <span className="text-blue-400 font-bold">Secondary</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                    <span>Branded Content / Sponsorships</span>
                    <span className="text-blue-400 font-bold">Tertiary</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Travel Brand Partnerships</span>
                    <span className="text-blue-400 font-bold">Future</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 bg-blue-600/10 border border-blue-600 rounded p-4">
                <h4 className="font-bold text-blue-300 mb-2">Commission Breakdown Example</h4>
                <div className="text-sm space-y-1 text-gray-300">
                  <div className="flex justify-between">
                    <span>Customer pays for 2-hour photoshoot:</span>
                    <span className="font-bold">£100</span>
                  </div>
                  <div className="flex justify-between text-green-400">
                    <span>+ Photographer receives (80%):</span>
                    <span className="font-bold">£80</span>
                  </div>
                  <div className="flex justify-between text-blue-400">
                    <span>+ SnapNow commission (20%):</span>
                    <span className="font-bold">£20</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Target Market */}
          <section>
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Users size={24} className="text-blue-400" />
              Target Market
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800 rounded-lg p-6">
                <h4 className="font-bold text-blue-300 mb-3">Primary Users</h4>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li>• Travelers aged 25-45</li>
                  <li>• Couples on vacation</li>
                  <li>• Instagram influencers</li>
                  <li>• Digital nomads</li>
                  <li>• Tourist destinations</li>
                </ul>
              </div>
              <div className="bg-slate-800 rounded-lg p-6">
                <h4 className="font-bold text-green-300 mb-3">Photographers</h4>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li>• Freelance photographers</li>
                  <li>• Semi-professional creatives</li>
                  <li>• Photography students</li>
                  <li>• Location-based professionals</li>
                  <li>• Flexible income seekers</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Launch Strategy */}
          <section>
            <h3 className="text-2xl font-bold mb-4">Launch Strategy</h3>
            <div className="space-y-3">
              <div className="bg-slate-800 rounded-lg p-4">
                <div className="font-bold text-blue-300 mb-1">Phase 1: MVP (Q1 2026)</div>
                <p className="text-sm text-gray-300">
                  Launch in London with 50 vetted photographers. Focus on Instagram-worthy locations.
                </p>
              </div>
              <div className="bg-slate-800 rounded-lg p-4">
                <div className="font-bold text-blue-300 mb-1">Phase 2: Scale (Q2-Q3 2026)</div>
                <p className="text-sm text-gray-300">
                  Expand to 3 major cities (Barcelona, Paris, Tokyo). Target 500+ photographers.
                </p>
              </div>
              <div className="bg-slate-800 rounded-lg p-4">
                <div className="font-bold text-blue-300 mb-1">Phase 3: Growth (Q4 2026+)</div>
                <p className="text-sm text-gray-300">
                  National expansion, international markets, premium features, partnerships.
                </p>
              </div>
            </div>
          </section>

          {/* Financial Projections */}
          <section>
            <h3 className="text-2xl font-bold mb-4">Financial Projections (Year 1)</h3>
            <div className="bg-slate-800 rounded-lg p-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                  <span>Target Bookings (Year 1)</span>
                  <span className="font-bold text-blue-400">2,000 shoots</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                  <span>Avg. Booking Value</span>
                  <span className="font-bold text-blue-400">£75</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                  <span>Total GMV</span>
                  <span className="font-bold text-green-400">£150,000</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span>Platform Revenue (20% commission)</span>
                  <span className="font-bold text-green-400">£30,000</span>
                </div>
              </div>
            </div>
          </section>

          {/* Competitive Advantage */}
          <section>
            <h3 className="text-2xl font-bold mb-4">Competitive Advantages</h3>
            <div className="space-y-3">
              <div className="bg-blue-600/10 border border-blue-600 rounded-lg p-4">
                <div className="font-bold text-blue-300">Mobile-First Design</div>
                <p className="text-sm text-gray-300">Built for travelers, not photographers</p>
              </div>
              <div className="bg-blue-600/10 border border-blue-600 rounded-lg p-4">
                <div className="font-bold text-blue-300">Transparent Commission</div>
                <p className="text-sm text-gray-300">Clear 20% model photographers understand</p>
              </div>
              <div className="bg-blue-600/10 border border-blue-600 rounded-lg p-4">
                <div className="font-bold text-blue-300">Location-First Approach</div>
                <p className="text-sm text-gray-300">Discovery through maps and destinations</p>
              </div>
              <div className="bg-blue-600/10 border border-blue-600 rounded-lg p-4">
                <div className="font-bold text-blue-300">Portfolio Showcase</div>
                <p className="text-sm text-gray-300">Instagram-style galleries build trust</p>
              </div>
            </div>
          </section>

          {/* Funding & Use of Funds */}
          <section>
            <h3 className="text-2xl font-bold mb-4">Funding Requirements</h3>
            <div className="bg-slate-800 rounded-lg p-6">
              <div className="space-y-2 text-gray-300">
                <div className="flex justify-between pb-2 border-b border-slate-700">
                  <span>Product Development (MVP)</span>
                  <span className="font-bold">£50,000</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-700">
                  <span>Marketing & User Acquisition</span>
                  <span className="font-bold">£40,000</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-700">
                  <span>Operations & Team</span>
                  <span className="font-bold">£30,000</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-700">
                  <span>Legal & Compliance</span>
                  <span className="font-bold">£10,000</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="font-bold">Total Seed Funding</span>
                  <span className="font-bold text-blue-400">£130,000</span>
                </div>
              </div>
            </div>
          </section>

          {/* Closing */}
          <div className="text-center py-8 border-t border-slate-700">
            <p className="text-gray-400 mb-2">SnapNow is positioned to capture the</p>
            <p className="text-xl font-bold text-blue-400">
              £10B+ global photography market
            </p>
            <p className="text-gray-400 mt-4">
              by connecting travelers with photographers on-demand.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
