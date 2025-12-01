import { useState, useCallback, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Camera, Calendar, DollarSign, Star, MapPin, Settings as SettingsIcon, Clock, AlertCircle, ChevronRight, User, Sparkles, TrendingUp, Bell, CheckCircle2, Image, Maximize2, Navigation, Layers, Map as MapIcon, Satellite, Lightbulb, Target, Zap, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/api";
import { isToday, startOfWeek, endOfWeek, isWithinInterval, format, formatDistanceToNow, isFuture, parseISO } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type MapStyle = 'dark' | 'satellite' | 'street';
const MAP_STYLES = {
  dark: { url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", name: "Dark", icon: MapIcon },
  satellite: { url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", name: "Satellite", icon: Satellite },
  street: { url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", name: "Street", icon: MapIcon },
};

function MapController({ userPosition }: { userPosition: [number, number] | null }) {
  const map = useMap();
  if (userPosition) {
    map.setView(userPosition, 14);
  }
  return null;
}

const bookingMarkerIcon = new L.Icon({
  iconUrl: "data:image/svg+xml;base64," + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41">
      <path fill="#8b5cf6" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9.4 12.5 28.5 12.5 28.5S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z"/>
      <circle cx="12.5" cy="12.5" r="6" fill="white"/>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const todayMarkerIcon = new L.Icon({
  iconUrl: "data:image/svg+xml;base64," + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41">
      <path fill="#22c55e" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9.4 12.5 28.5 12.5 28.5S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z"/>
      <circle cx="12.5" cy="12.5" r="6" fill="white"/>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const customerLiveIcon = new L.Icon({
  iconUrl: "data:image/svg+xml;base64," + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="18" fill="#3b82f6" stroke="white" stroke-width="3"/>
      <circle cx="20" cy="20" r="8" fill="white"/>
      <circle cx="20" cy="20" r="4" fill="#3b82f6"/>
    </svg>
  `),
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

export default function PhotographerHome() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [mapStyle, setMapStyle] = useState<MapStyle>('dark');
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPosition([position.coords.latitude, position.coords.longitude]);
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  const { data: photographer, isLoading: photographerLoading, isError: photographerError } = useQuery({
    queryKey: ["myPhotographerProfile"],
    queryFn: async () => {
      const res = await fetch("/api/photographers/me", { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
    enabled: !!user,
    retry: false,
  });

  // Redirect customers to customer home, redirect photographers without profile to onboarding
  useEffect(() => {
    if (user) {
      if (user.role !== "photographer") {
        setLocation("/home");
      } else if (!photographerLoading && photographer === null) {
        setLocation("/photographer-onboarding");
      }
    }
  }, [user, photographerLoading, photographer, setLocation]);

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

  const { data: liveLocations = [] } = useQuery({
    queryKey: ["photographerLiveLocations"],
    queryFn: async () => {
      const res = await fetch("/api/photographer/live-locations", {
        credentials: "include",
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!photographer?.id,
    refetchInterval: 5000,
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

  // Show loading while checking user or photographer profile
  // Don't show content until we know where to redirect
  if (!user || photographerLoading || !photographer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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

        {/* Live Map with Controls */}
        <section>
          <div className="mb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Live Map
            </h2>
          </div>
          <div className="glass-dark rounded-2xl overflow-hidden border border-white/10 relative">
            <div className="h-[220px]">
              <MapContainer
                center={
                  userPosition || (photographer?.latitude && photographer?.longitude
                    ? [parseFloat(photographer.latitude), parseFloat(photographer.longitude)]
                    : [51.5074, -0.1278])
                }
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                zoomControl={false}
                attributionControl={false}
                key={mapStyle}
              >
                <TileLayer url={MAP_STYLES[mapStyle].url} />
                {userPosition && <MapController userPosition={userPosition} />}
                {userPosition && (
                  <Marker
                    position={userPosition}
                    icon={L.divIcon({
                      className: "user-marker",
                      html: `<div style="width:20px;height:20px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(59,130,246,0.5);"></div>`,
                      iconSize: [20, 20],
                      iconAnchor: [10, 10],
                    })}
                  />
                )}
                {confirmedUpcoming
                  .filter((b: any) => b.meetingLatitude && b.meetingLongitude)
                  .map((booking: any) => (
                    <Marker
                      key={booking.id}
                      position={[parseFloat(booking.meetingLatitude), parseFloat(booking.meetingLongitude)]}
                      icon={isToday(new Date(booking.scheduledDate)) ? todayMarkerIcon : bookingMarkerIcon}
                      eventHandlers={{ click: () => setLocation(`/photographer/booking/${booking.id}`) }}
                    >
                      <Popup>
                        <div className="text-sm p-1">
                          <p className="font-medium">{booking.customer?.fullName}</p>
                          <p className="text-muted-foreground">{format(new Date(booking.scheduledDate), 'MMM d')} at {booking.scheduledTime}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                {liveLocations.map((location: any) => (
                  <Marker
                    key={`live-${location.id}`}
                    position={[parseFloat(location.latitude), parseFloat(location.longitude)]}
                    icon={customerLiveIcon}
                  >
                    <Popup>
                      <div className="text-sm p-1">
                        <p className="font-medium text-blue-600">{location.customerName}</p>
                        <p className="text-xs text-green-600">Live Location</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
            
            {/* Map Controls */}
            <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowStylePicker(!showStylePicker)}
                  className="w-9 h-9 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center text-white shadow-lg border border-white/20 backdrop-blur-sm"
                  data-testid="button-map-style"
                >
                  <Layers className="w-4 h-4" />
                </button>
                <AnimatePresence>
                  {showStylePicker && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, x: 10 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9, x: 10 }}
                      className="absolute right-11 top-0 bg-black/90 backdrop-blur-md rounded-xl border border-white/10 p-1.5 shadow-xl"
                    >
                      {(Object.entries(MAP_STYLES) as [MapStyle, typeof MAP_STYLES.dark][]).map(([key, style]) => {
                        const Icon = style.icon;
                        return (
                          <button
                            key={key}
                            onClick={() => { setMapStyle(key); setShowStylePicker(false); }}
                            className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg transition-all text-sm ${
                              mapStyle === key ? 'bg-primary/20 text-primary' : 'text-white/70 hover:bg-white/10'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="whitespace-nowrap">{style.name}</span>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button
                onClick={handleLocateMe}
                disabled={isLocating}
                className="w-9 h-9 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center text-white shadow-lg border border-white/20 backdrop-blur-sm"
                data-testid="button-locate-me"
              >
                {isLocating ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Navigation className="w-4 h-4" />
                )}
              </button>
            </div>
            
            {/* Legend */}
            <div className="absolute bottom-3 left-3 z-[1000] bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10">
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-white/80">Today</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-white/80">Upcoming</span>
                </div>
                {liveLocations.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-white/80">Live</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Map Status */}
          {confirmedUpcoming.filter((b: any) => !b.meetingLatitude || !b.meetingLongitude).length > 0 && (
            <div className="mt-2 flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 rounded-lg px-3 py-2 border border-amber-500/20">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>
                {confirmedUpcoming.filter((b: any) => !b.meetingLatitude || !b.meetingLongitude).length} session{confirmedUpcoming.filter((b: any) => !b.meetingLatitude || !b.meetingLongitude).length > 1 ? 's need' : ' needs'} a meeting location
              </span>
            </div>
          )}
        </section>

        {/* Quick Actions - Show when no upcoming sessions */}
        {confirmedUpcoming.length === 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Get Ready for Bookings
            </h2>
            <div className="grid grid-cols-1 gap-3">
              <Link href="/photographer-profile">
                <motion.div 
                  className="glass-dark rounded-2xl p-4 border border-white/10 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors"
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">Update Your Profile</p>
                    <p className="text-xs text-muted-foreground">Add photos and update your bio to attract more customers</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </motion.div>
              </Link>
              
              <Link href="/photographer-settings">
                <motion.div 
                  className="glass-dark rounded-2xl p-4 border border-white/10 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors"
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">Set Your Rates</p>
                    <p className="text-xs text-muted-foreground">Adjust your hourly rate and add editing services</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </motion.div>
              </Link>
              
              <motion.div 
                className="glass-dark rounded-2xl p-4 border border-white/10 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-amber-500" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">Pro Tip</p>
                  <p className="text-xs text-muted-foreground">Photographers with complete profiles and portfolio photos get 3x more bookings</p>
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* Upcoming Sessions */}
        {confirmedUpcoming.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Upcoming Sessions
              </h2>
              <div className="flex items-center gap-3">
                <Link href="/photographer-map">
                  <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    Map
                  </span>
                </Link>
                <Link href="/photographer-bookings">
                  <span className="text-sm text-primary cursor-pointer">View All</span>
                </Link>
              </div>
            </div>
            <div className="space-y-3">
              {confirmedUpcoming.slice(0, 2).map((booking: any, index: number) => (
                <Link key={booking.id} href={`/photographer/booking/${booking.id}`}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-dark rounded-2xl p-4 border border-white/10 cursor-pointer hover:bg-white/5 transition-colors"
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
                      <div className="text-right flex flex-col items-end gap-1">
                        <p className="text-primary font-bold">£{parseFloat(booking.photographerEarnings).toFixed(0)}</p>
                        {isToday(new Date(booking.scheduledDate)) && (
                          <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">Today</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </Link>
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
