import { useRoute, useLocation } from "wouter";
import { ArrowLeft, Calendar, Clock, MapPin, CreditCard, Check, Loader2, Navigation, Camera, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getPhotographer, getCurrentUser } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PhotoSpot {
  id: string;
  name: string;
  city: string;
  description: string;
  category: string;
  imageUrl: string;
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
  const [locationMode, setLocationMode] = useState<'spot' | 'current' | 'manual'>('manual');
  
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

  if (photographerLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
        <h1 className="text-xl font-bold text-white mb-4">Please log in to book</h1>
        <Button onClick={() => setLocation("/login")}>Log In</Button>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mb-8 animate-in zoom-in duration-300">
          <Check className="w-10 h-10 text-white" strokeWidth={3} />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h1>
        <p className="text-muted-foreground mb-8">
          Your session with {photographer?.fullName} has been confirmed for {selectedDate} at {selectedTime}.
        </p>
        <Button onClick={() => setLocation("/bookings")} className="w-full h-14 rounded-xl bg-white text-black hover:bg-white/90 font-bold" data-testid="button-view-bookings">
          View My Bookings
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="p-6 pt-12 flex items-center gap-4">
        <button 
          onClick={() => step === 1 ? window.history.back() : setStep(step - 1)} 
          className="w-10 h-10 glass-dark rounded-full flex items-center justify-center text-white hover:bg-white/10"
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-white">
          {step === 1 ? "Book Session" : "Confirm Booking"}
        </h1>
      </div>

      <div className="px-6">
        <div className="glass-panel rounded-2xl p-4 mb-6 flex items-center gap-4">
          <img 
            src={photographer?.profileImageUrl || "https://via.placeholder.com/60"} 
            alt={photographer?.fullName} 
            className="w-14 h-14 rounded-full object-cover"
          />
          <div>
            <h2 className="text-white font-bold">{photographer?.fullName}</h2>
            <p className="text-sm text-muted-foreground">{photographer?.location}</p>
            <p className="text-sm text-primary font-medium">£{hourlyRate}/hour</p>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-8">
        {step === 1 && (
          <>
            <section>
              <h3 className="text-white font-bold mb-4">Duration</h3>
              <div className="flex gap-3">
                {durations.map((d) => (
                  <button
                    key={d.hours}
                    onClick={() => setSelectedDuration(d.hours)}
                    className={cn(
                      "flex-1 py-3 px-4 rounded-xl border text-center transition-all",
                      selectedDuration === d.hours 
                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                        : "bg-card border-white/10 text-muted-foreground hover:bg-white/5"
                    )}
                    data-testid={`button-duration-${d.hours}`}
                  >
                    <span className="block font-bold text-sm">{d.label}</span>
                    <span className="text-xs opacity-80">£{hourlyRate * d.hours}</span>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-white font-bold mb-4">Where should we meet?</h3>
              
              <button
                onClick={() => setShowLocationPicker(true)}
                className="w-full bg-card border border-white/10 rounded-xl p-4 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
                data-testid="button-select-location"
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  meetingLocation ? "bg-primary/20" : "bg-white/10"
                )}>
                  {locationMode === 'spot' ? (
                    <Camera className="w-5 h-5 text-primary" />
                  ) : locationMode === 'current' ? (
                    <Navigation className="w-5 h-5 text-primary" />
                  ) : (
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  {meetingLocation ? (
                    <>
                      <p className="text-white font-medium">{meetingLocation}</p>
                      <p className="text-xs text-muted-foreground">
                        {locationMode === 'spot' ? 'Photo Spot' : locationMode === 'current' ? 'Current Location' : 'Custom Location'}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-muted-foreground">Select a location</p>
                      <p className="text-xs text-muted-foreground">Choose a photo spot or enter manually</p>
                    </>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </section>

            <section>
              <h3 className="text-white font-bold mb-4">When?</h3>
              <div className="flex gap-3">
                <div className="flex-1 bg-card border border-white/10 rounded-xl p-4 flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <Input 
                    type="date" 
                    value={selectedDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-transparent border-none text-white focus-visible:ring-0 p-0"
                    data-testid="input-date"
                  />
                </div>
                <div className="flex-1 bg-card border border-white/10 rounded-xl p-4 flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <Input 
                    type="time" 
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="bg-transparent border-none text-white focus-visible:ring-0 p-0"
                    data-testid="input-time"
                  />
                </div>
              </div>
            </section>
          </>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-card border border-white/10 rounded-2xl p-6 space-y-4">
              <h3 className="text-white font-bold mb-2">Booking Summary</h3>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Photography Session ({selectedDuration} hour{selectedDuration > 1 ? 's' : ''})</span>
                <span className="text-white font-medium">£{baseAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Location</span>
                <span className="text-white font-medium">{meetingLocation}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date & Time</span>
                <span className="text-white font-medium">{selectedDate} at {selectedTime}</span>
              </div>
              <div className="h-px bg-white/10 my-2" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Service Fee (10%)</span>
                <span>£{customerServiceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span className="text-white">Total</span>
                <span className="text-primary">£{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-white font-bold">Payment Method</h3>
              <div className="flex items-center justify-between p-4 rounded-xl border border-primary bg-primary/10">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-primary" />
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

      <Dialog open={showLocationPicker} onOpenChange={setShowLocationPicker}>
        <DialogContent className="max-w-md w-[92vw] bg-background border-white/10 max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-white">Choose Location</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            <button
              onClick={() => {
                if (!navigator.geolocation) {
                  toast({ title: "Location not available", description: "Your browser doesn't support geolocation", variant: "destructive" });
                  return;
                }
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    setMeetingLocation(`My Current Location (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`);
                    setLocationMode('current');
                    setShowLocationPicker(false);
                  },
                  () => {
                    toast({ title: "Location error", description: "Could not get your location", variant: "destructive" });
                  }
                );
              }}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors border border-primary/20"
              data-testid="button-use-current-location"
            >
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <Navigation className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium text-white">Use Current Location</p>
                <p className="text-xs text-muted-foreground">Share your GPS location</p>
              </div>
            </button>

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
    </div>
  );
}
