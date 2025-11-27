import { Link } from "wouter";
import { ArrowLeft, DollarSign, TrendingUp, Calendar, ChevronRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/bottom-nav";

export default function PhotographerDashboard() {
  const recentJobs = [
    { id: 1, client: "Sarah M.", date: "Today, 2:00 PM", amount: "£100.00", fee: "-£20.00", net: "£80.00", status: "Completed" },
    { id: 2, client: "Mike T.", date: "Yesterday", amount: "£50.00", fee: "-£10.00", net: "£40.00", status: "Paid" },
    { id: 3, client: "Jessica W.", date: "Nov 24", amount: "£200.00", fee: "-£40.00", net: "£160.00", status: "Paid" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-6 pt-12 flex items-center gap-4 mb-6">
        <Link href="/home">
          <button className="w-10 h-10 glass-dark rounded-full flex items-center justify-center text-white hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <h1 className="text-xl font-bold text-white">Earnings & Stats</h1>
      </div>

      <div className="px-6 space-y-6">
        {/* Main Stats Card */}
        <div className="glass-dark rounded-3xl p-6 border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <DollarSign className="w-32 h-32 text-primary" />
          </div>
          
          <div className="relative z-10">
            <p className="text-muted-foreground text-sm font-medium mb-1">Available Balance</p>
            <h2 className="text-4xl font-bold text-white tracking-tight mb-4">£280.00</h2>
            
            <div className="flex gap-3">
              <Button className="flex-1 h-10 bg-white text-black hover:bg-white/90 font-bold rounded-xl text-sm">
                Withdraw
              </Button>
              <Button className="flex-1 h-10 glass-dark border border-white/10 text-white hover:bg-white/10 font-bold rounded-xl text-sm">
                History
              </Button>
            </div>
          </div>
        </div>

        {/* Platform Fee Explanation */}
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="text-white font-bold text-sm mb-1">How payments work</h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              SnapNow takes a <span className="text-white font-bold">20% commission</span> on each booking to cover platform costs and marketing. You keep 80% of every job.
            </p>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Recent Earnings
          </h3>
          
          <div className="space-y-3">
            {recentJobs.map((job) => (
              <div key={job.id} className="bg-card border border-white/5 rounded-2xl p-4 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-white text-sm">{job.client}</h4>
                  <div className="flex items-center text-muted-foreground text-xs mt-1">
                    <Calendar className="w-3 h-3 mr-1" />
                    {job.date}
                  </div>
                </div>
                <div className="text-right">
                  <span className="block font-bold text-primary text-lg">{job.net}</span>
                  <span className="text-xs text-muted-foreground">
                    {job.amount} <span className="text-red-400/70">({job.fee})</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Temporary nav for demo purposes */}
      <BottomNav />
    </div>
  );
}