import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Clock, MapPin, DollarSign, User, MessageCircle, Navigation, Check, ChevronDown, ChevronUp, Radio, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, parseISO, isToday, isFuture } from "date-fns";
import { cn } from "@/lib/utils";
import { BookingChat } from "@/components/booking-chat";
import { LiveLocationSharing } from "@/components/live-location-sharing";
import { useToast } from "@/hooks/use-toast";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
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

const photographerLiveIcon = new L.Icon({
  iconUrl: "data:image/svg+xml;base64," + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="18" fill="#10b981" stroke="white" stroke-width="3"/>
      <circle cx="20" cy="20" r="8" fill="white"/>
      <circle cx="20" cy="20" r="4" fill="#10b981"/>
    </svg>
  `),
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapCenterUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

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
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [editLatitude, setEditLatitude] = useState<number | null>(null);
  const [editLongitude, setEditLongitude] = useState<number | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.5074, -0.1278]);
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null);
  const bookingId = params?.id;
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  useEffect(() => {
    if (booking) {
      if (booking.meetingLatitude && booking.meetingLongitude) {
        const lat = parseFloat(booking.meetingLatitude);
        const lng = parseFloat(booking.meetingLongitude);
        setEditLatitude(lat);
        setEditLongitude(lng);
        setMapCenter([lat, lng]);
      }
      setEditNotes(booking.meetingNotes || "");
    }
  }, [booking]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editLatitude === null || editLongitude === null) throw new Error("Location required");
      const res = await fetch(`/api/bookings/${bookingId}/meeting-location`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ latitude: editLatitude, longitude: editLongitude, notes: editNotes }),
      });
      if (!res.ok) throw new Error("Failed to save location");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking-detail"] });
      toast({ title: "Meeting location saved" });
      setIsEditingLocation(false);
      refetch();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleLocationSelect = (lat: number, lng: number) => {
    setEditLatitude(lat);
    setEditLongitude(lng);
    setMapCenter([lat, lng]);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Not supported", description: "Geolocation is not supported", variant: "destructive" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => handleLocationSelect(position.coords.latitude, position.coords.longitude),
      () => toast({ title: "Error", description: "Could not get your location", variant: "destructive" })
    );
  };

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
              {hasMeetingLocation && !isEditingLocation && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingLocation(true)}
                  className="text-xs"
                  data-testid="button-edit-meeting-location"
                >
                  Edit
                </Button>
              )}
            </div>

            {isEditingLocation || !hasMeetingLocation ? (
              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={handleUseCurrentLocation}
                  className="w-full flex items-center gap-2"
                  data-testid="button-use-my-location"
                >
                  <Navigation className="w-4 h-4" />
                  Use My Current Location
                </Button>

                <div className="h-[200px] rounded-xl overflow-hidden border border-white/10">
                  <MapContainer
                    center={mapCenter}
                    zoom={15}
                    style={{ height: "100%", width: "100%" }}
                    zoomControl={false}
                    attributionControl={false}
                  >
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                    <MapClickHandler onLocationSelect={handleLocationSelect} />
                    <MapCenterUpdater center={mapCenter} />
                    {editLatitude && editLongitude && (
                      <Marker position={[editLatitude, editLongitude]} icon={markerIcon} />
                    )}
                    {liveLocation && (
                      <Marker
                        position={[parseFloat(liveLocation.latitude), parseFloat(liveLocation.longitude)]}
                        icon={customerLiveIcon}
                      />
                    )}
                    {myLocation && (
                      <Marker
                        position={[myLocation.lat, myLocation.lng]}
                        icon={photographerLiveIcon}
                      />
                    )}
                  </MapContainer>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Tap on the map to set the meeting point
                </p>

                {editLatitude && editLongitude && (
                  <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm text-white">
                      {editLatitude.toFixed(6)}, {editLongitude.toFixed(6)}
                    </span>
                    <Check className="w-4 h-4 text-primary ml-auto" />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Meeting Notes (optional)</label>
                  <Input
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="e.g., Meet at the main entrance, near the fountain..."
                    className="bg-card border-white/10"
                    data-testid="input-meeting-notes"
                  />
                </div>

                <div className="flex gap-3">
                  {hasMeetingLocation && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditingLocation(false);
                        if (booking.meetingLatitude && booking.meetingLongitude) {
                          setEditLatitude(parseFloat(booking.meetingLatitude));
                          setEditLongitude(parseFloat(booking.meetingLongitude));
                        }
                        setEditNotes(booking.meetingNotes || "");
                      }}
                      className="flex-1"
                      data-testid="button-cancel-edit"
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    onClick={() => saveMutation.mutate()}
                    disabled={!editLatitude || !editLongitude || saveMutation.isPending}
                    className="flex-1 bg-primary hover:bg-primary/90"
                    data-testid="button-save-location"
                  >
                    {saveMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Save Location"
                    )}
                  </Button>
                </div>
              </div>
            ) : (
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
                    {myLocation && (
                      <Marker
                        position={[myLocation.lat, myLocation.lng]}
                        icon={photographerLiveIcon}
                      >
                        <Popup>
                          <div className="text-sm">
                            <p className="font-medium text-green-600">You</p>
                            <p className="text-xs text-green-600">Live Location</p>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                  </MapContainer>
                </div>
                {(liveLocation || myLocation) && (
                  <div className="space-y-1">
                    {liveLocation && (
                      <div className="flex items-center gap-2 text-xs text-blue-400">
                        <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                        <span>{booking.customer.fullName}'s live location</span>
                      </div>
                    )}
                    {myLocation && (
                      <div className="flex items-center gap-2 text-xs text-green-400">
                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                        <span>Your live location</span>
                      </div>
                    )}
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
            )}
          </div>
        )}

        {booking.status === "confirmed" && isUpcoming && (
          <LiveLocationSharing
            bookingId={booking.id}
            scheduledDate={booking.scheduledDate}
            scheduledTime={booking.scheduledTime}
            userType="photographer"
            onLocationUpdate={setMyLocation}
          />
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

    </div>
  );
}
