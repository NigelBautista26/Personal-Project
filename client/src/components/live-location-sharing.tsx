import { useState, useEffect, useCallback, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Navigation, MapPin, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useBookingChannel } from "@/hooks/use-realtime";

interface LiveLocationSharingProps {
  bookingId: string;
  scheduledDate: string;
  scheduledTime: string;
  userType: "customer" | "photographer";
  onLocationUpdate?: (location: { lat: number; lng: number } | null) => void;
  onOtherPartyLocation?: (location: { lat: number; lng: number; updatedAt: string } | null) => void;
}

export function LiveLocationSharing({ 
  bookingId, 
  scheduledDate, 
  scheduledTime, 
  userType,
  onLocationUpdate,
  onOtherPartyLocation
}: LiveLocationSharingProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [minutesUntilAvailable, setMinutesUntilAvailable] = useState<number | null>(null);
  const [isWithinWindow, setIsWithinWindow] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const hasAutoStarted = useRef(false);
  const { toast } = useToast();

  // Subscribe to real-time location updates
  useBookingChannel(bookingId);

  const getSessionDateTime = useCallback(() => {
    const sessionDate = new Date(scheduledDate);
    const timeParts = scheduledTime.replace(/[AP]M/i, '').trim().split(':');
    const hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]) || 0;
    const isPM = scheduledTime.toLowerCase().includes('pm');
    sessionDate.setHours(isPM && hours !== 12 ? hours + 12 : hours === 12 && !isPM ? 0 : hours, minutes);
    return sessionDate;
  }, [scheduledDate, scheduledTime]);

  useEffect(() => {
    const checkAvailability = () => {
      const sessionDateTime = getSessionDateTime();
      const now = new Date();
      const minutesUntil = (sessionDateTime.getTime() - now.getTime()) / (1000 * 60);
      
      if (minutesUntil <= 10) {
        setMinutesUntilAvailable(null);
        setIsWithinWindow(true);
      } else {
        setMinutesUntilAvailable(Math.ceil(minutesUntil - 10));
        setIsWithinWindow(false);
      }
    };

    checkAvailability();
    const interval = setInterval(checkAvailability, 30000);
    return () => clearInterval(interval);
  }, [getSessionDateTime]);

  const updateLocationMutation = useMutation({
    mutationFn: async ({ latitude, longitude, accuracy }: { latitude: number; longitude: number; accuracy?: number }) => {
      const res = await fetch(`/api/bookings/${bookingId}/live-location`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ latitude, longitude, accuracy, userType }),
      });
      if (!res.ok) {
        const data = await res.json();
        if (data.minutesUntilAvailable) {
          setMinutesUntilAvailable(data.minutesUntilAvailable);
        }
        throw new Error(data.error || "Failed to update location");
      }
      return res.json();
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const stopLocationMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/bookings/${bookingId}/live-location`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to stop sharing");
      return res.json();
    },
  });

  const { data: otherPartyLocation } = useQuery<{ latitude: string; longitude: string; updatedAt: string } | null>({
    queryKey: ["other-party-location", bookingId, userType],
    queryFn: async () => {
      const endpoint = userType === "customer" 
        ? `/api/bookings/${bookingId}/photographer-location`
        : `/api/bookings/${bookingId}/live-location`;
      const res = await fetch(endpoint, { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: isWithinWindow,
    refetchInterval: 15000, // Reduced since WebSocket provides real-time updates
  });

  useEffect(() => {
    if (otherPartyLocation && onOtherPartyLocation) {
      onOtherPartyLocation({
        lat: parseFloat(otherPartyLocation.latitude),
        lng: parseFloat(otherPartyLocation.longitude),
        updatedAt: otherPartyLocation.updatedAt,
      });
    } else if (!otherPartyLocation && onOtherPartyLocation) {
      onOtherPartyLocation(null);
    }
  }, [otherPartyLocation, onOtherPartyLocation]);

  const startSharing = useCallback(() => {
    if (!navigator.geolocation) {
      toast({
        title: "Not Supported",
        description: "Your browser doesn't support location sharing",
        variant: "destructive",
      });
      return;
    }

    setError(null);
    
    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const newLocation = { lat: latitude, lng: longitude };
        setCurrentLocation(newLocation);
        onLocationUpdate?.(newLocation);
        updateLocationMutation.mutate({ latitude, longitude, accuracy });
      },
      (err) => {
        console.error("Geolocation error:", err);
        setError(err.message);
        if (err.code === err.PERMISSION_DENIED) {
          setPermissionDenied(true);
          stopSharing();
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );

    setWatchId(id);
    setIsSharing(true);
  }, [bookingId, toast, updateLocationMutation, onLocationUpdate]);

  const stopSharing = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsSharing(false);
    setCurrentLocation(null);
    onLocationUpdate?.(null);
    stopLocationMutation.mutate();
  }, [watchId, stopLocationMutation, onLocationUpdate]);

  useEffect(() => {
    if (isWithinWindow && !hasAutoStarted.current && !isSharing && !permissionDenied) {
      hasAutoStarted.current = true;
      startSharing();
    }
  }, [isWithinWindow, isSharing, permissionDenied, startSharing]);

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  if (minutesUntilAvailable !== null && minutesUntilAvailable > 0) {
    return (
      <div className="glass-dark rounded-2xl p-4 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted/20 flex items-center justify-center">
            <Navigation className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-white font-medium">Live Location Sharing</p>
            <p className="text-xs text-muted-foreground">
              Starts automatically in {minutesUntilAvailable} minute{minutesUntilAvailable > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (permissionDenied) {
    return (
      <div className="glass-dark rounded-2xl p-4 border border-red-500/30 bg-red-500/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <div className="flex-1">
            <p className="text-white font-medium">Location Access Denied</p>
            <p className="text-xs text-muted-foreground">
              Please enable location access in your browser settings to share your location
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isSharing) {
    return (
      <div className="glass-dark rounded-2xl p-4 border border-blue-500/30 bg-blue-500/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center relative">
            <Navigation className="w-5 h-5 text-blue-400" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
          </div>
          <div className="flex-1">
            <p className="text-white font-medium">Sharing Your Location</p>
            {currentLocation && (
              <p className="text-xs text-blue-400 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
              </p>
            )}
          </div>
          <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
        </div>
        {error && (
          <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="glass-dark rounded-2xl p-4 border border-white/10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
          <Navigation className="w-5 h-5 text-blue-400" />
        </div>
        <div className="flex-1">
          <p className="text-white font-medium">Live Location</p>
          <p className="text-xs text-muted-foreground">
            Starting location sharing...
          </p>
        </div>
        <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
      </div>
    </div>
  );
}
