import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Clock, MapPin, DollarSign, User, MessageCircle, Navigation, Check, ChevronDown, ChevronUp, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, parseISO, isToday, isFuture } from "date-fns";
import { cn } from "@/lib/utils";
import { BookingChat } from "@/components/booking-chat";
import { MeetingLocationPicker } from "@/components/meeting-location-picker";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
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

interface BookingWithCustomer {
  id: string;
  customerId: string;
  photographerId: string;
  location: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  duration: number;
  baseAmount: string;
  photographerEarnings: string;
  meetingLatitude?: string | null;
  meetingLongitude?: string | null;
  meetingNotes?: string | null;
  customer: {
    fullName: string;
    profileImageUrl: string | null;
  };
}

export default function PhotographerBookingDetail() {
  const [match, params] = useRoute("/photographer/booking/:id");
  const [, setLocation] = useLocation();
  const [showChat, setShowChat] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const bookingId = params?.id;

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) throw new Error("Not authenticated");
      return res.json();
    },
  });

  const { data: booking, isLoading, refetch } = useQuery<BookingWithCustomer>({
    queryKey: ["booking-detail", bookingId],
    queryFn: async () => {
      const res = await fetch(`/api/photographer/bookings`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch booking");
      const bookings = await res.json();
      return bookings.find((b: BookingWithCustomer) => b.id === bookingId);
    },
    enabled: !!bookingId,
  });

  const isUpcoming = booking && booking.status === "confirmed" && 
    (isToday(parseISO(booking.scheduledDate)) || isFuture(parseISO(booking.scheduledDate)));

  const { data: liveLocation } = useQuery<{ latitude: string; longitude: string; updatedAt: string } | null>({
    queryKey: ["booking-live-location", bookingId],
    queryFn: async () => {
      const res = await fetch(`/api/bookings/${bookingId}/live-location`, { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!bookingId && isUpcoming,
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background p-6 pt-12">
        <button
          onClick={() => window.history.back()}
          className="w-10 h-10 glass-dark rounded-full flex items-center justify-center text-white hover:bg-white/10 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Booking not found</p>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: "bg-amber-500/20 text-amber-500",
    confirmed: "bg-green-500/20 text-green-500",
    completed: "bg-blue-500/20 text-blue-500",
    cancelled: "bg-red-500/20 text-red-500",
    expired: "bg-gray-500/20 text-gray-500",
  };

  const hasMeetingLocation = booking.meetingLatitude && booking.meetingLongitude;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-6 pt-12 flex items-center gap-4">
        <button
          onClick={() => window.history.back()}
          className="w-10 h-10 glass-dark rounded-full flex items-center justify-center text-white hover:bg-white/10"
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">Booking Details</h1>
          <span className={cn(
            "text-xs font-medium px-2 py-1 rounded-full capitalize",
            statusColors[booking.status] || "bg-gray-500/20 text-gray-500"
          )}>
            {booking.status}
          </span>
        </div>
      </div>

      <div className="px-6 space-y-6">
        <div className="glass-panel rounded-2xl p-4 flex items-center gap-4">
          <img
            src={booking.customer.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.customer.fullName)}&background=random`}
            alt={booking.customer.fullName}
            className="w-14 h-14 rounded-full object-cover"
          />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Customer</p>
            <h2 className="text-white font-bold">{booking.customer.fullName}</h2>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 space-y-4">
          <h3 className="text-white font-bold">Session Details</h3>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Date</p>
              <p className="text-white font-medium">
                {format(parseISO(booking.scheduledDate), "EEEE, MMMM d, yyyy")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Time & Duration</p>
              <p className="text-white font-medium">
                {booking.scheduledTime} ({booking.duration} hour{booking.duration > 1 ? "s" : ""})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Location</p>
              <p className="text-white font-medium">{booking.location}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Your Earnings</p>
              <p className="text-green-500 font-bold text-lg">
                £{parseFloat(booking.photographerEarnings).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {booking.status === "confirmed" && (
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold">Meeting Point</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLocationPicker(true)}
                className="text-xs"
                data-testid="button-set-meeting-location"
              >
                {hasMeetingLocation ? "Update" : "Set Location"}
              </Button>
            </div>

            {hasMeetingLocation ? (
              <div className="space-y-3">
                <div className="h-[180px] rounded-xl overflow-hidden border border-white/10">
                  <MapContainer
                    center={liveLocation ? [parseFloat(liveLocation.latitude), parseFloat(liveLocation.longitude)] : [parseFloat(booking.meetingLatitude!), parseFloat(booking.meetingLongitude!)]}
                    zoom={15}
                    style={{ height: "100%", width: "100%" }}
                    zoomControl={false}
                    attributionControl={false}
                    dragging={true}
                    scrollWheelZoom={true}
                  >
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                    <Marker
                      position={[parseFloat(booking.meetingLatitude!), parseFloat(booking.meetingLongitude!)]}
                      icon={markerIcon}
                    >
                      <Popup>Meeting Point</Popup>
                    </Marker>
                    {liveLocation && (
                      <Marker
                        position={[parseFloat(liveLocation.latitude), parseFloat(liveLocation.longitude)]}
                        icon={customerLiveIcon}
                      >
                        <Popup>
                          <div className="text-sm">
                            <p className="font-medium text-blue-600">{booking.customer.fullName}</p>
                            <p className="text-xs text-green-600">Live Location</p>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                  </MapContainer>
                </div>
                {liveLocation && (
                  <div className="flex items-center gap-2 text-sm bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <span className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
                    <span className="text-blue-400 font-medium">{booking.customer.fullName} is sharing their live location</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-muted-foreground">
                    Meeting point set at {parseFloat(booking.meetingLatitude!).toFixed(4)}, {parseFloat(booking.meetingLongitude!).toFixed(4)}
                  </span>
                </div>
                {booking.meetingNotes && (
                  <p className="text-sm text-white bg-card rounded-lg p-3 border border-white/10">
                    {booking.meetingNotes}
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
                <Navigation className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-amber-500 font-medium text-sm">Set a meeting point</p>
                  <p className="text-xs text-muted-foreground">Help your customer find you at the shoot location</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="glass-panel rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowChat(!showChat)}
            className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
            data-testid="button-toggle-chat"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">Messages</p>
                <p className="text-xs text-muted-foreground">Chat with {booking.customer.fullName}</p>
              </div>
            </div>
            {showChat ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>

          {showChat && currentUser && (
            <div className="border-t border-white/10">
              <BookingChat
                bookingId={booking.id}
                currentUserId={currentUser.id}
                otherPartyName={booking.customer.fullName}
              />
            </div>
          )}
        </div>
      </div>

      <MeetingLocationPicker
        bookingId={booking.id}
        bookingLocation={booking.location}
        currentLatitude={booking.meetingLatitude}
        currentLongitude={booking.meetingLongitude}
        currentNotes={booking.meetingNotes}
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
