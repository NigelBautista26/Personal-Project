import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Landing() {
  return (
    <div className="fixed inset-0 z-50 min-h-screen w-screen bg-gray-900 text-white overflow-y-auto">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/30 via-gray-900 to-gray-900"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-violet-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-32">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-4">
              <span className="text-violet-400">Snap</span>Now
            </h1>
            <p className="text-xl md:text-2xl text-blue-300 mb-8">
              On Demand Photography, Anytime Anywhere
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/auth">
                <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-lg px-8 py-6">
                  Try the Demo
                </Button>
              </Link>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <p className="text-2xl md:text-3xl font-bold text-violet-400">£200k</p>
                <p className="text-sm text-gray-500">Pre-Seed Round</p>
              </div>
              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <p className="text-2xl md:text-3xl font-bold text-violet-400">10%</p>
                <p className="text-sm text-gray-500">Equity</p>
              </div>
              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <p className="text-2xl md:text-3xl font-bold text-violet-400">🇬🇧 🇫🇷</p>
                <p className="text-sm text-gray-500">London + Paris</p>
              </div>
              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <p className="text-2xl md:text-3xl font-bold text-violet-400">18mo</p>
                <p className="text-sm text-gray-500">Runway</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 md:py-24 bg-gray-800/30">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            The <span className="text-red-400">Problem</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 bg-red-900/20 rounded-xl border border-red-500/30">
              <h3 className="text-xl font-bold text-red-400 mb-4">For Tourists</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Selfies and tourist photos don't capture the magic of travel</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Finding a reliable local photographer is risky and time-consuming</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>No easy way to book, pay, or receive photos while traveling</span>
                </li>
              </ul>
            </div>
            <div className="p-6 bg-red-900/20 rounded-xl border border-red-500/30">
              <h3 className="text-xl font-bold text-red-400 mb-4">For Photographers</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Hard to find consistent clients, especially tourists</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>No platform designed for quick, on-demand sessions</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Getting paid by international clients is complicated</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            The <span className="text-green-400">Solution</span>
          </h2>
          <p className="text-xl text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Book a professional photographer as easily as booking an Uber
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-violet-900/20 rounded-xl border border-violet-500/30 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-violet-300 mb-2">Discover</h3>
              <p className="text-gray-400">
                Find verified local photographers near any tourist spot with real portfolios and reviews
              </p>
            </div>
            <div className="p-6 bg-violet-900/20 rounded-xl border border-violet-500/30 text-center">
              <div className="text-5xl mb-4">📱</div>
              <h3 className="text-xl font-bold text-violet-300 mb-2">Book Instantly</h3>
              <p className="text-gray-400">
                Request sessions in minutes, not days. Secure payment through the app
              </p>
            </div>
            <div className="p-6 bg-violet-900/20 rounded-xl border border-violet-500/30 text-center">
              <div className="text-5xl mb-4">📸</div>
              <h3 className="text-xl font-bold text-violet-300 mb-2">Get Your Photos</h3>
              <p className="text-gray-400">
                Professionally edited photos delivered to your personal gallery within hours
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What's Built Section */}
      <section className="py-16 md:py-24 bg-gray-800/30">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Fully Working <span className="text-violet-400">Prototype</span>
          </h2>
          <p className="text-xl text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            70-80% of the technical work is already done. You can try it today.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 bg-green-900/20 rounded-xl border border-green-500/30">
              <h3 className="text-xl font-bold text-green-400 mb-4">✓ Already Working</h3>
              <ul className="space-y-2 text-green-300 text-sm">
                <li>✓ User signup and login</li>
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
            <div className="p-6 bg-blue-900/20 rounded-xl border border-blue-500/30">
              <h3 className="text-xl font-bold text-blue-400 mb-4">→ What Investment Buys</h3>
              <ul className="space-y-2 text-blue-300 text-sm">
                <li>→ iPhone app (App Store)</li>
                <li>→ Android app (Google Play)</li>
                <li>→ Push notifications</li>
                <li>→ Sign up photographers in London + Paris</li>
                <li>→ Marketing to attract customers</li>
                <li>→ 18 months to prove it works</li>
              </ul>
              <div className="mt-4 p-3 bg-green-900/30 rounded border border-green-500/20">
                <p className="text-green-300 text-sm font-semibold">
                  Lower risk: Most of the product is already built
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Market Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Massive <span className="text-violet-400">Market</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700 text-center">
              <p className="text-4xl font-bold text-violet-400">$37B</p>
              <p className="text-gray-400 mt-2">Global Photography Market</p>
              <p className="text-sm text-gray-500">Growing 4.8% yearly</p>
            </div>
            <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700 text-center">
              <p className="text-4xl font-bold text-violet-400">41M</p>
              <p className="text-gray-400 mt-2">Tourists Per Year</p>
              <p className="text-sm text-gray-500">London + Paris combined</p>
            </div>
            <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700 text-center">
              <p className="text-4xl font-bold text-violet-400">1.6M</p>
              <p className="text-gray-400 mt-2">Potential Customers</p>
              <p className="text-sm text-gray-500">4% want professional photos</p>
            </div>
          </div>

          {/* Expansion Roadmap */}
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
            <div className="p-3 md:p-4 bg-violet-900/40 rounded-lg border-2 border-violet-500 text-center">
              <p className="text-xl md:text-2xl">🇬🇧</p>
              <p className="font-bold text-violet-300 text-sm">London</p>
              <p className="text-xs text-violet-400">Pre-Seed</p>
            </div>
            <span className="text-gray-600 text-xl">→</span>
            <div className="p-3 md:p-4 bg-violet-900/40 rounded-lg border-2 border-violet-500 text-center">
              <p className="text-xl md:text-2xl">🇫🇷</p>
              <p className="font-bold text-violet-300 text-sm">Paris</p>
              <p className="text-xs text-violet-400">Pre-Seed</p>
            </div>
            <span className="text-gray-600 text-xl">→</span>
            <div className="p-3 md:p-4 bg-gray-800/50 rounded-lg border border-gray-600 text-center">
              <p className="text-xl md:text-2xl">🇮🇹</p>
              <p className="font-bold text-gray-400 text-sm">Rome</p>
              <p className="text-xs text-gray-500">Series A</p>
            </div>
            <span className="text-gray-600 text-xl">→</span>
            <div className="p-3 md:p-4 bg-gray-800/50 rounded-lg border border-gray-600 text-center">
              <p className="text-xl md:text-2xl">🇪🇸</p>
              <p className="font-bold text-gray-400 text-sm">Barcelona</p>
              <p className="text-xs text-gray-500">Series A</p>
            </div>
            <span className="text-gray-600 text-xl">→</span>
            <div className="p-3 md:p-4 bg-gray-800/50 rounded-lg border border-gray-600 text-center">
              <p className="text-xl md:text-2xl">🇳🇱</p>
              <p className="font-bold text-gray-400 text-sm">Amsterdam</p>
              <p className="text-xs text-gray-500">Series A</p>
            </div>
          </div>
        </div>
      </section>

      {/* Business Model */}
      <section className="py-16 md:py-24 bg-gray-800/30">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Simple <span className="text-green-400">Business Model</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">Our Fees</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Customer pays us</span>
                  <span className="text-violet-400 font-bold text-xl">10%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Photographer pays us</span>
                  <span className="text-violet-400 font-bold text-xl">20%</span>
                </div>
                <div className="border-t border-gray-600 pt-3 flex justify-between items-center">
                  <span className="text-white font-semibold">Total per booking</span>
                  <span className="text-violet-400 font-bold text-2xl">30%</span>
                </div>
              </div>
            </div>
            <div className="p-6 bg-green-900/20 rounded-xl border border-green-500/30">
              <h3 className="text-xl font-bold text-green-400 mb-4">Example Booking</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Photographer's rate</span>
                  <span className="text-white">£65</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Customer pays</span>
                  <span className="text-white">£71.50</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Photographer receives</span>
                  <span className="text-white">£52</span>
                </div>
                <div className="border-t border-green-500/30 pt-2 flex justify-between">
                  <span className="text-green-300 font-semibold">SnapNow keeps</span>
                  <span className="text-green-400 font-bold text-lg">£19.50</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Ask */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            The <span className="text-violet-400">Investment</span>
          </h2>
          
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-6 bg-violet-900/40 rounded-xl border-2 border-violet-500 text-center">
              <p className="text-3xl md:text-4xl font-bold text-violet-400">£200k</p>
              <p className="text-gray-400 mt-1">Investment</p>
            </div>
            <div className="p-6 bg-violet-900/40 rounded-xl border-2 border-violet-500 text-center">
              <p className="text-3xl md:text-4xl font-bold text-violet-400">10%</p>
              <p className="text-gray-400 mt-1">Equity</p>
            </div>
            <div className="p-6 bg-violet-900/40 rounded-xl border-2 border-violet-500 text-center">
              <p className="text-3xl md:text-4xl font-bold text-violet-400">£2M</p>
              <p className="text-gray-400 mt-1">Valuation</p>
            </div>
          </div>

          <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700 mb-8">
            <h3 className="text-lg font-bold text-white mb-4">18-Month Milestones</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-violet-400">100+</p>
                <p className="text-sm text-gray-400">Photographers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-violet-400">1,500+</p>
                <p className="text-sm text-gray-400">Bookings</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-violet-400">£10k+</p>
                <p className="text-sm text-gray-400">Monthly Revenue</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-violet-400">2</p>
                <p className="text-sm text-gray-400">Cities Live</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <a href="mailto:invest@snapnow.app?subject=Investor%20Pack%20Request&body=Hi%2C%0A%0AI'm%20interested%20in%20learning%20more%20about%20SnapNow's%20pre-seed%20round.%0A%0APlease%20send%20me%20the%20full%20investor%20pack%20including%3A%0A-%20Pitch%20Deck%0A-%20Detailed%20Spending%20Plan%0A-%20Financial%20Projections%0A%0AName%3A%20%0ACompany%2FFund%3A%20%0A%0AThank%20you!">
              <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-lg px-12 py-6">
                Request Investor Pack
              </Button>
            </a>
            <p className="text-gray-500 text-sm">
              Pitch deck, financial projections, and detailed spending plan
            </p>
          </div>
        </div>
      </section>

      {/* Demo Accounts */}
      <section className="py-16 md:py-24 bg-gray-800/30">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Try the <span className="text-violet-400">Demo</span>
          </h2>
          <p className="text-gray-400 mb-8">
            Experience the platform from both customer and photographer perspectives
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
            <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
              <h3 className="font-bold text-white mb-2">Customer Account</h3>
              <p className="text-gray-400 text-sm mb-1">customer@test.com</p>
              <p className="text-gray-500 text-sm">password</p>
            </div>
            <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
              <h3 className="font-bold text-white mb-2">Photographer Account</h3>
              <p className="text-gray-400 text-sm mb-1">anna@snapnow.com</p>
              <p className="text-gray-500 text-sm">password</p>
            </div>
          </div>

          <Link href="/auth">
            <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-lg px-12">
              Try the Demo Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-3xl font-bold mb-2">
            <span className="text-violet-400">Snap</span>Now
          </p>
          <p className="text-gray-400 mb-4">On Demand Photography, Anytime Anywhere</p>
          <p className="text-sm text-gray-600">
            Pre-Seed Round | £200,000 for 10% Equity | £2M Valuation
          </p>
        </div>
      </footer>
    </div>
  );
}
