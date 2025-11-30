import { Link } from "wouter";
import { Camera, Calendar, DollarSign, Star, MapPin, Settings as SettingsIcon, Clock, AlertCircle, ChevronRight, User, Sparkles, TrendingUp, Bell, CheckCircle2, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/api";
import { isToday, startOfWeek, endOfWeek, isWithinInterval, format, formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

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

  const { data: editingRequests = [] } = useQuery({
    queryKey: ["photographerEditingRequests", photographer?.id],
    queryFn: async () => {
      const res = await fetch(`/api/editing-requests/photographer/${photographer?.id}`, {
        credentials: "include",
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!photographer?.id,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["photographerReviews", photographer?.id],
    queryFn: async () => {
      const res = await fetch(`/api/reviews/photographer/${photographer?.id}`, {
        credentials: "include",
      });
      if (!res.ok) return [];
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

  const pendingBookings = bookings.filter((b: any) => b.status === 'pending');
  const confirmedUpcoming = bookings.filter((b: any) => 
    b.status === 'confirmed' && new Date(b.scheduledDate) >= new Date()
  ).sort((a: any, b: any) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  
  const awaitingUpload = bookings.filter((b: any) => 
    b.status === 'confirmed' && new Date(b.scheduledDate) < new Date()
  );

  const pendingEditingRequests = editingRequests.filter((r: any) => r.status === 'requested');
  const activeEditingRequests = editingRequests.filter((r: any) => 
    r.status === 'accepted' || r.status === 'in_progress'
  );

  const recentReviews = reviews.slice(0, 3);

  const stats = {
    todayBookings: todaysBookings.length,
    weekEarnings: thisWeekEarnings,
    rating: photographer?.rating ? parseFloat(photographer.rating) : 5.0,
    totalJobs: completedJobsCount,
  };

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

  const totalActionItems = pendingBookings.length + awaitingUpload.length + pendingEditingRequests.length;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Header with Profile */}
      <div className="p-6 pt-12">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
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
        {/* Action Items Alert */}
        {totalActionItems > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden"
          >
            <Link href="/photographer-bookings">
              <div className="glass-dark rounded-2xl p-4 border border-primary/30 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Bell className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-white font-medium">You have {totalActionItems} action item{totalActionItems > 1 ? 's' : ''}</p>
                      <p className="text-xs text-muted-foreground">
                        {pendingBookings.length > 0 && `${pendingBookings.length} pending request${pendingBookings.length > 1 ? 's' : ''}`}
                        {pendingBookings.length > 0 && (awaitingUpload.length > 0 || pendingEditingRequests.length > 0) && ' • '}
                        {awaitingUpload.length > 0 && `${awaitingUpload.length} awaiting photos`}
                        {awaitingUpload.length > 0 && pendingEditingRequests.length > 0 && ' • '}
                        {pendingEditingRequests.length > 0 && `${pendingEditingRequests.length} editing request${pendingEditingRequests.length > 1 ? 's' : ''}`}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            </Link>
          </motion.div>
        )}

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
            <p className="text-2xl font-bold text-white">£{stats.weekEarnings.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Earnings</p>
          </div>
          <div className="glass-dark rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-muted-foreground">Rating</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.rating.toFixed(1)}</p>
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

        {/* Upcoming Sessions */}
        {confirmedUpcoming.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Upcoming Sessions
              </h2>
              <Link href="/photographer-bookings">
                <span className="text-sm text-primary cursor-pointer">View All</span>
              </Link>
            </div>
            <div className="space-y-3">
              {confirmedUpcoming.slice(0, 2).map((booking: any, index: number) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-dark rounded-2xl p-4 border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                      {booking.customer?.profileImageUrl ? (
                        <img 
                          src={booking.customer.profileImageUrl} 
                          alt={booking.customer.fullName} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{booking.customer?.fullName || 'Customer'}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{format(new Date(booking.scheduledDate), 'EEE, MMM d')}</span>
                        <Clock className="w-3 h-3 ml-1" />
                        <span>{booking.scheduledTime}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <MapPin className="w-3 h-3" />
                        <span>{booking.location}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-primary font-bold">£{parseFloat(booking.photographerEarnings).toFixed(0)}</p>
                      {isToday(new Date(booking.scheduledDate)) && (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">Today</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Active Editing Work */}
        {activeEditingRequests.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Active Editing Work
              </h2>
            </div>
            <div className="space-y-3">
              {activeEditingRequests.slice(0, 2).map((request: any) => (
                <Link key={request.id} href="/photographer-bookings">
                  <div className="glass-dark rounded-2xl p-4 border border-purple-500/30 cursor-pointer hover:bg-white/5 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <Image className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{request.photoCount} photos to edit</p>
                          <p className="text-xs text-muted-foreground">
                            {request.status === 'accepted' ? 'Ready to start' : 'In progress'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-purple-400 font-bold">£{parseFloat(request.photographerEarnings).toFixed(0)}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          request.status === 'in_progress' 
                            ? 'bg-blue-500/20 text-blue-400' 
                            : 'bg-purple-500/20 text-purple-400'
                        }`}>
                          {request.status === 'in_progress' ? 'Working' : 'Accepted'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Recent Reviews */}
        {recentReviews.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Recent Reviews
              </h2>
            </div>
            <div className="space-y-3">
              {recentReviews.map((review: any, index: number) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-dark rounded-2xl p-4 border border-white/10"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {review.customer?.profileImageUrl ? (
                        <img 
                          src={review.customer.profileImageUrl} 
                          alt={review.customer.fullName} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-white font-medium text-sm">{review.customer?.fullName || 'Customer'}</p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3 h-3 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{review.comment}</p>
                      <p className="text-xs text-muted-foreground/60 mt-2">
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Quick Tips (shown when no action items) */}
        {totalActionItems === 0 && confirmedUpcoming.length === 0 && (
          <section>
            <div className="glass-dark rounded-2xl p-5 border border-white/10 bg-gradient-to-br from-primary/10 to-purple-500/10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">Boost Your Bookings</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {!photographer?.isAvailable 
                      ? "Go online to start receiving booking requests from travelers nearby."
                      : stats.totalJobs < 5 
                        ? "Add more photos to your portfolio to attract more customers."
                        : "Keep up the great work! Your rating helps attract new customers."
                    }
                  </p>
                  {!photographer?.isAvailable ? (
                    <Button 
                      size="sm" 
                      className="bg-primary hover:bg-primary/90"
                      onClick={() => toggleAvailabilityMutation.mutate(true)}
                    >
                      Go Online Now
                    </Button>
                  ) : (
                    <Link href="/photographer-profile">
                      <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                        Update Portfolio
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* All Clear State */}
        {totalActionItems === 0 && confirmedUpcoming.length === 0 && stats.totalJobs > 0 && photographer?.isAvailable && (
          <section>
            <div className="glass-dark rounded-2xl p-5 border border-green-500/20 text-center">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-white font-bold mb-1">You're All Set!</h3>
              <p className="text-sm text-muted-foreground">
                You're online and ready to receive bookings. We'll notify you when new requests come in.
              </p>
            </div>
          </section>
        )}

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
            <button className="flex flex-col items-center gap-1 text-muted-foreground hover:text-white transition-colors relative" data-testid="nav-bookings">
              <Calendar className="w-5 h-5" />
              {totalActionItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center">
                  {totalActionItems}
                </span>
              )}
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
