import { BalanceCard } from "@/components/balance-card";
import { ActionButtons } from "@/components/action-buttons";
import { CryptoList } from "@/components/crypto-list";
import { BottomNav } from "@/components/bottom-nav";
import { Bell, Search } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-6 pt-8 pb-4 flex justify-between items-center">
        <div>
          <p className="text-muted-foreground text-sm">Welcome back,</p>
          <h1 className="text-2xl font-bold text-white">Alex Chen</h1>
        </div>
        <div className="flex gap-3">
          <button className="w-10 h-10 rounded-full bg-card border border-white/5 flex items-center justify-center text-muted-foreground hover:text-white hover:border-white/20 transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-full bg-card border border-white/5 flex items-center justify-center text-muted-foreground hover:text-white hover:border-white/20 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-card" />
          </button>
        </div>
      </div>

      <div className="px-6">
        <BalanceCard />
        <ActionButtons />
        
        <div className="mt-8">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-xl font-bold text-white">Top Assets</h2>
            <button className="text-primary text-sm font-medium hover:underline">See All</button>
          </div>
          <CryptoList limit={3} />
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}