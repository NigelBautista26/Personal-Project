import { BottomNav } from "@/components/bottom-nav";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/api";
import { Calendar, MapPin, Clock, User, Loader2, Images, Download, X, ChevronLeft, ChevronRight, XCircle, Star, MessageSquare, Check, Camera, ImageIcon } from "lucide-react";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

interface PhotoDelivery {
  id: string;
  bookingId: string;
  photos: string[];
  message?: string;
  deliveredAt: string;
  downloadedAt?: string;
}

interface ReviewInfo {
  canReview: boolean;
  reason?: string;
  review?: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
  };
}

export default function Bookings() {
  const [, setLocation] = useLocation();
  const [selectedBookingPhotos, setSelectedBookingPhotos] = useState<PhotoDelivery | null>(null);
  const [viewingPhotoIndex, setViewingPhotoIndex] = useState(0);
  const [reviewingBookingId, setReviewingBookingId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  const queryClient = useQueryClient();

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

  const { data: reviewInfoMap = {} } = useQuery({
    queryKey: ["bookingReviewInfo", bookings.map((b: any) => b.id)],
    queryFn: async () => {
      const completedBookings = bookings.filter((b: any) => b.status === 'completed');
      const results: Record<string, ReviewInfo> = {};
      
      await Promise.all(
        completedBookings.map(async (booking: any) => {
          try {
            const res = await fetch(`/api/bookings/${booking.id}/can-review`, {
              credentials: "include",
            });
            if (res.ok) {
              results[booking.id] = await res.json();
            }
          } catch (e) {
            results[booking.id] = { canReview: false, reason: "Error checking" };
          }
        })
      );
      
      return results;
    },
    enabled: bookings.length > 0,
  });

  const submitReviewMutation = useMutation({
    mutationFn: async ({ bookingId, rating, comment }: { bookingId: string; rating: number; comment: string }) => {
      const res = await fetch(`/api/bookings/${bookingId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rating, comment: comment || undefined }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to submit review");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Review submitted! Thank you for your feedback.");
      setReviewingBookingId(null);
      setReviewRating(5);
      setReviewComment("");
      queryClient.invalidateQueries({ queryKey: ["bookingReviewInfo"] });
      queryClient.invalidateQueries({ queryKey: ["customerBookings"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Calculate filtered bookings
  const expiredBookings = bookings.filter((b: any) => b.status === 'expired');

  // Show toast notification for NEW expired bookings only (must be before early returns)
  useEffect(() => {
    if (expiredBookings.length === 0) return;
    
    // Get previously notified booking IDs from localStorage
    const STORAGE_KEY = 'snapnow_expired_notified';
    let notifiedIds: string[] = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      notifiedIds = stored ? JSON.parse(stored) : [];
    } catch (e) {
      notifiedIds = [];
    }
    
    // Find bookings we haven't notified about yet
    const newExpiredBookings = expiredBookings.filter((b: any) => !notifiedIds.includes(b.id));
    
    if (newExpiredBookings.length === 0) return;
    
    // Mark these as notified
    const updatedNotifiedIds = [...notifiedIds, ...newExpiredBookings.map((b: any) => b.id)];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotifiedIds));
    } catch (e) {}
    
    const photographerNames = newExpiredBookings.map((b: any) => b.photographer?.fullName || 'A photographer').join(', ');
    
    // Play notification sound
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 440;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {}
    
    toast.custom(
      (t) => (
        <div className="bg-zinc-900/95 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-4 shadow-2xl max-w-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-orange-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white text-sm">Booking request expired</p>
              <p className="text-zinc-400 text-xs mt-1">{photographerNames} didn't respond in time.</p>
              <button 
                onClick={() => {
                  toast.dismiss(t);
                  setLocation("/photographers");
                }}
                className="mt-3 px-4 py-2 bg-primary text-white text-xs font-medium rounded-xl hover:bg-primary/90 transition-colors"
              >
                Find another photographer
              </button>
            </div>
            <button 
              onClick={() => toast.dismiss(t)}
              className="text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ),
      { duration: 4000 }
    );
  }, [expiredBookings, setLocation]);

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
    (b.status === 'pending' || b.status === 'confirmed') && 
    new Date(b.scheduledDate) >= new Date()
  );
  const awaitingPhotosBookings = bookings.filter((b: any) => 
    b.status === 'confirmed' && new Date(b.scheduledDate) < new Date()
  );
  const completedBookings = bookings.filter((b: any) => b.status === 'completed');
  const cancelledBookings = bookings.filter((b: any) => b.status === 'cancelled');

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

  const handleDownloadPhoto = async (url: string, index: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `photo-${index + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      const link = document.createElement('a');
      link.href = url;
      link.download = `photo-${index + 1}.jpg`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownloadAll = async () => {
    if (!selectedBookingPhotos) return;
    
    for (let i = 0; i < selectedBookingPhotos.photos.length; i++) {
      await handleDownloadPhoto(selectedBookingPhotos.photos[i], i);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
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
      case 'expired': return 'bg-orange-500/20 text-orange-400';
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
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                        {booking.photographer?.profileImageUrl ? (
                          <img 
                            src={booking.photographer.profileImageUrl} 
                            alt={booking.photographer.fullName} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{booking.photographer?.fullName || 'Photo Session'}</h3>
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

        {awaitingPhotosBookings.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <div className="relative">
                <Camera className="w-5 h-5 text-blue-400" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              </div>
              Awaiting Photos
            </h2>
            <div className="space-y-4">
              {awaitingPhotosBookings.map((booking: any) => (
                <div key={booking.id} className="glass-panel rounded-2xl overflow-hidden" data-testid={`awaiting-booking-${booking.id}`}>
                  {/* Progress indicator bar */}
                  <div className="h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 animate-pulse" />
                  
                  <div className="p-4">
                    {/* Header with photographer info */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center overflow-hidden ring-2 ring-blue-500/30">
                        {booking.photographer?.profileImageUrl ? (
                          <img 
                            src={booking.photographer.profileImageUrl} 
                            alt={booking.photographer.fullName} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{booking.photographer?.fullName || 'Photo Session'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(booking.scheduledDate), 'MMM d, yyyy')} - {booking.location}
                        </p>
                      </div>
                      <span className="text-white font-bold">£{parseFloat(booking.totalAmount).toFixed(2)}</span>
                    </div>
                    
                    {/* Photo placeholder grid - blurred preview */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {[
                        'from-blue-600/30 via-purple-500/20 to-pink-500/30',
                        'from-amber-500/30 via-orange-400/20 to-red-500/30',
                        'from-emerald-500/30 via-teal-400/20 to-cyan-500/30',
                        'from-indigo-500/30 via-blue-400/20 to-sky-500/30'
                      ].map((gradient, i) => (
                        <div 
                          key={i} 
                          className={`aspect-square rounded-lg bg-gradient-to-br ${gradient} backdrop-blur-sm overflow-hidden relative`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full bg-white/10 backdrop-blur animate-pulse" />
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Status message */}
                    <div className="flex items-center gap-2 text-blue-400 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Your photographer is uploading your photos...</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {completedBookings.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-white mb-4">Completed Sessions</h2>
            <div className="space-y-4">
              {completedBookings.map((booking: any) => {
                const reviewInfo = reviewInfoMap[booking.id];
                
                return (
                  <div key={booking.id} className="glass-panel rounded-2xl p-4 space-y-3" data-testid={`completed-booking-${booking.id}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                          {booking.photographer?.profileImageUrl ? (
                            <img 
                              src={booking.photographer.profileImageUrl} 
                              alt={booking.photographer.fullName} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-white">{booking.photographer?.fullName || 'Photo Session'}</h3>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(booking.scheduledDate), 'MMM d, yyyy')} - {booking.location}
                          </p>
                        </div>
                      </div>
                      <span className="text-white font-bold">£{parseFloat(booking.totalAmount).toFixed(2)}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleViewPhotos(booking.id)}
                        variant="outline"
                        className="flex-1 border-primary/50 text-primary hover:bg-primary/10"
                        data-testid={`button-view-photos-${booking.id}`}
                      >
                        <Images className="w-4 h-4 mr-2" />
                        View Photos
                      </Button>
                      
                      {reviewInfo?.canReview ? (
                        <Button
                          onClick={() => {
                            setReviewingBookingId(booking.id);
                            setReviewRating(5);
                            setReviewComment("");
                          }}
                          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                          data-testid={`button-leave-review-${booking.id}`}
                        >
                          <Star className="w-4 h-4 mr-2" />
                          Leave Review
                        </Button>
                      ) : reviewInfo?.review ? (
                        <div className="flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-lg bg-green-500/20 border border-green-500/30">
                          <Check className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 text-sm font-medium">Reviewed</span>
                          <div className="flex items-center ml-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i < reviewInfo.review!.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'}`}
                              />
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {cancelledBookings.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-400" />
              Cancelled
            </h2>
            <div className="space-y-4">
              {cancelledBookings.map((booking: any) => (
                <div key={booking.id} className="glass-panel rounded-2xl p-4 space-y-3 opacity-60" data-testid={`cancelled-booking-${booking.id}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center overflow-hidden">
                        {booking.photographer?.profileImageUrl ? (
                          <img 
                            src={booking.photographer.profileImageUrl} 
                            alt={booking.photographer.fullName} 
                            className="w-full h-full object-cover opacity-50"
                          />
                        ) : (
                          <User className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{booking.photographer?.fullName || 'Photo Session'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(booking.scheduledDate), 'MMM d, yyyy')} - {booking.location}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400">cancelled</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <BottomNav />

      {/* Photo Gallery Dialog */}
      <Dialog open={!!selectedBookingPhotos} onOpenChange={(open) => !open && setSelectedBookingPhotos(null)}>
        <DialogContent className="max-w-4xl w-[95vw] h-[85vh] p-0 bg-black/95 border-white/10 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between p-4 pr-12 border-b border-white/10 shrink-0">
            <div className="flex-1 min-w-0 pr-4">
              <h2 className="text-white font-bold">Your Photos</h2>
              {selectedBookingPhotos?.message && (
                <p className="text-sm text-muted-foreground line-clamp-2">{selectedBookingPhotos.message}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                onClick={handleDownloadAll}
                size="sm"
                className="bg-primary hover:bg-primary/90"
                data-testid="button-download-all"
              >
                <Download className="w-4 h-4 mr-2" />
                Download All
              </Button>
            </div>
          </div>

          {/* Main Photo View */}
          {selectedBookingPhotos && selectedBookingPhotos.photos.length > 0 && (
            <div className="flex-1 flex items-center justify-center relative p-4 overflow-hidden" style={{ minHeight: 0 }}>
              <img
                src={selectedBookingPhotos.photos[viewingPhotoIndex]}
                alt={`Photo ${viewingPhotoIndex + 1}`}
                className="object-contain rounded-lg"
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '100%',
                  width: 'auto',
                  height: 'auto'
                }}
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
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
                {viewingPhotoIndex + 1} / {selectedBookingPhotos.photos.length}
              </div>
            </div>
          )}

          {/* Thumbnails */}
          {selectedBookingPhotos && selectedBookingPhotos.photos.length > 1 && (
            <div className="p-4 border-t border-white/10 shrink-0">
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
        </DialogContent>
      </Dialog>

      {/* Review Modal */}
      <Dialog open={!!reviewingBookingId} onOpenChange={(open) => !open && setReviewingBookingId(null)}>
        <DialogContent className="sm:max-w-md bg-zinc-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" />
              Rate Your Experience
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Star Rating */}
            <div className="text-center">
              <p className="text-muted-foreground text-sm mb-3">How was your photo session?</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110"
                    data-testid={`star-rating-${star}`}
                  >
                    <Star
                      className={`w-10 h-10 transition-colors ${
                        star <= (hoveredRating || reviewRating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-zinc-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-amber-400 font-medium mt-2">
                {reviewRating === 1 && "Poor"}
                {reviewRating === 2 && "Fair"}
                {reviewRating === 3 && "Good"}
                {reviewRating === 4 && "Great"}
                {reviewRating === 5 && "Excellent"}
              </p>
            </div>
            
            {/* Comment */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                <MessageSquare className="w-4 h-4 inline mr-1" />
                Share your experience (optional)
              </label>
              <Textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Tell others about your experience with this photographer..."
                className="bg-zinc-800 border-white/10 text-white placeholder:text-zinc-500 resize-none"
                rows={4}
                data-testid="input-review-comment"
              />
            </div>
            
            {/* Submit Button */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setReviewingBookingId(null)}
                className="flex-1 border-white/10"
                data-testid="button-cancel-review"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (reviewingBookingId) {
                    submitReviewMutation.mutate({
                      bookingId: reviewingBookingId,
                      rating: reviewRating,
                      comment: reviewComment,
                    });
                  }
                }}
                disabled={submitReviewMutation.isPending}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                data-testid="button-submit-review"
              >
                {submitReviewMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4 mr-2" />
                    Submit Review
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
