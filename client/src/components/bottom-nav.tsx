import { Home, Wallet, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const [location] = useLocation();

  const items = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Wallet, label: "Wallet", href: "/wallet" },
    { icon: User, label: "Profile", href: "/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 z-50">
      <nav className="glass-panel rounded-2xl px-6 py-3 flex justify-between items-center max-w-md mx-auto">
        {items.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex flex-col items-center gap-1 transition-colors duration-200 cursor-pointer",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}>
                <item.icon className={cn("w-6 h-6", isActive && "fill-current/20")} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}