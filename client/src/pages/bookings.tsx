import { BottomNav } from "@/components/bottom-nav";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/api";
import { Calendar, MapPin, Clock, User, Loader2, Images, Download, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PhotoDelivery {
  id: string;
  bookingId: string;
  photos: string[];
  message?: string;
  deliveredAt: string;
  downloadedAt?: string;
}

export default function Bookings() {
  const [, setLocation] = useLocation();
  const [selectedBookingPhotos, setSelectedBookingPhotos] = useState<PhotoDelivery | null>(null);
  const [viewingPhotoIndex, setViewingPhotoIndex] = useState(0);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["customerBookings", user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/bookings/customer/${user?.id}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch bookings");
      return res.json();
    },
    enabled: !!user?.id,
  });

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
        <h1 className="text-xl font-bold text-white mb-4">Please log in to view bookings</h1>
        <Link href="/login" className="text-primary hover:underline">Log In</Link>
      </div>
    );
  }

  const upcomingBookings = bookings.filter((b: any) => 
    new Date(b.scheduledDate) >= new Date() && b.status !== 'cancelled'
  );
  const pastBookings = bookings.filter((b: any) => 
    new Date(b.scheduledDate) < new Date() || b.status === 'completed'
  );

  const fetchBookingPhotos = async (bookingId: string) => {
    const res = await fetch(`/api/bookings/${bookingId}/photos`, {
      credentials: "include",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data as PhotoDelivery | null;
  };

  const handleViewPhotos = async (bookingId: string) => {
    const photos = await fetchBookingPhotos(bookingId);
    if (photos && photos.photos && photos.photos.length > 0) {
      setSelectedBookingPhotos(photos);
      setViewingPhotoIndex(0);
    }
  };

  const handleDownloadPhoto = (url: string, index: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `photo-${index + 1}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = async () => {
    if (!selectedBookingPhotos) return;
    
    selectedBookingPhotos.photos.forEach((url, index) => {
      setTimeout(() => handleDownloadPhoto(url, index), index * 500);
    });
    
    await fetch(`/api/bookings/${selectedBookingPhotos.bookingId}/photos/downloaded`, {
      method: 'POST',
      credentials: 'include',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500/20 text-green-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      case 'completed': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-6 pt-12">
        <h1 className="text-2xl font-bold text-white mb-2">My Bookings</h1>
        <p className="text-muted-foreground">View and manage your photo sessions</p>
      </div>

      <div className="px-6 space-y-8">
        <section>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Upcoming Sessions
          </h2>
          
          {bookingsLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
            </div>
          ) : upcomingBookings.length === 0 ? (
            <div className="glass-panel rounded-2xl p-8 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No upcoming bookings</p>
              <Link href="/home">
                <span className="text-primary font-medium hover:underline cursor-pointer" data-testid="link-find-photographers">
                  Find a photographer
                </span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.map((booking: any) => (
                <div key={booking.id} className="glass-panel rounded-2xl p-4 space-y-3" data-testid={`booking-card-${booking.id}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">Photo Session</h3>
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
                    <span className="text-muted-foreground text-sm">Total</span>
                    <span className="text-white font-bold">£{parseFloat(booking.totalAmount).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {pastBookings.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-white mb-4">Past Sessions</h2>
            <div className="space-y-4">
              {pastBookings.map((booking: any) => (
                <div key={booking.id} className="glass-panel rounded-2xl p-4 space-y-3" data-testid={`past-booking-${booking.id}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white">Photo Session</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(booking.scheduledDate), 'MMM d, yyyy')} - {booking.location}
                      </p>
                    </div>
                    <span className="text-white font-bold">£{parseFloat(booking.totalAmount).toFixed(2)}</span>
                  </div>
                  
                  {booking.status === 'completed' && (
                    <Button
                      onClick={() => handleViewPhotos(booking.id)}
                      variant="outline"
                      className="w-full mt-2 border-primary/50 text-primary hover:bg-primary/10"
                      data-testid={`button-view-photos-${booking.id}`}
                    >
                      <Images className="w-4 h-4 mr-2" />
                      View Photos
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <BottomNav />

      {/* Photo Gallery Dialog */}
      <Dialog open={!!selectedBookingPhotos} onOpenChange={(open) => !open && setSelectedBookingPhotos(null)}>
        <DialogContent className="max-w-4xl w-full h-[90vh] p-0 bg-black/95 border-white/10">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div>
                <h2 className="text-white font-bold">Your Photos</h2>
                {selectedBookingPhotos?.message && (
                  <p className="text-sm text-muted-foreground">{selectedBookingPhotos.message}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleDownloadAll}
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                  data-testid="button-download-all"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download All
                </Button>
                <button
                  onClick={() => setSelectedBookingPhotos(null)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
                  data-testid="button-close-gallery"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main Photo View */}
            {selectedBookingPhotos && selectedBookingPhotos.photos.length > 0 && (
              <div className="flex-1 flex items-center justify-center relative p-4">
                <img
                  src={selectedBookingPhotos.photos[viewingPhotoIndex]}
                  alt={`Photo ${viewingPhotoIndex + 1}`}
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
                
                {/* Navigation Arrows */}
                {selectedBookingPhotos.photos.length > 1 && (
                  <>
                    <button
                      onClick={() => setViewingPhotoIndex(i => i > 0 ? i - 1 : selectedBookingPhotos!.photos.length - 1)}
                      className="absolute left-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70"
                      data-testid="button-prev-photo"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => setViewingPhotoIndex(i => i < selectedBookingPhotos!.photos.length - 1 ? i + 1 : 0)}
                      className="absolute right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70"
                      data-testid="button-next-photo"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Photo Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
                  {viewingPhotoIndex + 1} / {selectedBookingPhotos.photos.length}
                </div>
              </div>
            )}

            {/* Thumbnails */}
            {selectedBookingPhotos && selectedBookingPhotos.photos.length > 1 && (
              <div className="p-4 border-t border-white/10">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {selectedBookingPhotos.photos.map((photo, idx) => (
                    <button
                      key={idx}
                      onClick={() => setViewingPhotoIndex(idx)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        idx === viewingPhotoIndex ? 'border-primary' : 'border-transparent hover:border-white/30'
                      }`}
                      data-testid={`thumbnail-${idx}`}
                    >
                      <img src={photo} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
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
