import { Link, useLocation } from "wouter";
import { ArrowLeft, DollarSign, TrendingUp, Calendar, Info, Lock, Loader2, Clock, CheckCircle2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/bottom-nav";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser, getPhotographerEarningsSummary, getPhotographerEarnings } from "@/lib/api";
import { format } from "date-fns";
import { useEffect } from "react";

interface Earning {
  id: string;
  bookingId: string;
  grossAmount: string;
  platformFee: string;
  netAmount: string;
  status: string;
  releasedAt: Date | null;
  paidAt: Date | null;
  createdAt: Date;
}

export default function PhotographerDashboard() {
  const [, setLocation] = useLocation();
  
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  const { data: photographer, isLoading: photographerLoading } = useQuery({
    queryKey: ["myPhotographerProfile"],
    queryFn: async () => {
      const res = await fetch("/api/photographers/me", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
    enabled: !!user,
  });

  const { data: earningsSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ["earningsSummary", photographer?.id],
    queryFn: () => getPhotographerEarningsSummary(photographer!.id),
    enabled: !!photographer?.id,
  });

  const { data: earnings = [], isLoading: earningsLoading } = useQuery({
    queryKey: ["photographerEarnings", photographer?.id],
    queryFn: () => getPhotographerEarnings(photographer!.id),
    enabled: !!photographer?.id,
  });

  useEffect(() => {
    if (!userLoading && (!user || user.role !== 'photographer')) {
      setLocation("/login");
    }
  }, [user, userLoading, setLocation]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amount);
  };

  const isLoading = userLoading || photographerLoading || summaryLoading;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-6 pt-12 flex items-center gap-4 mb-6">
        <Link href="/photographer-home">
          <button className="w-10 h-10 glass-dark rounded-full flex items-center justify-center text-white hover:bg-white/10" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <h1 className="text-xl font-bold text-white">Earnings & Stats</h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="px-6 space-y-6">
          {/* Main Stats Card - Available Balance */}
          <div className="glass-dark rounded-3xl p-6 border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <DollarSign className="w-32 h-32 text-primary" />
            </div>
            
            <div className="relative z-10">
              <p className="text-muted-foreground text-sm font-medium mb-1">Available Balance</p>
              <h2 className="text-4xl font-bold text-white tracking-tight mb-4" data-testid="text-available-balance">
                {formatCurrency(earningsSummary?.pending || 0)}
              </h2>
              
              <div className="flex gap-3">
                <Button className="flex-1 h-10 bg-white text-black hover:bg-white/90 font-bold rounded-xl text-sm" data-testid="button-withdraw">
                  Withdraw
                </Button>
                <Button className="flex-1 h-10 glass-dark border border-white/10 text-white hover:bg-white/10 font-bold rounded-xl text-sm" data-testid="button-history">
                  History
                </Button>
              </div>
            </div>
          </div>

          {/* Held Earnings Card - Shows if there are held funds */}
          {earningsSummary && earningsSummary.held > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-bold text-sm">Payment on Hold</h3>
                  <span className="text-amber-400 font-bold" data-testid="text-held-amount">{formatCurrency(earningsSummary.held)}</span>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed mt-1">
                  This amount will be released once you upload the photos for your completed sessions.
                </p>
                <Link href="/photographer-bookings">
                  <Button variant="ghost" size="sm" className="mt-2 h-8 px-3 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10" data-testid="button-upload-photos">
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    Upload Photos
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Earnings Breakdown */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-card border border-white/5 rounded-xl p-4 text-center">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-2">
                <DollarSign className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-xs text-muted-foreground mb-1">Total Earned</p>
              <p className="font-bold text-white" data-testid="text-total-earned">{formatCurrency(earningsSummary?.total || 0)}</p>
            </div>
            <div className="bg-card border border-white/5 rounded-xl p-4 text-center">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-2">
                <Lock className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-xs text-muted-foreground mb-1">Held</p>
              <p className="font-bold text-white" data-testid="text-held-breakdown">{formatCurrency(earningsSummary?.held || 0)}</p>
            </div>
            <div className="bg-card border border-white/5 rounded-xl p-4 text-center">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-xs text-muted-foreground mb-1">Paid Out</p>
              <p className="font-bold text-white" data-testid="text-paid-out">{formatCurrency(earningsSummary?.paid || 0)}</p>
            </div>
          </div>

          {/* Platform Fee Explanation */}
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="text-white font-bold text-sm mb-1">How payments work</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                SnapNow takes a <span className="text-white font-bold">20% commission</span> on each booking. Your payment is held until you upload photos, then it becomes available for withdrawal.
              </p>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Recent Earnings
            </h3>
            
            {earningsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : earnings.length === 0 ? (
              <div className="bg-card border border-white/5 rounded-2xl p-6 text-center">
                <DollarSign className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No earnings yet. Complete your first booking to start earning!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {earnings.slice(0, 10).map((earning: Earning) => (
                  <div key={earning.id} className="bg-card border border-white/5 rounded-2xl p-4 flex justify-between items-center" data-testid={`earning-${earning.id}`}>
                    <div>
                      <div className="flex items-center gap-2">
                        {earning.status === 'held' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400">
                            <Lock className="w-3 h-3 mr-1" />
                            Held
                          </span>
                        )}
                        {earning.status === 'pending' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                            <Clock className="w-3 h-3 mr-1" />
                            Available
                          </span>
                        )}
                        {earning.status === 'paid' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Paid
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-muted-foreground text-xs mt-1.5">
                        <Calendar className="w-3 h-3 mr-1" />
                        {format(new Date(earning.createdAt), "MMM d, yyyy")}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block font-bold text-primary text-lg">{formatCurrency(parseFloat(earning.netAmount))}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(parseFloat(earning.grossAmount))} <span className="text-red-400/70">(-{formatCurrency(parseFloat(earning.platformFee))})</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      <BottomNav />
    </div>
  );
}