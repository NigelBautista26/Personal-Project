import { useRoute, useLocation } from "wouter";
import { ArrowLeft, Calendar, Clock, MapPin, CreditCard, Check, Loader2, Navigation, Camera, ChevronRight, X, Map, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getPhotographer, getCurrentUser } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const customIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="width: 32px; height: 32px; background: #8b5cf6; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

interface PhotoSpot {
  id: string;
  name: string;
  city: string;
  description: string;
  category: string;
  imageUrl: string;
}

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
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

export default function Booking() {
  const [match, params] = useRoute("/book/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedDuration, setSelectedDuration] = useState(1);
  const [meetingLocation, setMeetingLocation] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState("14:00");
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationMode, setLocationMode] = useState<'spot' | 'current' | 'manual' | 'map'>('manual');
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.5074, -0.1278]); // Default to London
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  
  const id = params?.id;

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  const { data: photographer, isLoading: photographerLoading } = useQuery<any>({
    queryKey: ["photographer", id],
    queryFn: () => getPhotographer(id!),
    enabled: !!id,
  });

  const getPhotographerCity = () => {
    if (!photographer?.location) return "";
    const parts = photographer.location.split(',').map((p: string) => p.trim());
    const knownCities = ['London', 'Paris', 'New York', 'Tokyo'];
    for (const city of knownCities) {
      if (parts.some((part: string) => part.includes(city))) return city;
    }
    return parts[parts.length - 1] || parts[0] || "";
  };
  const photographerCity = getPhotographerCity();

  // Set map center based on photographer's city
  useEffect(() => {
    const cityCoords: Record<string, [number, number]> = {
      'London': [51.5074, -0.1278],
      'Paris': [48.8566, 2.3522],
      'New York': [40.7128, -74.0060],
      'Tokyo': [35.6762, 139.6503],
      'Rome': [41.9028, 12.4964],
    };
    if (photographerCity && cityCoords[photographerCity]) {
      setMapCenter(cityCoords[photographerCity]);
    }
  }, [photographerCity]);

  const { data: photoSpots = [] } = useQuery<PhotoSpot[]>({
    queryKey: ["photo-spots", photographerCity],
    queryFn: async () => {
      if (!photographerCity) return [];
      const res = await fetch(`/api/photo-spots?city=${encodeURIComponent(photographerCity)}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!photographerCity,
  });

  const hourlyRate = parseFloat(photographer?.hourlyRate || "0");
  const durations = [
    { hours: 1, label: "1 hour" },
    { hours: 2, label: "2 hours" },
    { hours: 3, label: "3 hours" },
  ];

  // Two-sided pricing: base amount + 10% customer service fee
  const baseAmount = hourlyRate * selectedDuration;
  const customerServiceFee = Math.round(baseAmount * 0.10 * 100) / 100;
  const grandTotal = Math.round((baseAmount + customerServiceFee) * 100) / 100;

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Location not available", description: "Your browser doesn't support geolocation", variant: "destructive" });
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setMeetingLocation(`My Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        setLocationMode('current');
        setShowLocationPicker(false);
        setIsGettingLocation(false);
        toast({ title: "Location set", description: "Using your current GPS location" });
      },
      (error) => {
        setIsGettingLocation(false);
        let message = "Could not get your location";
        if (error.code === 1) {
          message = "Location access denied. Please allow location access in your browser settings.";
        } else if (error.code === 2) {
          message = "Location unavailable. Please try again.";
        } else if (error.code === 3) {
          message = "Location request timed out. Please try again.";
        }
        toast({ title: "Location error", description: message, variant: "destructive" });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleMapLocationSelect = (lat: number, lng: number) => {
    setSelectedCoords({ lat, lng });
  };

  const confirmMapLocation = () => {
    if (selectedCoords) {
      setMeetingLocation(`Custom Location (${selectedCoords.lat.toFixed(4)}, ${selectedCoords.lng.toFixed(4)})`);
      setLocationMode('map');
      setShowMapPicker(false);
      setShowLocationPicker(false);
      setSelectedCoords(null);
      toast({ title: "Location set", description: "Custom map location selected" });
    }
  };

  const centerOnMyLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Location not available", variant: "destructive" });
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setMapCenter([lat, lng]);
        setSelectedCoords({ lat, lng });
        setIsGettingLocation(false);
      },
      () => {
        setIsGettingLocation(false);
        toast({ title: "Could not get location", variant: "destructive" });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const bookingMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          photographerId: id,
          duration: selectedDuration,
          location: meetingLocation,
          scheduledDate: new Date(`${selectedDate}T${selectedTime}`).toISOString(),
          scheduledTime: selectedTime,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Booking failed");
      }
      
      return response.json();
    },
    onSuccess: () => {
      setStep(3);
    },
    onError: (error: Error) => {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleConfirmBooking = () => {
    if (!meetingLocation.trim()) {
      toast({
        title: "Location Required",
        description: "Please enter a meeting location.",
        variant: "destructive",
      });
      return;
    }
    bookingMutation.mutate();
  };

  if (!match) return null;

  if (photographerLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!photographer) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-white">
        <p className="text-lg">Photographer not found</p>
        <Button onClick={() => setLocation("/home")} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-white px-6">
        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6">
          <Check className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2" data-testid="text-booking-success">Booking Requested!</h2>
        <p className="text-muted-foreground text-center mb-8">
          {photographer.fullName} will review your request and respond shortly.
        </p>
        <Button 
          onClick={() => setLocation("/bookings")} 
          className="w-full max-w-xs h-12 rounded-xl"
          data-testid="button-view-bookings"
        >
          View My Bookings
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="px-4 py-4 flex items-center gap-4">
          <button 
            onClick={() => step === 1 ? setLocation(`/photographer/${id}`) : setStep(step - 1)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">Book Session</h1>
        </div>
        
        <div className="px-4 pb-4">
          <div className="flex gap-2">
            {[1, 2].map((s) => (
              <div 
                key={s}
                className={cn(
                  "h-1 flex-1 rounded-full transition-all",
                  step >= s ? "bg-primary" : "bg-white/10"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <div className="flex items-center gap-4 p-4 bg-card/50 rounded-2xl border border-white/5">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/10">
            <img 
              src={photographer.profileImageUrl || "/placeholder-avatar.jpg"} 
              alt={photographer.fullName}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-bold text-white" data-testid="text-photographer-name">{photographer.fullName}</h3>
            <p className="text-sm text-muted-foreground">{photographer.location}</p>
            <p className="text-primary font-medium">£{hourlyRate}/hour</p>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-white">Session Duration</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {durations.map((d) => (
                  <button
                    key={d.hours}
                    onClick={() => setSelectedDuration(d.hours)}
                    className={cn(
                      "p-4 rounded-xl border text-center transition-all",
                      selectedDuration === d.hours 
                        ? "border-primary bg-primary/10 text-white" 
                        : "border-white/10 text-muted-foreground hover:border-white/20"
                    )}
                    data-testid={`button-duration-${d.hours}`}
                  >
                    <p className="font-bold text-lg">{d.label}</p>
                    <p className="text-xs mt-1">£{(hourlyRate * d.hours).toFixed(0)}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-white">Date & Time</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowDatePicker(true)}
                  className="h-14 px-4 bg-card border border-white/10 rounded-xl flex items-center justify-between hover:bg-white/5 transition-colors"
                  data-testid="button-select-date"
                >
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="text-white font-medium">
                      {new Date(selectedDate).toLocaleDateString('en-GB', { 
                        day: 'numeric', 
                        month: 'short'
                      })}
                    </p>
                  </div>
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => setShowTimePicker(true)}
                  className="h-14 px-4 bg-card border border-white/10 rounded-xl flex items-center justify-between hover:bg-white/5 transition-colors"
                  data-testid="button-select-time"
                >
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground">Time</p>
                    <p className="text-white font-medium">
                      {(() => {
                        const [h, m] = selectedTime.split(':');
                        const hour = parseInt(h);
                        const ampm = hour >= 12 ? 'PM' : 'AM';
                        const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                        return `${hour12}:${m} ${ampm}`;
                      })()}
                    </p>
                  </div>
                  <Clock className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-white">Meeting Location</h3>
              </div>
              <button
                onClick={() => setShowLocationPicker(true)}
                className="w-full p-4 rounded-xl bg-card border border-white/10 flex items-center justify-between hover:bg-white/5 transition-colors"
                data-testid="button-select-location"
              >
                <span className={cn(
                  "text-sm",
                  meetingLocation ? "text-white" : "text-muted-foreground"
                )}>
                  {meetingLocation || "Select a location"}
                </span>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="bg-card/50 rounded-2xl p-4 border border-white/5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">Session ({selectedDuration}h)</span>
                <span className="text-white">£{baseAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-muted-foreground">Service fee (10%)</span>
                <span className="text-white">£{customerServiceFee.toFixed(2)}</span>
              </div>
              <div className="h-px bg-white/10 my-3" />
              <div className="flex justify-between items-center">
                <span className="font-semibold text-white">Total</span>
                <span className="font-bold text-xl text-primary" data-testid="text-total">£{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-card/50 rounded-2xl p-4 border border-white/5 space-y-3">
              <h3 className="font-semibold text-white">Booking Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="text-white">{selectedDuration} hour{selectedDuration > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="text-white">{new Date(selectedDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="text-white">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span className="text-white text-right max-w-[200px] truncate">{meetingLocation}</span>
                </div>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Session ({selectedDuration}h)</span>
                <span className="text-white">£{baseAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Service fee (10%)</span>
                <span className="text-white">£{customerServiceFee.toFixed(2)}</span>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex justify-between items-center">
                <span className="font-semibold text-white">Total</span>
                <span className="font-bold text-xl text-primary">£{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-white">Payment Method</h3>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-primary/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-white font-medium">Demo Payment</span>
                </div>
                <div className="w-4 h-4 rounded-full bg-primary border-2 border-primary" />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                This is a demo - no actual payment will be processed
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 mx-auto max-w-md p-4 bg-background border-t border-white/10 z-50">
        <Button 
          onClick={() => step === 1 ? setStep(2) : handleConfirmBooking()}
          disabled={bookingMutation.isPending}
          className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-lg shadow-primary/25"
          data-testid={step === 1 ? "button-continue" : "button-confirm"}
        >
          {bookingMutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : step === 1 ? (
            "Continue to Payment"
          ) : (
            `Confirm Booking - £${grandTotal.toFixed(2)}`
          )}
        </Button>
      </div>

      {/* Location Picker Dialog */}
      <Dialog open={showLocationPicker} onOpenChange={setShowLocationPicker}>
        <DialogContent className="bg-background border-white/10 max-h-[85vh] overflow-hidden flex flex-col w-[88vw] max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Choose Location</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {/* Use Current Location */}
            <button
              onClick={handleUseCurrentLocation}
              disabled={isGettingLocation}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors border border-primary/20 disabled:opacity-50"
              data-testid="button-use-current-location"
            >
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                {isGettingLocation ? (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                ) : (
                  <Navigation className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="text-left">
                <p className="font-medium text-white">Use Current Location</p>
                <p className="text-xs text-muted-foreground">Share your GPS location</p>
              </div>
            </button>

            {/* Pick on Map */}
            <button
              onClick={() => setShowMapPicker(true)}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 transition-colors border border-violet-500/20"
              data-testid="button-pick-on-map"
            >
              <div className="w-10 h-10 bg-violet-500/20 rounded-full flex items-center justify-center">
                <Map className="w-5 h-5 text-violet-400" />
              </div>
              <div className="text-left">
                <p className="font-medium text-white">Pick on Map</p>
                <p className="text-xs text-muted-foreground">Tap anywhere to set location</p>
              </div>
            </button>

            {/* Enter Manually */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Enter Manually</span>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Type a location..."
                  className="flex-1 bg-card border-white/10"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                      setMeetingLocation((e.target as HTMLInputElement).value.trim());
                      setLocationMode('manual');
                      setShowLocationPicker(false);
                    }
                  }}
                  data-testid="input-manual-location"
                />
                <Button
                  variant="outline"
                  className="border-white/20"
                  onClick={(e) => {
                    const input = (e.currentTarget.previousSibling as HTMLInputElement);
                    if (input.value.trim()) {
                      setMeetingLocation(input.value.trim());
                      setLocationMode('manual');
                      setShowLocationPicker(false);
                    }
                  }}
                >
                  Set
                </Button>
              </div>
            </div>

            {/* Popular Photo Spots */}
            {photoSpots.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Popular Photo Spots in {photographerCity}</span>
                </div>
                <div className="space-y-2">
                  {photoSpots.map((spot) => (
                    <button
                      key={spot.id}
                      onClick={() => {
                        setMeetingLocation(spot.name);
                        setLocationMode('spot');
                        setShowLocationPicker(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left",
                        meetingLocation === spot.name && "bg-white/5 border border-primary/30"
                      )}
                      data-testid={`button-spot-${spot.id}`}
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={spot.imageUrl} alt={spot.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{spot.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{spot.category}</p>
                      </div>
                      {meetingLocation === spot.name && (
                        <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Map Picker Dialog */}
      <Dialog open={showMapPicker} onOpenChange={(open) => {
        setShowMapPicker(open);
        if (!open) setSelectedCoords(null);
      }}>
        <DialogContent className="bg-background border-white/10 p-0 overflow-hidden w-[92vw] max-w-md h-[80vh] rounded-2xl">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white">Pick Location</h3>
                <p className="text-xs text-muted-foreground">Tap on the map to set meeting point</p>
              </div>
              <button
                onClick={() => {
                  setShowMapPicker(false);
                  setSelectedCoords(null);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            
            <div className="flex-1 relative">
              <MapContainer
                center={mapCenter}
                zoom={13}
                className="h-full w-full"
                style={{ background: '#1a1a2e' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                <MapClickHandler onLocationSelect={handleMapLocationSelect} />
                <MapCenterUpdater center={mapCenter} />
                {selectedCoords && (
                  <Marker 
                    position={[selectedCoords.lat, selectedCoords.lng]}
                    icon={customIcon}
                  />
                )}
              </MapContainer>
              
              {/* Center on my location button */}
              <button
                onClick={centerOnMyLocation}
                disabled={isGettingLocation}
                className="absolute bottom-4 right-4 z-[1000] w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                data-testid="button-center-my-location"
              >
                {isGettingLocation ? (
                  <Loader2 className="w-5 h-5 text-gray-700 animate-spin" />
                ) : (
                  <Navigation className="w-5 h-5 text-gray-700" />
                )}
              </button>
            </div>
            
            <div className="p-4 border-t border-white/10 space-y-3">
              {selectedCoords ? (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-white">
                      {selectedCoords.lat.toFixed(4)}, {selectedCoords.lng.toFixed(4)}
                    </span>
                  </div>
                  <Button
                    onClick={confirmMapLocation}
                    className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90"
                    data-testid="button-confirm-map-location"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Confirm This Location
                  </Button>
                </>
              ) : (
                <p className="text-center text-muted-foreground text-sm py-2">
                  Tap anywhere on the map to select a location
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom Date Picker Dialog */}
      <Dialog open={showDatePicker} onOpenChange={setShowDatePicker}>
        <DialogContent className="bg-background border-white/10 w-[88vw] max-w-sm rounded-2xl p-0 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <h3 className="text-white font-semibold">
                {calendarMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
              </h3>
              <button
                onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
                <div key={day} className="text-center text-xs text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {(() => {
                const year = calendarMonth.getFullYear();
                const month = calendarMonth.getMonth();
                const firstDay = new Date(year, month, 1);
                const lastDay = new Date(year, month + 1, 0);
                const startPadding = (firstDay.getDay() + 6) % 7;
                const days = [];
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                for (let i = 0; i < startPadding; i++) {
                  days.push(<div key={`pad-${i}`} />);
                }
                
                for (let day = 1; day <= lastDay.getDate(); day++) {
                  const date = new Date(year, month, day);
                  const dateStr = date.toISOString().split('T')[0];
                  const isSelected = dateStr === selectedDate;
                  const isPast = date < today;
                  const isToday = date.toDateString() === today.toDateString();
                  
                  days.push(
                    <button
                      key={day}
                      onClick={() => {
                        if (!isPast) {
                          setSelectedDate(dateStr);
                          setShowDatePicker(false);
                        }
                      }}
                      disabled={isPast}
                      className={cn(
                        "w-full aspect-square rounded-full flex items-center justify-center text-sm font-medium transition-all",
                        isSelected && "bg-primary text-white",
                        !isSelected && !isPast && "hover:bg-white/10 text-white",
                        isPast && "text-muted-foreground/50 cursor-not-allowed",
                        isToday && !isSelected && "ring-1 ring-primary"
                      )}
                    >
                      {day}
                    </button>
                  );
                }
                
                return days;
              })()}
            </div>
          </div>
          
          <div className="p-4 border-t border-white/10 flex gap-2">
            <Button
              variant="outline"
              className="flex-1 border-white/20"
              onClick={() => {
                setSelectedDate(new Date().toISOString().split('T')[0]);
                setShowDatePicker(false);
              }}
            >
              Today
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={() => setShowDatePicker(false)}
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom Time Picker Dialog */}
      <Dialog open={showTimePicker} onOpenChange={setShowTimePicker}>
        <DialogContent className="bg-background border-white/10 w-[88vw] max-w-sm rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b border-white/10">
            <DialogTitle className="text-white text-center">Select Time</DialogTitle>
          </DialogHeader>
          
          <div className="p-6">
            <div className="flex justify-center gap-4">
              {/* Hours */}
              <div className="flex-1 max-w-[80px]">
                <p className="text-xs text-muted-foreground text-center mb-2">Hour</p>
                <div className="h-48 overflow-y-auto rounded-xl bg-white/5 scrollbar-hide">
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i;
                    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                    const currentHour = parseInt(selectedTime.split(':')[0]);
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          const [, mins] = selectedTime.split(':');
                          setSelectedTime(`${hour.toString().padStart(2, '0')}:${mins}`);
                        }}
                        className={cn(
                          "w-full py-3 text-center text-lg font-medium transition-colors",
                          hour === currentHour ? "bg-primary text-white" : "text-white hover:bg-white/10"
                        )}
                      >
                        {hour12} {hour < 12 ? 'AM' : 'PM'}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Minutes */}
              <div className="flex-1 max-w-[80px]">
                <p className="text-xs text-muted-foreground text-center mb-2">Minute</p>
                <div className="h-48 overflow-y-auto rounded-xl bg-white/5 scrollbar-hide">
                  {Array.from({ length: 12 }, (_, i) => {
                    const mins = i * 5;
                    const currentMins = parseInt(selectedTime.split(':')[1]);
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          const [hours] = selectedTime.split(':');
                          setSelectedTime(`${hours}:${mins.toString().padStart(2, '0')}`);
                        }}
                        className={cn(
                          "w-full py-3 text-center text-lg font-medium transition-colors",
                          mins === currentMins ? "bg-primary text-white" : "text-white hover:bg-white/10"
                        )}
                      >
                        :{mins.toString().padStart(2, '0')}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <p className="text-center text-white text-2xl font-bold mt-4">
              {(() => {
                const [h, m] = selectedTime.split(':');
                const hour = parseInt(h);
                const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                const ampm = hour >= 12 ? 'PM' : 'AM';
                return `${hour12}:${m} ${ampm}`;
              })()}
            </p>
          </div>
          
          <div className="p-4 border-t border-white/10">
            <Button
              className="w-full h-12 bg-primary hover:bg-primary/90 rounded-xl"
              onClick={() => setShowTimePicker(false)}
            >
              <Check className="w-4 h-4 mr-2" />
              Confirm Time
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
