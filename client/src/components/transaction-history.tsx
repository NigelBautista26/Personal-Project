import { ArrowDownLeft, ArrowUpRight, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

const transactions = [
  {
    id: 1,
    type: "receive",
    title: "Received BTC",
    subtitle: "From External Wallet",
    amount: "+0.0045 BTC",
    date: "Today, 10:23 AM",
    icon: ArrowDownLeft,
    color: "text-primary"
  },
  {
    id: 2,
    type: "send",
    title: "Sent ETH",
    subtitle: "To Alice",
    amount: "-1.2 ETH",
    date: "Yesterday, 4:15 PM",
    icon: ArrowUpRight,
    color: "text-white"
  },
  {
    id: 3,
    type: "buy",
    title: "Bought SOL",
    subtitle: "Credit Card",
    amount: "+50 SOL",
    date: "Nov 24, 2:30 PM",
    icon: ShoppingCart,
    color: "text-primary"
  }
];

export function TransactionHistory() {
  return (
    <div className="space-y-1">
      {transactions.map((tx) => (
        <div 
          key={tx.id} 
          className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center bg-white/5 ring-1 ring-white/10",
              tx.color
            )}>
              <tx.icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">{tx.title}</h3>
              <span className="text-xs text-muted-foreground">{tx.subtitle}</span>
            </div>
          </div>
          <div className="text-right">
            <p className={cn(
              "font-bold text-sm tabular-nums",
              tx.type === 'send' ? "text-white" : "text-primary"
            )}>{tx.amount}</p>
            <span className="text-xs text-muted-foreground">{tx.date}</span>
          </div>
        </div>
      ))}
    </div>
  );
}