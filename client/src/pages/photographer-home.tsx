import { Link } from "wouter";
import { Camera, Calendar, DollarSign, Star, TrendingUp, MapPin, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/api";
import { isToday, startOfWeek, endOfWeek, isWithinInterval, format } from "date-fns";

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

  // Get status display info
  const getStatusInfo = () => {
    if (photographer?.sessionState === 'in_session') {
      const nextTime = photographer.nextAvailableAt 
        ? format(new Date(photographer.nextAvailableAt), 'h:mm a')
        : '';
      return {
        color: 'bg-yellow-500',
        text: 'In Session',
        subtext: nextTime ? `Free at ${nextTime}` : 'Currently shooting',
        animate: true,
      };
    } else if (photographer?.sessionState === 'available') {
      return {
        color: 'bg-green-500',
        text: 'Available',
        subtext: 'Ready for bookings',
        animate: true,
      };
    } else {
      return {
        color: 'bg-gray-500',
        text: 'Offline',
        subtext: 'Not accepting bookings',
        animate: false,
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Header with Profile */}
      <div className="p-6 pt-12">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Profile Picture */}
            <div className="relative">
              {photographer?.profileImageUrl ? (
                <img 
                  src={photographer.profileImageUrl} 
                  alt={user?.fullName || "Profile"} 
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary/50"
                  data-testid="profile-avatar"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/50">
                  <Camera className="w-8 h-8 text-primary" />
                </div>
              )}
              {/* Status indicator on avatar */}
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${statusInfo.color} border-2 border-background ${statusInfo.animate ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{user?.fullName || "Photographer"}</h1>
              <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                <MapPin className="w-3 h-3" />
                <span>{photographer?.location || "No location set"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Pill */}
        <div className="glass-dark rounded-2xl p-4 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${statusInfo.color} ${statusInfo.animate ? 'animate-pulse' : ''}`} />
            <div>
              <p className="text-white font-medium">{statusInfo.text}</p>
              <p className="text-xs text-muted-foreground">{statusInfo.subtext}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-white/20 text-white hover:bg-white/10"
            onClick={() => toggleAvailabilityMutation.mutate(!photographer?.isAvailable)}
            disabled={toggleAvailabilityMutation.isPending || photographer?.sessionState === 'in_session'}
          >
            {photographer?.isAvailable ? "Go Offline" : "Go Online"}
          </Button>
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
              <SettingsIcon className="w-5 h-5" />
              <span className="text-[10px] font-medium">Profile</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
