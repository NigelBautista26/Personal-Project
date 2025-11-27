import { BottomNav } from "@/components/bottom-nav";
import { Settings, Shield, CircleHelp, LogOut, ChevronRight, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import avatarImage from "@assets/generated_images/a_futuristic_cyberpunk_avatar_of_a_person_with_glowing_neon_accents.png";

const Avatar = ({ src }: { src?: string }) => (
  <div className="w-24 h-24 rounded-full ring-4 ring-card bg-muted flex items-center justify-center overflow-hidden mb-4 relative z-10">
    <img src={src || avatarImage} alt="Profile" className="w-full h-full object-cover" />
  </div>
);

export default function Profile() {
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
           {/* The image path will be updated after generation, for now using a placeholder logic in case */}
           <Avatar src={undefined} /> 
           <h1 className="text-xl font-bold text-white">Alex Chen</h1>
           <p className="text-sm text-muted-foreground">@alx_crypto</p>
        </div>
      </div>

      <div className="mt-20 px-6 space-y-6">
        <div className="glass-panel rounded-2xl overflow-hidden">
          {menuItems.map((item, i) => (
            <button 
              key={item.label}
              className={cn(
                "w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left",
                i !== menuItems.length - 1 && "border-b border-white/5"
              )}
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
              <h3 className="font-bold text-white mb-1">Pro Member</h3>
              <p className="text-xs text-muted-foreground mb-3">Your account is protected with advanced security features.</p>
              <button className="text-xs font-bold text-primary hover:underline">View Benefits</button>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}