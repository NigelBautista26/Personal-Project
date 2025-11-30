import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, MapPin, Calendar, Clock, User, Navigation, ChevronRight } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { format, isSameDay, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
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

const activeMarkerIcon = new L.Icon({
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

interface BookingWithCustomer {
  id: string;
  customerId: string;
  photographerId: string;
  location: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  duration: number;
  photographerEarnings: string;
  meetingLatitude?: string | null;
  meetingLongitude?: string | null;
  meetingNotes?: string | null;
  customer: {
    fullName: string;
    profileImageUrl: string | null;
  };
}

function FitBounds({ bookings }: { bookings: BookingWithCustomer[] }) {
  const map = useMap();
  
  const validBookings = bookings.filter(b => b.meetingLatitude && b.meetingLongitude);
  
  if (validBookings.length > 0) {
    const bounds = L.latLngBounds(
      validBookings.map(b => [parseFloat(b.meetingLatitude!), parseFloat(b.meetingLongitude!)] as [number, number])
    );
    map.fitBounds(bounds, { padding: [50, 50] });
  }
  
  return null;
}

export default function PhotographerMap() {
  const [, setLocation] = useLocation();
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "today" | "upcoming">("all");
  
  const { data: bookings = [], isLoading } = useQuery<BookingWithCustomer[]>({
    queryKey: ["photographer-bookings"],
    queryFn: async () => {
      const res = await fetch("/api/photographer/bookings", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch bookings");
      return res.json();
    },
  });

  const confirmedBookings = bookings.filter(b => b.status === "confirmed");
  
  const filteredBookings = confirmedBookings.filter(b => {
    const bookingDate = parseISO(b.scheduledDate);
    const today = new Date();
    
    if (filter === "today") {
      return isSameDay(bookingDate, today);
    }
    if (filter === "upcoming") {
      return bookingDate >= today;
    }
    return true;
  });

  const bookingsWithLocation = filteredBookings.filter(b => b.meetingLatitude && b.meetingLongitude);
  const bookingsWithoutLocation = filteredBookings.filter(b => !b.meetingLatitude || !b.meetingLongitude);

  const defaultCenter: [number, number] = bookingsWithLocation.length > 0
    ? [parseFloat(bookingsWithLocation[0].meetingLatitude!), parseFloat(bookingsWithLocation[0].meetingLongitude!)]
    : [51.5074, -0.1278];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="p-6 pt-12 flex items-center gap-4">
        <button
          onClick={() => window.history.back()}
          className="w-10 h-10 glass-dark rounded-full flex items-center justify-center text-white hover:bg-white/10"
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">My Sessions Map</h1>
          <p className="text-sm text-muted-foreground">{confirmedBookings.length} confirmed session{confirmedBookings.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="px-6 mb-4">
        <div className="flex gap-2">
          {(["all", "today", "upcoming"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                filter === f
                  ? "bg-primary text-white"
                  : "bg-card border border-white/10 text-muted-foreground hover:bg-white/5"
              )}
              data-testid={`button-filter-${f}`}
            >
              {f === "all" ? "All" : f === "today" ? "Today" : "Upcoming"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-card">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <MapContainer
            center={defaultCenter}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {bookingsWithLocation.length > 1 && <FitBounds bookings={bookingsWithLocation} />}
            {bookingsWithLocation.map((booking) => {
              const isToday = isSameDay(parseISO(booking.scheduledDate), new Date());
              return (
                <Marker
                  key={booking.id}
                  position={[parseFloat(booking.meetingLatitude!), parseFloat(booking.meetingLongitude!)]}
                  icon={isToday ? activeMarkerIcon : markerIcon}
                  eventHandlers={{
                    click: () => setSelectedBooking(booking.id),
                  }}
                >
                  <Popup>
                    <div className="p-1 min-w-[180px]">
                      <div className="flex items-center gap-2 mb-2">
                        <img
                          src={booking.customer.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.customer.fullName)}&background=random`}
                          alt={booking.customer.fullName}
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="font-medium text-sm">{booking.customer.fullName}</span>
                      </div>
                      <div className="text-xs space-y-1 text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{format(parseISO(booking.scheduledDate), "MMM d, yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{booking.scheduledTime} ({booking.duration}h)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{booking.location}</span>
                        </div>
                      </div>
                      {booking.meetingNotes && (
                        <p className="text-xs mt-2 text-gray-500 italic">{booking.meetingNotes}</p>
                      )}
                      <button
                        onClick={() => setLocation(`/photographer/booking/${booking.id}`)}
                        className="mt-2 text-xs text-primary font-medium hover:underline"
                      >
                        View Details →
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}
      </div>

      {bookingsWithoutLocation.length > 0 && (
        <div className="p-4 border-t border-white/10 bg-background">
          <div className="flex items-center gap-2 mb-3">
            <Navigation className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-amber-500 font-medium">
              {bookingsWithoutLocation.length} session{bookingsWithoutLocation.length !== 1 ? "s" : ""} need meeting location
            </span>
          </div>
          <div className="space-y-2 max-h-[150px] overflow-y-auto">
            {bookingsWithoutLocation.map((booking) => (
              <button
                key={booking.id}
                onClick={() => setLocation(`/photographer/booking/${booking.id}`)}
                className="w-full flex items-center gap-3 p-3 bg-card border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
                data-testid={`booking-no-location-${booking.id}`}
              >
                <img
                  src={booking.customer.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.customer.fullName)}&background=random`}
                  alt={booking.customer.fullName}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-white">{booking.customer.fullName}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(booking.scheduledDate), "MMM d")} at {booking.scheduledTime}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
