import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Clock, Camera, Instagram, Globe, CheckCircle, XCircle, Loader2, LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/api";
import PhotoCube from "@/components/photo-cube";

interface PhotographerProfile {
  id: string;
  verificationStatus: string;
  rejectionReason: string | null;
  portfolioInstagramUrl: string | null;
  portfolioWebsiteUrl: string | null;
  location: string;
  hourlyRate: string;
  bio: string | null;
}

async function getPhotographerProfile(): Promise<PhotographerProfile | null> {
  const response = await fetch("/api/photographers/me", { credentials: "include" });
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error("Failed to fetch profile");
  }
  return response.json();
}

export default function PhotographerPending() {
  const [, setLocation] = useLocation();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  const { data: profile, isLoading: profileLoading, refetch } = useQuery({
    queryKey: ["photographerProfile"],
    queryFn: getPhotographerProfile,
    enabled: !!user,
    refetchInterval: 30000,
  });

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setLocation("/");
  };

  if (userLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== "photographer") {
    setLocation("/");
    return null;
  }

  if (profile?.verificationStatus === "verified") {
    setLocation("/photographer-home");
    return null;
  }

  const isRejected = profile?.verificationStatus === "rejected";
  const isPending = profile?.verificationStatus === "pending_review";

  return (
    <div className="min-h-screen bg-black flex flex-col p-6 relative overflow-hidden">
      <PhotoCube />

      <div className="relative z-10 flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="glass-dark rounded-3xl p-8 border border-white/10 backdrop-blur-xl">
          {isPending ? (
            <>
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-10 h-10 text-yellow-500" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Application Under Review</h1>
                <p className="text-muted-foreground">
                  Thank you for applying! Our team is reviewing your portfolio to ensure quality standards.
                </p>
              </div>

              <div className="bg-white/5 rounded-xl p-4 mb-6">
                <h3 className="text-sm font-medium text-white mb-3">What happens next?</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    We'll review your Instagram portfolio and website
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Verification typically takes 1-2 business days
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Once approved, you can start accepting bookings
                  </li>
                </ul>
              </div>

              {profile?.portfolioInstagramUrl && (
                <div className="space-y-2 mb-6">
                  <h3 className="text-sm font-medium text-white">Submitted Portfolio</h3>
                  <div className="space-y-2">
                    <a 
                      href={profile.portfolioInstagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                      data-testid="link-instagram-portfolio"
                    >
                      <Instagram className="w-4 h-4" />
                      {profile.portfolioInstagramUrl}
                    </a>
                    {profile.portfolioWebsiteUrl && (
                      <a 
                        href={profile.portfolioWebsiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                        data-testid="link-website-portfolio"
                      >
                        <Globe className="w-4 h-4" />
                        {profile.portfolioWebsiteUrl}
                      </a>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : isRejected ? (
            <>
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-10 h-10 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Application Not Approved</h1>
                <p className="text-muted-foreground">
                  Unfortunately, your application wasn't approved at this time.
                </p>
              </div>

              {profile?.rejectionReason && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                  <h3 className="text-sm font-medium text-red-400 mb-2">Reason</h3>
                  <p className="text-sm text-muted-foreground">{profile.rejectionReason}</p>
                </div>
              )}

              <div className="bg-white/5 rounded-xl p-4 mb-6">
                <h3 className="text-sm font-medium text-white mb-2">What you can do</h3>
                <p className="text-sm text-muted-foreground">
                  You can update your portfolio and reapply. Make sure your Instagram showcases your best photography work with high-quality images.
                </p>
              </div>
            </>
          ) : null}

          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={() => refetch()}
              className="flex-1 h-12 rounded-xl border-white/20 text-white hover:bg-white/10"
              data-testid="button-refresh-status"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Status
            </Button>
            <Button 
              variant="outline"
              onClick={handleLogout}
              className="flex-1 h-12 rounded-xl border-white/20 text-white hover:bg-white/10"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
