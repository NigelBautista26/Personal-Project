import { Link } from "wouter";
import { Settings, Bell, Camera, Calendar, DollarSign, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/api";
import { isToday, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";

export default function PhotographerHome() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  const { data: photographer } = useQuery({
    queryKey: ["myPhotographerProfile"],
    queryFn: async () => {
      const res = await fetch("/api/photographers/me", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
    enabled: !!user,
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["photographerBookings", photographer?.id],
    queryFn: async () => {
      const res = await fetch(`/api/bookings/photographer/${photographer?.id}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch bookings");
      return res.json();
    },
    enabled: !!photographer?.id,
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: async (isAvailable: boolean) => {
      const res = await fetch("/api/photographers/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isAvailable }),
      });
      if (!res.ok) throw new Error("Failed to update availability");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myPhotographerProfile"] });
    },
  });

  // Calculate real stats from bookings
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const todaysBookings = bookings.filter((b: any) => 
    isToday(new Date(b.scheduledDate)) && 
    (b.status === 'confirmed' || b.status === 'pending' || b.status === 'completed')
  );

  const thisWeekEarnings = bookings
    .filter((b: any) => 
      b.status === 'completed' && 
      isWithinInterval(new Date(b.scheduledDate), { start: weekStart, end: weekEnd })
    )
    .reduce((sum: number, b: any) => sum + parseFloat(b.photographerEarnings || 0), 0);

  const completedJobsCount = bookings.filter((b: any) => b.status === 'completed').length;

  const stats = {
    todayBookings: todaysBookings.length,
    weekEarnings: thisWeekEarnings,
    rating: photographer?.rating ? parseFloat(photographer.rating) : 5.0,
    totalJobs: completedJobsCount,
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="p-6 pt-12 flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">Welcome back,</p>
          <h1 className="text-2xl font-bold text-white">{user?.fullName || "Photographer"}</h1>
        </div>
        <div className="flex gap-2">
          <button className="w-10 h-10 glass-dark rounded-full flex items-center justify-center text-white hover:bg-white/10" data-testid="button-notifications">
            <Bell className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 glass-dark rounded-full flex items-center justify-center text-white hover:bg-white/10" data-testid="button-settings">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-dark rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Today</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.todayBookings}</p>
            <p className="text-xs text-muted-foreground">Bookings</p>
          </div>
          <div className="glass-dark rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">This Week</span>
            </div>
            <p className="text-2xl font-bold text-white">£{stats.weekEarnings}</p>
            <p className="text-xs text-muted-foreground">Earnings</p>
          </div>
          <div className="glass-dark rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-muted-foreground">Rating</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.rating}</p>
            <p className="text-xs text-muted-foreground">Average</p>
          </div>
          <div className="glass-dark rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Camera className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalJobs}</p>
            <p className="text-xs text-muted-foreground">Jobs Done</p>
          </div>
        </div>

        {/* Availability Toggle */}
        <div className="glass-dark rounded-2xl p-4 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${photographer?.isAvailable ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
            <div>
              <p className="text-white font-medium">
                {photographer?.isAvailable ? "You're Available" : "You're Offline"}
              </p>
              <p className="text-xs text-muted-foreground">
                {photographer?.isAvailable ? "Customers can book you now" : "Customers cannot book you"}
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-white/20 text-white hover:bg-white/10"
            onClick={() => toggleAvailabilityMutation.mutate(!photographer?.isAvailable)}
            disabled={toggleAvailabilityMutation.isPending}
          >
            {photographer?.isAvailable ? "Go Offline" : "Go Online"}
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/dashboard">
            <Button className="w-full h-14 bg-primary hover:bg-primary/90 rounded-xl flex items-center gap-2" data-testid="button-earnings">
              <TrendingUp className="w-5 h-5" />
              View Earnings
            </Button>
          </Link>
          <Link href="/photographer-profile">
            <Button variant="outline" className="w-full h-14 border-white/20 text-white hover:bg-white/10 rounded-xl flex items-center gap-2" data-testid="button-edit-profile">
              <Camera className="w-5 h-5" />
              Edit Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Bottom Navigation for Photographers */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-black/90 backdrop-blur-lg z-50 mx-auto max-w-md">
        <div className="flex justify-around py-4">
          <Link href="/photographer-home">
            <button className="flex flex-col items-center gap-1 text-primary" data-testid="nav-home">
              <Camera className="w-5 h-5" />
              <span className="text-[10px] font-medium">Home</span>
            </button>
          </Link>
          <Link href="/photographer-bookings">
            <button className="flex flex-col items-center gap-1 text-muted-foreground hover:text-white transition-colors" data-testid="nav-bookings">
              <Calendar className="w-5 h-5" />
              <span className="text-[10px] font-medium">Bookings</span>
            </button>
          </Link>
          <Link href="/dashboard">
            <button className="flex flex-col items-center gap-1 text-muted-foreground hover:text-white transition-colors" data-testid="nav-earnings">
              <DollarSign className="w-5 h-5" />
              <span className="text-[10px] font-medium">Earnings</span>
            </button>
          </Link>
          <Link href="/photographer-profile">
            <button className="flex flex-col items-center gap-1 text-muted-foreground hover:text-white transition-colors" data-testid="nav-profile">
              <Settings className="w-5 h-5" />
              <span className="text-[10px] font-medium">Profile</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
