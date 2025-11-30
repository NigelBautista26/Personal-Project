import { BottomNav } from "@/components/bottom-nav";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/api";
import { Calendar, MapPin, Clock, User, Loader2, Check, X, Upload, Images, Plus, Trash2, AlertTriangle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface PhotoDelivery {
  id: string;
  bookingId: string;
  photos: string[];
  message?: string;
  deliveredAt: string;
}

export default function PhotographerBookings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadBookingId, setUploadBookingId] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadingPhotos, setUploadingPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: user, isLoading: userLoading } = useQuery({
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

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
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

  const updateStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photographerBookings"] });
      toast({
        title: "Status Updated",
        description: "Booking status has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Could not update booking status.",
        variant: "destructive",
      });
    },
  });

  const fetchExistingDelivery = async (bookingId: string): Promise<PhotoDelivery | null> => {
    const res = await fetch(`/api/bookings/${bookingId}/photos`, { credentials: "include" });
    if (!res.ok) return null;
    return res.json();
  };

  const handleOpenUploadDialog = async (bookingId: string) => {
    setUploadBookingId(bookingId);
    setUploadMessage("");
    setUploadingPhotos([]);
    
    const existing = await fetchExistingDelivery(bookingId);
    if (existing && existing.photos) {
      setUploadingPhotos(existing.photos);
      setUploadMessage(existing.message || "");
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !uploadBookingId) return;

    setIsUploading(true);
    
    try {
      for (const file of Array.from(files)) {
        const uploadRes = await fetch("/api/objects/upload", {
          method: "POST",
          credentials: "include",
        });
        
        if (!uploadRes.ok) throw new Error("Failed to get upload URL");
        const { uploadURL, objectPath } = await uploadRes.json();

        const putRes = await fetch(uploadURL, {
          method: "PUT",
          headers: {
            "Content-Type": file.type || "image/jpeg",
          },
          body: file,
        });
        
        if (!putRes.ok) throw new Error("Failed to upload file");

        const addPhotoRes = await fetch(`/api/bookings/${uploadBookingId}/photos/upload`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ imageUrl: objectPath }),
        });
        
        if (!addPhotoRes.ok) throw new Error("Failed to add photo to delivery");
        const delivery = await addPhotoRes.json();
        setUploadingPhotos(delivery.photos || []);
      }
      
      toast({
        title: "Photos Uploaded",
        description: `${files.length} photo(s) uploaded successfully.`,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: "Could not upload photos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSaveDelivery = async () => {
    if (!uploadBookingId) return;
    
    try {
      await fetch(`/api/bookings/${uploadBookingId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: uploadMessage }),
      });
      
      toast({
        title: "Photos Delivered",
        description: "Your photos have been sent to the customer.",
      });
      
      setUploadBookingId(null);
    } catch (error) {
      toast({
        title: "Delivery Failed",
        description: "Could not save photo delivery.",
        variant: "destructive",
      });
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== 'photographer') {
    setLocation("/login");
    return null;
  }

  const pendingBookings = bookings.filter((b: any) => b.status === 'pending');
  const confirmedBookings = bookings.filter((b: any) => 
    b.status === 'confirmed' && new Date(b.scheduledDate) >= new Date()
  );
  const expiredBookings = bookings.filter((b: any) => b.status === 'expired');
  const awaitingUploadBookings = bookings.filter((b: any) => 
    b.status === 'confirmed' && new Date(b.scheduledDate) < new Date()
  );
  const completedBookings = bookings.filter((b: any) => b.status === 'completed');
  const cancelledBookings = bookings.filter((b: any) => b.status === 'cancelled');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500/20 text-green-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      case 'expired': return 'bg-orange-500/20 text-orange-400';
      case 'completed': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getTimeRemaining = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m left to respond`;
    }
    return `${minutes}m left to respond`;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-6 pt-12">
        <h1 className="text-2xl font-bold text-white mb-2">My Bookings</h1>
        <p className="text-muted-foreground">Manage your upcoming photo sessions</p>
      </div>

      <div className="px-6 space-y-8">
        {pendingBookings.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              Pending Requests ({pendingBookings.length})
            </h2>
            
            <div className="space-y-4">
              {pendingBookings.map((booking: any) => (
                <div key={booking.id} className="glass-panel rounded-2xl p-4 space-y-3 border border-yellow-500/30" data-testid={`booking-pending-${booking.id}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center overflow-hidden">
                        {booking.customer?.profileImageUrl ? (
                          <img 
                            src={booking.customer.profileImageUrl} 
                            alt={booking.customer.fullName} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-yellow-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{booking.customer?.fullName || 'New Booking Request'}</h3>
                        <p className="text-sm text-muted-foreground">{booking.duration} hour{booking.duration > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-primary">£{parseFloat(booking.photographerEarnings).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(booking.scheduledDate), 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{booking.scheduledTime}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{booking.location}</span>
                  </div>
                  
                  {booking.expiresAt && (
                    <div className="flex items-center gap-2 text-sm text-orange-400 bg-orange-500/10 px-3 py-2 rounded-lg">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{getTimeRemaining(booking.expiresAt)}</span>
                    </div>
                  )}
                  
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => updateStatusMutation.mutate({ bookingId: booking.id, status: 'confirmed' })}
                      disabled={updateStatusMutation.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      data-testid={`button-accept-${booking.id}`}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Accept
                    </Button>
                    <Button
                      onClick={() => updateStatusMutation.mutate({ bookingId: booking.id, status: 'cancelled' })}
                      disabled={updateStatusMutation.isPending}
                      variant="outline"
                      className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
                      data-testid={`button-decline-${booking.id}`}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Upcoming Sessions
          </h2>
          
          {bookingsLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
            </div>
          ) : confirmedBookings.length === 0 ? (
            <div className="glass-panel rounded-2xl p-8 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No upcoming sessions</p>
            </div>
          ) : (
            <div className="space-y-4">
              {confirmedBookings.map((booking: any) => (
                <div key={booking.id} className="glass-panel rounded-2xl p-4 space-y-3" data-testid={`booking-confirmed-${booking.id}`}>
                  <div className="flex items-start justify-between">
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
                      <div>
                        <h3 className="font-bold text-white">{booking.customer?.fullName || 'Photo Session'}</h3>
                        <p className="text-sm text-muted-foreground">{booking.duration} hour{booking.duration > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(booking.scheduledDate), 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{booking.scheduledTime}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{booking.location}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-white/10">
                    <span className="text-muted-foreground text-sm">You'll earn</span>
                    <span className="text-primary font-bold">£{parseFloat(booking.photographerEarnings).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {expiredBookings.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              Missed Requests ({expiredBookings.length})
            </h2>
            <p className="text-sm text-muted-foreground mb-4">These booking requests expired because they weren't responded to within 24 hours.</p>
            <div className="space-y-4">
              {expiredBookings.map((booking: any) => (
                <div key={booking.id} className="glass-panel rounded-2xl p-4 space-y-3 border border-orange-500/30 opacity-75" data-testid={`booking-expired-${booking.id}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center overflow-hidden">
                        {booking.customer?.profileImageUrl ? (
                          <img 
                            src={booking.customer.profileImageUrl} 
                            alt={booking.customer.fullName} 
                            className="w-full h-full object-cover opacity-70"
                          />
                        ) : (
                          <User className="w-5 h-5 text-orange-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{booking.customer?.fullName || 'Customer'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(booking.scheduledDate), 'MMM d, yyyy')} - {booking.location}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs px-2 py-1 rounded-full bg-orange-500/20 text-orange-400">missed</span>
                      <p className="text-muted-foreground text-sm mt-1">£{parseFloat(booking.photographerEarnings).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {awaitingUploadBookings.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-400" />
              Ready for Photos ({awaitingUploadBookings.length})
            </h2>
            <p className="text-sm text-muted-foreground mb-4">These sessions are complete. Upload photos to finalize and get paid.</p>
            <div className="space-y-4">
              {awaitingUploadBookings.map((booking: any) => (
                <div key={booking.id} className="glass-panel rounded-2xl p-4 space-y-3 border border-blue-500/30" data-testid={`booking-upload-${booking.id}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center overflow-hidden">
                        {booking.customer?.profileImageUrl ? (
                          <img 
                            src={booking.customer.profileImageUrl} 
                            alt={booking.customer.fullName} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-blue-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{booking.customer?.fullName || 'Customer'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(booking.scheduledDate), 'MMM d, yyyy')} - {booking.location}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">upload photos</span>
                      <p className="text-white font-bold mt-1">£{parseFloat(booking.photographerEarnings).toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleOpenUploadDialog(booking.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    data-testid={`button-upload-photos-${booking.id}`}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Photos Now
                  </Button>
                </div>
              ))}
            </div>
          </section>
        )}

        {completedBookings.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-white mb-4">Completed Sessions</h2>
            <div className="space-y-4">
              {completedBookings.slice(0, 5).map((booking: any) => (
                <div key={booking.id} className="glass-panel rounded-2xl p-4 space-y-3" data-testid={`booking-completed-${booking.id}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted/20 flex items-center justify-center overflow-hidden">
                        {booking.customer?.profileImageUrl ? (
                          <img 
                            src={booking.customer.profileImageUrl} 
                            alt={booking.customer.fullName} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{booking.customer?.fullName || 'Customer'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(booking.scheduledDate), 'MMM d, yyyy')} - {booking.location}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">completed</span>
                      <p className="text-white font-bold mt-1">£{parseFloat(booking.photographerEarnings).toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleOpenUploadDialog(booking.id)}
                    variant="outline"
                    className="w-full border-primary/50 text-primary hover:bg-primary/10"
                    data-testid={`button-upload-photos-${booking.id}`}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Manage Photos
                  </Button>
                </div>
              ))}
            </div>
          </section>
        )}

        {cancelledBookings.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <X className="w-5 h-5 text-red-400" />
              Declined
            </h2>
            <div className="space-y-4">
              {cancelledBookings.map((booking: any) => (
                <div key={booking.id} className="glass-panel rounded-2xl p-4 space-y-3 opacity-60" data-testid={`booking-cancelled-${booking.id}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center overflow-hidden">
                        {booking.customer?.profileImageUrl ? (
                          <img 
                            src={booking.customer.profileImageUrl} 
                            alt={booking.customer.fullName} 
                            className="w-full h-full object-cover opacity-50"
                          />
                        ) : (
                          <User className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{booking.customer?.fullName || 'Customer'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(booking.scheduledDate), 'MMM d, yyyy')} - {booking.location}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400">declined</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <BottomNav />

      {/* Photo Upload Dialog */}
      <Dialog open={!!uploadBookingId} onOpenChange={(open) => !open && setUploadBookingId(null)}>
        <DialogContent className="max-w-lg bg-background border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Images className="w-5 h-5" />
              Deliver Photos
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Photo Grid */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Photos ({uploadingPhotos.length})</label>
              <div className="grid grid-cols-3 gap-2">
                {uploadingPhotos.map((photo, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
                    <img src={photo} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
                
                {/* Add Photo Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="aspect-square rounded-lg border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                  data-testid="button-add-photo"
                >
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-6 h-6" />
                      <span className="text-xs mt-1">Add</span>
                    </>
                  )}
                </button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Message */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Message to Customer (optional)</label>
              <Textarea
                value={uploadMessage}
                onChange={(e) => setUploadMessage(e.target.value)}
                placeholder="Add a personal note..."
                className="bg-card border-white/10"
                data-testid="input-delivery-message"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setUploadBookingId(null)}
                className="flex-1 border-white/20"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveDelivery}
                disabled={uploadingPhotos.length === 0}
                className="flex-1 bg-primary hover:bg-primary/90"
                data-testid="button-deliver-photos"
              >
                <Upload className="w-4 h-4 mr-2" />
                Deliver Photos
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
