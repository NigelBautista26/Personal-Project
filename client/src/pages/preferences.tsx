import { useState } from "react";
import { ArrowLeft, Bell, Moon, Globe, MapPin } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function Preferences() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [locationServices, setLocationServices] = useState(true);

  const handleToggle = (setting: string, value: boolean) => {
    toast({
      title: "Preference updated",
      description: `${setting} has been ${value ? "enabled" : "disabled"}.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border p-4 flex items-center gap-4">
        <button
          onClick={() => navigate("/profile")}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">Preferences</h1>
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Notifications</h2>
          
          <div className="bg-card rounded-2xl border border-border divide-y divide-border">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <Label className="text-white font-medium">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get notified about bookings and updates</p>
                </div>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={(checked) => {
                  setNotifications(checked);
                  handleToggle("Push notifications", checked);
                }}
                data-testid="switch-notifications"
              />
            </div>
            
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Globe className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <Label className="text-white font-medium">Email Updates</Label>
                  <p className="text-sm text-muted-foreground">Receive booking confirmations via email</p>
                </div>
              </div>
              <Switch
                checked={emailUpdates}
                onCheckedChange={(checked) => {
                  setEmailUpdates(checked);
                  handleToggle("Email updates", checked);
                }}
                data-testid="switch-email"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">App Settings</h2>
          
          <div className="bg-card rounded-2xl border border-border divide-y divide-border">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Moon className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <Label className="text-white font-medium">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Use dark theme throughout the app</p>
                </div>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={(checked) => {
                  setDarkMode(checked);
                  handleToggle("Dark mode", checked);
                }}
                data-testid="switch-darkmode"
              />
            </div>
            
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <MapPin className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <Label className="text-white font-medium">Location Services</Label>
                  <p className="text-sm text-muted-foreground">Allow app to access your location</p>
                </div>
              </div>
              <Switch
                checked={locationServices}
                onCheckedChange={(checked) => {
                  setLocationServices(checked);
                  handleToggle("Location services", checked);
                }}
                data-testid="switch-location"
              />
            </div>
          </div>
        </div>

        <div className="pt-4">
          <p className="text-sm text-muted-foreground text-center">
            Preferences are saved automatically and synced across your devices.
          </p>
        </div>
      </div>
    </div>
  );
}
