import { Home, Calendar, User, Search, Camera, DollarSign, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/api";

export function BottomNav() {
  const [location] = useLocation();
  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  // Different navigation for photographers vs customers
  const customerItems = [
    { icon: Home, label: "Explore", href: "/home" },
    { icon: Search, label: "Search", href: "/search" },
    { icon: Calendar, label: "Bookings", href: "/bookings" },
    { icon: User, label: "Profile", href: "/profile" },
  ];

  const photographerItems = [
    { icon: Camera, label: "Home", href: "/photographer-home" },
    { icon: Calendar, label: "Bookings", href: "/photographer-bookings" },
    { icon: DollarSign, label: "Earnings", href: "/dashboard" },
    { icon: Settings, label: "Profile", href: "/photographer-profile" },
  ];

  const items = user?.role === "photographer" ? photographerItems : customerItems;

  return (
    <div className="fixed bottom-0 left-0 right-0 mx-auto max-w-md bg-background border-t border-white/10 pb-6 pt-2 z-50">
      <nav className="flex justify-between items-center px-6">
        {items.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex flex-col items-center gap-1 transition-colors duration-200 cursor-pointer py-2",
                isActive ? "text-white" : "text-muted-foreground hover:text-white/80"
              )} data-testid={`nav-${item.label.toLowerCase()}`}>
                <item.icon className={cn("w-6 h-6", isActive && "fill-current")} strokeWidth={isActive ? 0 : 2} />
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive && <div className="w-1 h-1 bg-primary rounded-full" />}
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
