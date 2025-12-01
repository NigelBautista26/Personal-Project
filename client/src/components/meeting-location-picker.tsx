import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Navigation, Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
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

interface MeetingLocationPickerProps {
  bookingId: string;
  bookingLocation: string;
  currentLatitude?: string | null;
  currentLongitude?: string | null;
  currentNotes?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
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
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export function MeetingLocationPicker({
  bookingId,
  bookingLocation,
  currentLatitude,
  currentLongitude,
  currentNotes,
  isOpen,
  onClose,
  onSuccess,
}: MeetingLocationPickerProps) {
  const [latitude, setLatitude] = useState<number | null>(
    currentLatitude ? parseFloat(currentLatitude) : null
  );
  const [longitude, setLongitude] = useState<number | null>(
    currentLongitude ? parseFloat(currentLongitude) : null
  );
  const [notes, setNotes] = useState(currentNotes || "");
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.5074, -0.1278]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (currentLatitude && currentLongitude) {
      const lat = parseFloat(currentLatitude);
      const lng = parseFloat(currentLongitude);
      setLatitude(lat);
      setLongitude(lng);
      setMapCenter([lat, lng]);
    }
  }, [currentLatitude, currentLongitude]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (latitude === null || longitude === null) throw new Error("Location required");
      const res = await fetch(`/api/bookings/${bookingId}/meeting-location`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ latitude, longitude, notes }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save location");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photographer-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["customer-bookings"] });
      toast({ title: "Meeting location saved" });
      onSuccess?.();
      onClose();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleLocationSelect = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    setMapCenter([lat, lng]);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Not supported", description: "Geolocation is not supported by your browser", variant: "destructive" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        handleLocationSelect(position.coords.latitude, position.coords.longitude);
      },
      () => {
        toast({ title: "Error", description: "Could not get your location", variant: "destructive" });
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-background border-white/10 max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-white">Set Meeting Location</DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto">
          <p className="text-sm text-muted-foreground">
            Set the exact meeting point for your session at <span className="text-white">{bookingLocation}</span>
          </p>

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
              {latitude && longitude && (
                <Marker position={[latitude, longitude]} icon={markerIcon} />
              )}
            </MapContainer>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Tap on the map to set the meeting point
          </p>

          {latitude && longitude && (
            <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm text-white">
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </span>
              <Check className="w-4 h-4 text-primary ml-auto" />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Meeting Notes (optional)</label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Meet at the main entrance, near the fountain..."
              className="bg-card border-white/10"
              data-testid="input-meeting-notes"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-white/10">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            data-testid="button-cancel-location"
          >
            Cancel
          </Button>
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={!latitude || !longitude || saveMutation.isPending}
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
      </DialogContent>
    </Dialog>
  );
}
