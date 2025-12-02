import { BottomNav } from "@/components/bottom-nav";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/api";
import { Calendar, MapPin, Clock, User, Loader2, Check, X, Upload, Images, Plus, Trash2, AlertTriangle, Palette, DollarSign, ChevronRight, ChevronDown, MessageSquare } from "lucide-react";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface PhotoDelivery {
  id: string;
  bookingId: string;
  photos: string[];
  message?: string;
  deliveredAt: string;
}

interface EditingRequest {
  id: string;
  bookingId: string;
  customerId: string;
  photographerId: string;
  status: string;
  totalAmount: string;
  platformFee: string;
  photographerEarnings: string;
  photoCount: number | null;
  customerNotes: string | null;
  photographerNotes: string | null;
  requestedPhotoUrls: string[] | null;
  editedPhotos: string[] | null;
  revisionNotes: string | null;
  revisionCount: number | null;
  createdAt: string;
  booking?: {
    scheduledDate: string;
    location: string;
    customer?: {
      fullName: string;
      profileImageUrl: string | null;
    };
  };
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
  const [editingDialogRequest, setEditingDialogRequest] = useState<EditingRequest | null>(null);
  const [editingAction, setEditingAction] = useState<"accept" | "decline" | "deliver" | null>(null);
  const [editedPhotos, setEditedPhotos] = useState<string[]>([]);
  const [photographerNotes, setPhotographerNotes] = useState("");
  const [isUploadingEdited, setIsUploadingEdited] = useState(false);
  const editedFileInputRef = useRef<HTMLInputElement>(null);
  
  // Collapsible section states - only truly completed items are collapsed
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    completedSessions: true,
    approvedEdits: true,
  });
  
  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

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

  const { data: editingRequests = [], isLoading: editingRequestsLoading } = useQuery({
    queryKey: ["photographerEditingRequests", photographer?.id],
    queryFn: async () => {
      const res = await fetch(`/api/editing-requests/photographer/${photographer?.id}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch editing requests");
      return res.json();
    },
    enabled: !!photographer?.id,
  });

  useEffect(() => {
    if (!userLoading && (!user || user.role !== 'photographer')) {
      setLocation("/login");
    }
  }, [user, userLoading, setLocation]);

  // Ref to track notified IDs during this session (prevents race condition with localStorage)
  const notifiedIdsRef = useRef<Set<string>>(new Set());

  const expiredBookingIds = bookings
    .filter((b: any) => b.status === 'expired')
    .map((b: any) => b.id)
    .sort()
    .join(',');

  useEffect(() => {
    if (!expiredBookingIds) return;
    
    const STORAGE_KEY = 'snapnow_photographer_expired_notified';
    let notifiedIds: string[] = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      notifiedIds = stored ? JSON.parse(stored) : [];
    } catch (e) {
      notifiedIds = [];
    }
    
    // Find bookings we haven't notified about yet (check both localStorage AND ref)
    const expiredIds = expiredBookingIds.split(',');
    const newExpiredIds = expiredIds.filter((id: string) => 
      !notifiedIds.includes(id) && !notifiedIdsRef.current.has(id)
    );
    
    if (newExpiredIds.length === 0) return;
    
    // Mark these as notified IMMEDIATELY in ref to prevent race conditions
    newExpiredIds.forEach((id: string) => notifiedIdsRef.current.add(id));
    
    // Also persist to localStorage
    const updatedNotifiedIds = [...notifiedIds, ...newExpiredIds];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotifiedIds));
    } catch (e) {}
    
    toast({
      title: "Booking Request Expired",
      description: `${newExpiredIds.length} booking request(s) expired because they weren't responded to in time.`,
      variant: "destructive",
    });
  }, [expiredBookingIds, toast]);

  const updateEditingStatusMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: string }) => {
      const res = await fetch(`/api/editing-requests/${requestId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update editing status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photographerEditingRequests"] });
      toast({
        title: "Status Updated",
        description: "Editing request status has been updated.",
      });
      setEditingDialogRequest(null);
      setEditingAction(null);
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Could not update editing request status.",
        variant: "destructive",
      });
    },
  });

  const deliverEditedPhotosMutation = useMutation({
    mutationFn: async ({ requestId, editedPhotos, photographerNotes }: { 
      requestId: string; 
      editedPhotos: string[]; 
      photographerNotes?: string 
    }) => {
      const res = await fetch(`/api/editing-requests/${requestId}/deliver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ editedPhotos, photographerNotes }),
      });
      if (!res.ok) throw new Error("Failed to deliver edited photos");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photographerEditingRequests"] });
      toast({
        title: "Photos Delivered",
        description: "Your edited photos have been sent to the customer.",
      });
      setEditingDialogRequest(null);
      setEditingAction(null);
      setEditedPhotos([]);
      setPhotographerNotes("");
    },
    onError: () => {
      toast({
        title: "Delivery Failed",
        description: "Could not deliver edited photos.",
        variant: "destructive",
      });
    },
  });

  const handleEditedFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploadingEdited(true);
    
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
        
        const aclRes = await fetch("/api/objects/set-acl", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ objectPath }),
        });
        
        if (!aclRes.ok) throw new Error("Failed to set file access");
        
        setEditedPhotos(prev => [...prev, objectPath]);
      }
      toast({
        title: "Photos Uploaded",
        description: `Uploaded ${files.length} edited photo(s).`,
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Could not upload photos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingEdited(false);
    }
  };

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
      
      // Refresh bookings list to show updated status
      queryClient.invalidateQueries({ queryKey: ["photographerBookings"] });
      
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
    return null;
  }

  // Helper to calculate session end time
  const getSessionEndTime = (booking: any) => {
    const sessionDate = new Date(booking.scheduledDate);
    const timeParts = booking.scheduledTime.replace(/[AP]M/i, '').trim().split(':');
    const hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]) || 0;
    const isPM = booking.scheduledTime.toLowerCase().includes('pm');
    sessionDate.setHours(isPM && hours !== 12 ? hours + 12 : hours === 12 && !isPM ? 0 : hours, minutes);
    sessionDate.setHours(sessionDate.getHours() + (booking.duration || 1));
    return sessionDate;
  };

  // Memoized status-based booking lists (don't depend on time)
  const { pendingBookings, completedBookings, cancelledBookings } = useMemo(() => ({
    pendingBookings: bookings.filter((b: any) => b.status === 'pending'),
    completedBookings: bookings.filter((b: any) => b.status === 'completed'),
    cancelledBookings: bookings.filter((b: any) => b.status === 'cancelled'),
  }), [bookings]);

  // Time-dependent filters - not memoized to ensure they update
  const now = new Date();
  const confirmedBookings = bookings.filter((b: any) => {
    if (b.status !== 'confirmed') return false;
    const sessionEnd = getSessionEndTime(b);
    return sessionEnd >= now;
  });
  const awaitingUploadBookings = bookings.filter((b: any) => {
    if (b.status !== 'confirmed') return false;
    const sessionEnd = getSessionEndTime(b);
    return sessionEnd < now;
  });

  // Memoized editing request lists
  const { pendingEditingRequests, activeEditingRequests, revisionRequests, awaitingApprovalRequests, approvedEditingRequests } = useMemo(() => ({
    pendingEditingRequests: editingRequests.filter((r: EditingRequest) => r.status === 'requested'),
    activeEditingRequests: editingRequests.filter((r: EditingRequest) => 
      r.status === 'accepted' || r.status === 'in_progress'
    ),
    revisionRequests: editingRequests.filter((r: EditingRequest) => r.status === 'revision_requested'),
    awaitingApprovalRequests: editingRequests.filter((r: EditingRequest) => r.status === 'delivered'),
    approvedEditingRequests: editingRequests.filter((r: EditingRequest) => r.status === 'completed'),
  }), [editingRequests]);

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
        {/* Upcoming Sessions - First priority */}
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
                <button
                  key={booking.id}
                  onClick={() => setLocation(`/photographer/booking/${booking.id}`)}
                  className="glass-panel rounded-2xl p-4 space-y-3 w-full text-left hover:bg-white/5 transition-colors"
                  data-testid={`booking-confirmed-${booking.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                        {booking.customer?.profileImageUrl ? (
                          <img 
                            src={booking.customer.profileImageUrl} 
                            alt={booking.customer.fullName} 
                            loading="lazy"
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
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
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
                </button>
              ))}
            </div>
          )}
        </section>

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
                            loading="lazy"
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

        {/* Pending Editing Requests */}
        {pendingEditingRequests.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-violet-400" />
              Editing Requests ({pendingEditingRequests.length})
            </h2>
            
            <div className="space-y-4">
              {pendingEditingRequests.map((request: EditingRequest) => (
                <div key={request.id} className="glass-panel rounded-2xl p-4 space-y-3 border border-violet-500/30" data-testid={`editing-pending-${request.id}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center overflow-hidden">
                        {request.booking?.customer?.profileImageUrl ? (
                          <img 
                            src={request.booking.customer.profileImageUrl} 
                            alt={request.booking.customer.fullName} 
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-violet-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{request.booking?.customer?.fullName || 'Editing Request'}</h3>
                        {request.photoCount && <p className="text-sm text-muted-foreground">{request.photoCount} photos</p>}
                      </div>
                    </div>
                    <span className="text-lg font-bold text-violet-400">£{parseFloat(request.photographerEarnings).toFixed(2)}</span>
                  </div>
                  
                  {request.booking?.scheduledDate && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Session: {format(new Date(request.booking.scheduledDate), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                  
                  {request.customerNotes && (
                    <div className="bg-violet-500/10 rounded-lg p-3">
                      <p className="text-sm text-muted-foreground">Customer notes:</p>
                      <p className="text-sm text-white">{request.customerNotes}</p>
                    </div>
                  )}
                  
                  {request.requestedPhotoUrls && request.requestedPhotoUrls.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Images className="w-4 h-4" />
                        Photos to edit ({request.requestedPhotoUrls.length})
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {request.requestedPhotoUrls.slice(0, 8).map((url, idx) => (
                          <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-black/40">
                            <img 
                              src={url} 
                              alt={`Photo ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {request.requestedPhotoUrls.length > 8 && (
                          <div className="aspect-square rounded-lg bg-violet-500/20 flex items-center justify-center">
                            <span className="text-violet-400 text-sm font-medium">+{request.requestedPhotoUrls.length - 8}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => updateEditingStatusMutation.mutate({ requestId: request.id, status: 'accepted' })}
                      disabled={updateEditingStatusMutation.isPending}
                      className="flex-1 bg-violet-600 hover:bg-violet-700"
                      data-testid={`button-accept-editing-${request.id}`}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Accept
                    </Button>
                    <Button
                      onClick={() => updateEditingStatusMutation.mutate({ requestId: request.id, status: 'declined' })}
                      disabled={updateEditingStatusMutation.isPending}
                      variant="outline"
                      className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
                      data-testid={`button-decline-editing-${request.id}`}
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

        {/* Active Editing Work */}
        {activeEditingRequests.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-blue-400" />
              Editing In Progress ({activeEditingRequests.length})
            </h2>
            
            <div className="space-y-4">
              {activeEditingRequests.map((request: EditingRequest) => (
                <div key={request.id} className="glass-panel rounded-2xl p-4 space-y-3 border border-blue-500/30" data-testid={`editing-active-${request.id}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center overflow-hidden">
                        {request.booking?.customer?.profileImageUrl ? (
                          <img 
                            src={request.booking.customer.profileImageUrl} 
                            alt={request.booking.customer.fullName} 
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-blue-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{request.booking?.customer?.fullName || 'Editing Work'}</h3>
                        {request.photoCount && <p className="text-sm text-muted-foreground">{request.photoCount} photos</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                        {request.status === 'accepted' ? 'accepted' : 'in progress'}
                      </span>
                      <p className="text-lg font-bold text-blue-400 mt-1">£{parseFloat(request.photographerEarnings).toFixed(2)}</p>
                    </div>
                  </div>
                  
                  {request.customerNotes && (
                    <div className="bg-blue-500/10 rounded-lg p-3">
                      <p className="text-sm text-muted-foreground">Customer notes:</p>
                      <p className="text-sm text-white">{request.customerNotes}</p>
                    </div>
                  )}
                  
                  {request.requestedPhotoUrls && request.requestedPhotoUrls.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Images className="w-4 h-4" />
                        Photos to edit ({request.requestedPhotoUrls.length})
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {request.requestedPhotoUrls.slice(0, 8).map((url, idx) => (
                          <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-black/40">
                            <img 
                              src={url} 
                              alt={`Photo ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {request.requestedPhotoUrls.length > 8 && (
                          <div className="aspect-square rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <span className="text-blue-400 text-sm font-medium">+{request.requestedPhotoUrls.length - 8}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <Button
                    onClick={() => {
                      setEditingDialogRequest(request);
                      setEditingAction("deliver");
                      setEditedPhotos([]);
                      setPhotographerNotes("");
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    data-testid={`button-deliver-editing-${request.id}`}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Deliver Edited Photos
                  </Button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Revision Requests */}
        {revisionRequests.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              Revisions Requested ({revisionRequests.length})
            </h2>
            <p className="text-sm text-muted-foreground mb-4">Customers have requested changes to these edits.</p>
            
            <div className="space-y-4">
              {revisionRequests.map((request: EditingRequest) => (
                <div key={request.id} className="glass-panel rounded-2xl p-4 space-y-3 border border-orange-500/30" data-testid={`editing-revision-${request.id}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center overflow-hidden">
                        {request.booking?.customer?.profileImageUrl ? (
                          <img 
                            src={request.booking.customer.profileImageUrl} 
                            alt={request.booking.customer.fullName} 
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-orange-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{request.booking?.customer?.fullName || 'Customer'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {request.photoCount} photo{request.photoCount && request.photoCount > 1 ? 's' : ''} • Revision #{(request.revisionCount || 0) + 1}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full font-medium bg-orange-500/20 text-orange-400">
                      Changes Requested
                    </span>
                  </div>
                  
                  {/* Customer's Revision Notes */}
                  {request.revisionNotes && (
                    <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                      <p className="text-xs text-orange-400 font-medium mb-1 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        Customer's Feedback
                      </p>
                      <p className="text-sm text-white">{request.revisionNotes}</p>
                    </div>
                  )}
                  
                  {/* Previously Delivered Photos */}
                  {request.editedPhotos && request.editedPhotos.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Your previous delivery:</p>
                      <div className="flex gap-1 overflow-x-auto pb-2">
                        {request.editedPhotos.slice(0, 4).map((url, idx) => (
                          <div key={idx} className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 opacity-60">
                            <img src={url} alt={`Previous edit ${idx + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {request.editedPhotos.length > 4 && (
                          <div className="w-12 h-12 rounded-lg bg-black/40 flex items-center justify-center flex-shrink-0 opacity-60">
                            <span className="text-xs text-muted-foreground">+{request.editedPhotos.length - 4}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <Button
                    onClick={() => {
                      setEditingDialogRequest(request);
                      setEditingAction("deliver");
                      setEditedPhotos([]);
                      setPhotographerNotes("");
                    }}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    data-testid={`button-resubmit-editing-${request.id}`}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Revised Photos
                  </Button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Ready for Photos - Action item (expanded) */}
        {awaitingUploadBookings.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-400" />
              Ready for Photos ({awaitingUploadBookings.length})
            </h2>
            <p className="text-sm text-muted-foreground mb-4">These sessions are complete. Upload photos to finalize and get paid.</p>
            <div className="space-y-4">
              {awaitingUploadBookings.map((booking: any) => (
                <div key={booking.id} className="glass-panel rounded-2xl p-4 space-y-4 border border-blue-500/30" data-testid={`booking-upload-${booking.id}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {booking.customer?.profileImageUrl ? (
                        <img 
                          src={booking.customer.profileImageUrl} 
                          alt={booking.customer.fullName} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-blue-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white">{booking.customer?.fullName || 'Customer'}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {format(new Date(booking.scheduledDate), 'MMM d, yyyy')}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {booking.location}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-bold text-blue-400">£{parseFloat(booking.photographerEarnings).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">earnings</p>
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

        {/* Awaiting Customer Approval - EXPANDED (active task) */}
        {awaitingApprovalRequests.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              Awaiting Customer Approval ({awaitingApprovalRequests.length})
            </h2>
            <p className="text-sm text-muted-foreground mb-4">These edits have been delivered and are waiting for customer approval.</p>
            
            <div className="space-y-4">
              {awaitingApprovalRequests.map((request: EditingRequest) => (
                <div key={request.id} className="glass-panel rounded-2xl p-4 space-y-3 border border-yellow-500/30" data-testid={`editing-awaiting-${request.id}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center overflow-hidden">
                        {request.booking?.customer?.profileImageUrl ? (
                          <img 
                            src={request.booking.customer.profileImageUrl} 
                            alt={request.booking.customer.fullName} 
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-yellow-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{request.booking?.customer?.fullName || 'Customer'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {request.photoCount} photo{request.photoCount && request.photoCount > 1 ? 's' : ''} edited
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400">
                        Awaiting Approval
                      </span>
                      <p className="text-sm text-muted-foreground mt-1">Payment on approval</p>
                    </div>
                  </div>
                  
                  {/* Edited Photos Preview */}
                  {request.editedPhotos && request.editedPhotos.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Your delivered edits:</p>
                      <div className="grid grid-cols-4 gap-2">
                        {request.editedPhotos.slice(0, 8).map((url, idx) => (
                          <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-black/40">
                            <img 
                              src={url} 
                              alt={`Edited ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {request.editedPhotos.length > 8 && (
                          <div className="aspect-square rounded-lg bg-yellow-500/20 flex items-center justify-center">
                            <span className="text-yellow-400 text-sm font-medium">+{request.editedPhotos.length - 8}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Approved Edits - COLLAPSED (completed) */}
        {approvedEditingRequests.length > 0 && (
          <section>
            <button
              onClick={() => toggleSection('approvedEdits')}
              className="w-full text-lg font-bold text-white mb-4 flex items-center gap-2 hover:opacity-80 transition-opacity"
              data-testid="toggle-approved-edits"
            >
              <Check className="w-5 h-5 text-green-400" />
              Approved Edits ({approvedEditingRequests.length})
              <ChevronDown className={`w-5 h-5 ml-auto transition-transform ${collapsedSections.approvedEdits ? '-rotate-90' : ''}`} />
            </button>
            {!collapsedSections.approvedEdits && (
            <div className="space-y-4">
              {approvedEditingRequests.map((request: EditingRequest) => (
                <div key={request.id} className="glass-panel rounded-2xl p-4 space-y-3 border border-green-500/30" data-testid={`editing-approved-${request.id}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center overflow-hidden">
                        {request.booking?.customer?.profileImageUrl ? (
                          <img 
                            src={request.booking.customer.profileImageUrl} 
                            alt={request.booking.customer.fullName} 
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-green-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{request.booking?.customer?.fullName || 'Customer'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {request.photoCount} photo{request.photoCount && request.photoCount > 1 ? 's' : ''} edited
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                        Approved
                      </span>
                      <p className="text-lg font-bold text-green-400 mt-1">+£{parseFloat(request.photographerEarnings).toFixed(2)}</p>
                    </div>
                  </div>
                  
                  {/* Edited Photos Preview */}
                  {request.editedPhotos && request.editedPhotos.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Your delivered edits:</p>
                      <div className="grid grid-cols-4 gap-2">
                        {request.editedPhotos.slice(0, 8).map((url, idx) => (
                          <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-black/40">
                            <img 
                              src={url} 
                              alt={`Edited ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {request.editedPhotos.length > 8 && (
                          <div className="aspect-square rounded-lg bg-green-500/20 flex items-center justify-center">
                            <span className="text-green-400 text-sm font-medium">+{request.editedPhotos.length - 8}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>)}
          </section>
        )}

        {completedBookings.length > 0 && (
          <section>
            <button
              onClick={() => toggleSection('completedSessions')}
              className="w-full text-lg font-bold text-white mb-4 flex items-center gap-2 hover:opacity-80 transition-opacity"
              data-testid="toggle-completed-sessions"
            >
              <Check className="w-5 h-5 text-green-400" />
              Completed Sessions ({completedBookings.length})
              <ChevronDown className={`w-5 h-5 ml-auto transition-transform ${collapsedSections.completedSessions ? '-rotate-90' : ''}`} />
            </button>
            {!collapsedSections.completedSessions && (
            <div className="space-y-4">
              {completedBookings.slice(0, 5).map((booking: any) => (
                <div key={booking.id} className="glass-panel rounded-2xl p-4 space-y-4" data-testid={`booking-completed-${booking.id}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {booking.customer?.profileImageUrl ? (
                        <img 
                          src={booking.customer.profileImageUrl} 
                          alt={booking.customer.fullName} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-green-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white">{booking.customer?.fullName || 'Customer'}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {format(new Date(booking.scheduledDate), 'MMM d, yyyy')}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {booking.location}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-bold text-green-400">£{parseFloat(booking.photographerEarnings).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">earned</p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleOpenUploadDialog(booking.id)}
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10"
                    data-testid={`button-upload-photos-${booking.id}`}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Manage Photos
                  </Button>
                </div>
              ))}
            </div>)}
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
        <DialogContent className="bg-background border-white/10">
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
                    <img src={photo} alt={`Upload ${idx + 1}`} loading="lazy" className="w-full h-full object-cover" />
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

      {/* Edited Photos Delivery Dialog */}
      <Dialog open={!!editingDialogRequest && editingAction === "deliver"} onOpenChange={(open) => {
        if (!open) {
          setEditingDialogRequest(null);
          setEditingAction(null);
        }
      }}>
        <DialogContent className="bg-background border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Palette className="w-5 h-5 text-violet-400" />
              Deliver Edited Photos
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Upload the edited photos for {editingDialogRequest?.booking?.customer?.fullName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Reference: Photos Requested for Editing */}
            {editingDialogRequest?.requestedPhotoUrls && editingDialogRequest.requestedPhotoUrls.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground flex items-center gap-2">
                  <Images className="w-4 h-4" />
                  Photos to edit ({editingDialogRequest.requestedPhotoUrls.length})
                </label>
                <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                  {editingDialogRequest.requestedPhotoUrls.map((url, idx) => (
                    <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-black/40 border border-violet-500/30">
                      <img 
                        src={url} 
                        alt={`Reference ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Edited Photo Grid */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Edited Photos ({editedPhotos.length})
              </label>
              <div className="grid grid-cols-3 gap-2">
                {editedPhotos.map((photo, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
                    <img src={photo} alt={`Edited ${idx + 1}`} loading="lazy" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setEditedPhotos(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                {/* Add Edited Photo Button */}
                <button
                  onClick={() => editedFileInputRef.current?.click()}
                  disabled={isUploadingEdited}
                  className="aspect-square rounded-lg border-2 border-dashed border-violet-500/30 flex flex-col items-center justify-center text-violet-400 hover:border-violet-500/50 hover:bg-violet-500/5 transition-colors"
                  data-testid="button-add-edited-photo"
                >
                  {isUploadingEdited ? (
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
                ref={editedFileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleEditedFileSelect}
                className="hidden"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Notes for Customer (optional)</label>
              <Textarea
                value={photographerNotes}
                onChange={(e) => setPhotographerNotes(e.target.value)}
                placeholder="Describe what edits you made..."
                className="bg-card border-white/10"
                data-testid="input-editing-notes"
              />
            </div>

            {/* Earnings Info */}
            {editingDialogRequest && (
              <div className="bg-violet-500/10 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">You'll earn</span>
                  <span className="text-lg font-bold text-violet-400">
                    £{parseFloat(editingDialogRequest.photographerEarnings).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingDialogRequest(null);
                  setEditingAction(null);
                }}
                className="flex-1 border-white/20"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (editingDialogRequest) {
                    deliverEditedPhotosMutation.mutate({
                      requestId: editingDialogRequest.id,
                      editedPhotos,
                      photographerNotes: photographerNotes || undefined,
                    });
                  }
                }}
                disabled={editedPhotos.length === 0 || deliverEditedPhotosMutation.isPending}
                className="flex-1 bg-violet-600 hover:bg-violet-700"
                data-testid="button-submit-edited-photos"
              >
                {deliverEditedPhotosMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Deliver Edited Photos
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
