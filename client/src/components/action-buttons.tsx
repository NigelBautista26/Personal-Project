import { ArrowUpRight, ArrowDownLeft, Repeat, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ActionButtons() {
  const actions = [
    { icon: ArrowUpRight, label: "Send" },
    { icon: ArrowDownLeft, label: "Receive" },
    { icon: Repeat, label: "Swap" },
    { icon: CreditCard, label: "Buy" },
  ];

  return (
    <div className="flex justify-between gap-4 my-6">
      {actions.map((action) => (
        <div key={action.label} className="flex flex-col items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-14 w-14 rounded-full glass-panel border-white/10 hover:bg-primary/20 hover:text-primary hover:border-primary/50 transition-all duration-300"
            data-testid={`action-${action.label.toLowerCase()}`}
          >
            <action.icon className="w-6 h-6" />
          </Button>
          <span className="text-xs font-medium text-muted-foreground">{action.label}</span>
        </div>
      ))}
    </div>
  );
}