import { Link } from "wouter";
import { Settings, Bell, Camera, Calendar, DollarSign, Star, Clock, MapPin, TrendingUp, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/api";

export default function PhotographerHome() {
  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  // Mock stats for now - would come from API
  const stats = {
    todayBookings: 2,
    weekEarnings: 280,
    rating: 4.9,
    totalJobs: 47,
  };

  const upcomingBookings = [
    { id: 1, client: "Emma T.", time: "2:00 PM", location: "Tower Bridge", duration: "1 hour", amount: "£40" },
    { id: 2, client: "David L.", time: "5:30 PM", location: "Big Ben", duration: "2 hours", amount: "£80" },
  ];

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
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <div>
              <p className="text-white font-medium">You're Available</p>
              <p className="text-xs text-muted-foreground">Customers can book you now</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
            Go Offline
          </Button>
        </div>

        {/* Today's Bookings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Today's Bookings
            </h2>
            <Link href="/photographer-bookings" className="text-sm text-primary">
              View All
            </Link>
          </div>
          
          <div className="space-y-3">
            {upcomingBookings.map((booking) => (
              <div key={booking.id} className="bg-card border border-white/5 rounded-2xl p-4" data-testid={`booking-${booking.id}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-white">{booking.client}</h3>
                    <div className="flex items-center text-muted-foreground text-xs mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      {booking.location}
                    </div>
                  </div>
                  <span className="text-lg font-bold text-primary">{booking.amount}</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center text-white bg-white/10 px-2 py-1 rounded-full">
                    <Clock className="w-3 h-3 mr-1" />
                    {booking.time}
                  </span>
                  <span className="text-muted-foreground">{booking.duration}</span>
                </div>
              </div>
            ))}
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
              <Settings className="w-5 h-5" />
              <span className="text-[10px] font-medium">Profile</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
