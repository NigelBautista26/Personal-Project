import { Home, MessageSquare, Calendar, User, Search } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const [location] = useLocation();

  const items = [
    { icon: Home, label: "Explore", href: "/home" },
    { icon: Search, label: "Search", href: "/search" },
    { icon: Calendar, label: "Bookings", href: "/bookings" },
    { icon: MessageSquare, label: "Chat", href: "/chat" },
    { icon: User, label: "Profile", href: "/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-white/10 pb-6 pt-2 z-50">
      <nav className="flex justify-between items-center max-w-md mx-auto px-6">
        {items.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex flex-col items-center gap-1 transition-colors duration-200 cursor-pointer py-2",
                isActive ? "text-white" : "text-muted-foreground hover:text-white/80"
              )}>
                <item.icon className={cn("w-6 h-6", isActive && "fill-current")} strokeWidth={isActive ? 0 : 2} />
                {isActive && <div className="w-1 h-1 bg-primary rounded-full mt-1" />}
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}