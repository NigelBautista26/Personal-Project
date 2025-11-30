import { useState, useEffect, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { Navigation, MapPin, Loader2, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface LiveLocationSharingProps {
  bookingId: string;
  scheduledDate: string;
  scheduledTime: string;
}

export function LiveLocationSharing({ bookingId, scheduledDate, scheduledTime }: LiveLocationSharingProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [minutesUntilAvailable, setMinutesUntilAvailable] = useState<number | null>(null);
  const { toast } = useToast();

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
      } else {
        setMinutesUntilAvailable(Math.ceil(minutesUntil - 10));
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
        body: JSON.stringify({ latitude, longitude, accuracy }),
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
        setCurrentLocation({ lat: latitude, lng: longitude });
        updateLocationMutation.mutate({ latitude, longitude, accuracy });
      },
      (err) => {
        console.error("Geolocation error:", err);
        setError(err.message);
        if (err.code === err.PERMISSION_DENIED) {
          toast({
            title: "Permission Denied",
            description: "Please allow location access to share your location",
            variant: "destructive",
          });
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
    toast({
      title: "Location Sharing Started",
      description: "Your photographer can now see your location",
    });
  }, [bookingId, toast, updateLocationMutation]);

  const stopSharing = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsSharing(false);
    setCurrentLocation(null);
    stopLocationMutation.mutate();
    toast({
      title: "Location Sharing Stopped",
      description: "Your location is no longer visible to the photographer",
    });
  }, [watchId, stopLocationMutation, toast]);

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
            <p className="text-white font-medium">Share Live Location</p>
            <p className="text-xs text-muted-foreground">
              Available in {minutesUntilAvailable} minute{minutesUntilAvailable > 1 ? 's' : ''}
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
            <p className="text-white font-medium">Sharing Location</p>
            {currentLocation && (
              <p className="text-xs text-blue-400 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={stopSharing}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            data-testid="button-stop-sharing"
          >
            <X className="w-4 h-4 mr-1" />
            Stop
          </Button>
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
          <p className="text-white font-medium">Share Live Location</p>
          <p className="text-xs text-muted-foreground">
            Help your photographer find you
          </p>
        </div>
        <Button
          onClick={startSharing}
          disabled={updateLocationMutation.isPending}
          className="bg-blue-500 hover:bg-blue-600"
          data-testid="button-start-sharing"
        >
          {updateLocationMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Share"
          )}
        </Button>
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
