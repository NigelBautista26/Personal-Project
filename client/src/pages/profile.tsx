import { BottomNav } from "@/components/bottom-nav";
import { Settings, Shield, CircleHelp, LogOut, ChevronRight, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, logout } from "@/lib/api";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

const Avatar = ({ src }: { src?: string }) => (
  <div className="w-24 h-24 rounded-full ring-4 ring-card bg-muted flex items-center justify-center overflow-hidden mb-4 relative z-10">
    {src ? (
      <img src={src} alt="Profile" className="w-full h-full object-cover" />
    ) : (
      <UserIcon className="w-12 h-12 text-muted-foreground" />
    )}
  </div>
);

export default function Profile() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
      setLocation("/");
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    },
  });

  const handleMenuClick = (label: string) => {
    if (label === "Log Out") {
      logoutMutation.mutate();
    }
  };

  const menuItems = [
    { icon: UserIcon, label: "Account Details" },
    { icon: Shield, label: "Security" },
    { icon: Settings, label: "Preferences" },
    { icon: CircleHelp, label: "Support" },
    { icon: LogOut, label: "Log Out", className: "text-destructive" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="relative h-48 bg-gradient-to-b from-primary/20 to-background">
        <div className="absolute -bottom-12 left-0 right-0 flex flex-col items-center">
           <Avatar src={undefined} /> 
           <h1 className="text-xl font-bold text-white" data-testid="text-username">{user?.fullName || "Guest"}</h1>
           <p className="text-sm text-muted-foreground" data-testid="text-email">{user?.email || ""}</p>
        </div>
      </div>

      <div className="mt-20 px-6 space-y-6">
        <div className="glass-panel rounded-2xl overflow-hidden">
          {menuItems.map((item, i) => (
            <button 
              key={item.label}
              onClick={() => handleMenuClick(item.label)}
              className={cn(
                "w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left",
                i !== menuItems.length - 1 && "border-b border-white/5"
              )}
              data-testid={`button-${item.label.toLowerCase().replace(' ', '-')}`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("w-5 h-5", item.className || "text-muted-foreground")} />
                <span className={cn("font-medium", item.className || "text-foreground")}>{item.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
            </button>
          ))}
        </div>

        <div className="glass-panel rounded-2xl p-4 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary/20 rounded-lg text-primary">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">SnapNow Member</h3>
              <p className="text-xs text-muted-foreground mb-3">Book photographers anywhere you travel.</p>
              <button className="text-xs font-bold text-primary hover:underline">Explore Features</button>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
