import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Shield, Users, Clock, CheckCircle, XCircle, Loader2, 
  Instagram, Globe, MapPin, DollarSign, ExternalLink,
  ChevronDown, ChevronUp, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/lib/api";

interface PhotographerApplication {
  id: string;
  userId: string;
  bio: string | null;
  hourlyRate: string;
  location: string;
  portfolioInstagramUrl: string | null;
  portfolioWebsiteUrl: string | null;
  verificationStatus: string;
  rejectionReason: string | null;
  reviewedAt: string | null;
  user: {
    fullName: string;
    email: string;
    profileImageUrl: string | null;
    createdAt: string;
  };
}

interface AdminStats {
  pendingCount: number;
  verifiedCount: number;
  rejectedCount: number;
  totalCount: number;
}

async function fetchPhotographers(status?: string): Promise<PhotographerApplication[]> {
  const url = status ? `/api/admin/photographers?status=${status}` : "/api/admin/photographers";
  const response = await fetch(url, { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch photographers");
  return response.json();
}

async function fetchAdminStats(): Promise<AdminStats> {
  const response = await fetch("/api/admin/stats", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch stats");
  return response.json();
}

async function approvePhotographer(id: string): Promise<void> {
  const response = await fetch(`/api/admin/photographers/${id}/approve`, {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to approve photographer");
}

async function rejectPhotographer(id: string, reason: string): Promise<void> {
  const response = await fetch(`/api/admin/photographers/${id}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ reason }),
  });
  if (!response.ok) throw new Error("Failed to reject photographer");
}

function PhotographerCard({ 
  photographer, 
  onApprove, 
  onReject,
  isApproving,
  isRejecting 
}: { 
  photographer: PhotographerApplication;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isApproving: boolean;
  isRejecting: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const appliedDate = new Date(photographer.user.createdAt).toLocaleDateString();
  const isPending = photographer.verificationStatus === "pending_review";

  return (
    <Card className="bg-card border-white/10" data-testid={`card-photographer-${photographer.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
              {photographer.user.profileImageUrl ? (
                <img 
                  src={photographer.user.profileImageUrl} 
                  alt={photographer.user.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Users className="w-6 h-6 text-primary" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-white" data-testid={`text-photographer-name-${photographer.id}`}>
                {photographer.user.fullName}
              </h3>
              <p className="text-sm text-muted-foreground">{photographer.user.email}</p>
            </div>
          </div>
          <Badge 
            variant={
              photographer.verificationStatus === "verified" ? "default" : 
              photographer.verificationStatus === "rejected" ? "destructive" : 
              "secondary"
            }
            data-testid={`badge-status-${photographer.id}`}
          >
            {photographer.verificationStatus === "pending_review" ? "Pending" : 
             photographer.verificationStatus === "verified" ? "Verified" : "Rejected"}
          </Badge>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{photographer.location}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="w-4 h-4" />
            <span>${photographer.hourlyRate}/hr</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Applied {appliedDate}</span>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          {photographer.portfolioInstagramUrl && (
            <a
              href={photographer.portfolioInstagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
              data-testid={`link-instagram-${photographer.id}`}
            >
              <Instagram className="w-4 h-4" />
              Instagram
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {photographer.portfolioWebsiteUrl && (
            <a
              href={photographer.portfolioWebsiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
              data-testid={`link-website-${photographer.id}`}
            >
              <Globe className="w-4 h-4" />
              Website
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {photographer.bio && (
          <button 
            onClick={() => setExpanded(!expanded)}
            className="mt-3 flex items-center gap-1 text-sm text-muted-foreground hover:text-white"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {expanded ? "Hide bio" : "Show bio"}
          </button>
        )}

        {expanded && photographer.bio && (
          <p className="mt-2 text-sm text-muted-foreground bg-white/5 rounded-lg p-3">
            {photographer.bio}
          </p>
        )}

        {photographer.verificationStatus === "rejected" && photographer.rejectionReason && (
          <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-sm text-red-400">
              <strong>Rejection reason:</strong> {photographer.rejectionReason}
            </p>
          </div>
        )}

        {isPending && (
          <div className="mt-4 flex gap-2">
            <Button
              onClick={() => onApprove(photographer.id)}
              disabled={isApproving || isRejecting}
              className="flex-1 bg-green-600 hover:bg-green-700"
              data-testid={`button-approve-${photographer.id}`}
            >
              {isApproving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </>
              )}
            </Button>
            <Button
              onClick={() => onReject(photographer.id)}
              disabled={isApproving || isRejecting}
              variant="destructive"
              className="flex-1"
              data-testid={`button-reject-${photographer.id}`}
            >
              {isRejecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("pending");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedPhotographer, setSelectedPhotographer] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  const { data: stats } = useQuery({
    queryKey: ["adminStats"],
    queryFn: fetchAdminStats,
    enabled: user?.role === "admin",
  });

  const { data: photographers, isLoading: photographersLoading } = useQuery({
    queryKey: ["adminPhotographers", activeTab === "all" ? undefined : activeTab === "pending" ? "pending_review" : activeTab],
    queryFn: () => fetchPhotographers(activeTab === "all" ? undefined : activeTab === "pending" ? "pending_review" : activeTab),
    enabled: user?.role === "admin",
  });

  const approveMutation = useMutation({
    mutationFn: approvePhotographer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPhotographers"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      toast({
        title: "Photographer approved",
        description: "The photographer can now accept bookings.",
      });
      setProcessingId(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve photographer.",
        variant: "destructive",
      });
      setProcessingId(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectPhotographer(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPhotographers"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      toast({
        title: "Photographer rejected",
        description: "The photographer has been notified.",
      });
      setRejectDialogOpen(false);
      setRejectionReason("");
      setSelectedPhotographer(null);
      setProcessingId(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject photographer.",
        variant: "destructive",
      });
      setProcessingId(null);
    },
  });

  const handleApprove = (id: string) => {
    setProcessingId(id);
    approveMutation.mutate(id);
  };

  const handleRejectClick = (id: string) => {
    setSelectedPhotographer(id);
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = () => {
    if (selectedPhotographer) {
      setProcessingId(selectedPhotographer);
      rejectMutation.mutate({ id: selectedPhotographer, reason: rejectionReason });
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white" data-testid="text-admin-title">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage photographer verifications</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-muted-foreground">Pending</span>
              </div>
              <p className="text-2xl font-bold text-white mt-1" data-testid="text-pending-count">
                {stats?.pendingCount ?? 0}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-muted-foreground">Verified</span>
              </div>
              <p className="text-2xl font-bold text-white mt-1" data-testid="text-verified-count">
                {stats?.verifiedCount ?? 0}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm text-muted-foreground">Rejected</span>
              </div>
              <p className="text-2xl font-bold text-white mt-1" data-testid="text-rejected-count">
                {stats?.rejectedCount ?? 0}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Total</span>
              </div>
              <p className="text-2xl font-bold text-white mt-1" data-testid="text-total-count">
                {stats?.totalCount ?? 0}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-card border border-white/10 mb-6">
            <TabsTrigger value="pending" className="flex-1" data-testid="tab-pending">
              Pending {stats?.pendingCount ? `(${stats.pendingCount})` : ""}
            </TabsTrigger>
            <TabsTrigger value="verified" className="flex-1" data-testid="tab-verified">
              Verified
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex-1" data-testid="tab-rejected">
              Rejected
            </TabsTrigger>
            <TabsTrigger value="all" className="flex-1" data-testid="tab-all">
              All
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {photographersLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : photographers?.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No photographers found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {photographers?.map((photographer) => (
                  <PhotographerCard
                    key={photographer.id}
                    photographer={photographer}
                    onApprove={handleApprove}
                    onReject={handleRejectClick}
                    isApproving={processingId === photographer.id && approveMutation.isPending}
                    isRejecting={processingId === photographer.id && rejectMutation.isPending}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="bg-card border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Reject Application
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-white">Rejection Reason</Label>
              <Textarea
                id="reason"
                placeholder="Please provide a reason for rejection (optional but recommended)..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="bg-black/50 border-white/10 text-white min-h-[100px]"
                data-testid="input-rejection-reason"
              />
              <p className="text-xs text-muted-foreground">
                This message will be shown to the photographer.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              className="border-white/20"
              data-testid="button-cancel-reject"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={rejectMutation.isPending}
              data-testid="button-confirm-reject"
            >
              {rejectMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Reject Application"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
