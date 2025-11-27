import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

const data = [
  { value: 40 }, { value: 35 }, { value: 55 }, { value: 45 }, { value: 60 }, { value: 75 }, { value: 65 }
];

const assets = [
  { 
    id: "btc", 
    name: "Bitcoin", 
    symbol: "BTC", 
    price: "$64,230.50", 
    change: "+1.2%", 
    isPositive: true,
    color: "#F7931A",
    chartData: data 
  },
  { 
    id: "eth", 
    name: "Ethereum", 
    symbol: "ETH", 
    price: "$3,450.12", 
    change: "-0.5%", 
    isPositive: false,
    color: "#627EEA",
    chartData: [...data].reverse() 
  },
  { 
    id: "sol", 
    name: "Solana", 
    symbol: "SOL", 
    price: "$145.20", 
    change: "+5.8%", 
    isPositive: true,
    color: "#14F195",
    chartData: data 
  },
  { 
    id: "dot", 
    name: "Polkadot", 
    symbol: "DOT", 
    price: "$8.50", 
    change: "-1.2%", 
    isPositive: false,
    color: "#E6007A",
    chartData: [...data].map(d => ({ value: d.value * 0.8 })) 
  }
];

export function CryptoList({ limit }: { limit?: number }) {
  const displayAssets = limit ? assets.slice(0, limit) : assets;

  return (
    <div className="space-y-4">
      {displayAssets.map((asset) => (
        <div 
          key={asset.id} 
          className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer group"
          data-testid={`asset-${asset.id}`}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 text-xs font-bold ring-1 ring-white/10">
              {asset.symbol[0]}
            </div>
            <div>
              <h3 className="font-bold text-sm">{asset.name}</h3>
              <span className="text-xs text-muted-foreground">{asset.symbol}</span>
            </div>
          </div>

          <div className="w-20 h-10 opacity-50 group-hover:opacity-100 transition-opacity">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={asset.chartData}>
                  <defs>
                    <linearGradient id={`gradient-${asset.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={asset.isPositive ? "hsl(var(--primary))" : "hsl(var(--destructive))"} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={asset.isPositive ? "hsl(var(--primary))" : "hsl(var(--destructive))"} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke={asset.isPositive ? "hsl(var(--primary))" : "hsl(var(--destructive))"} 
                    fill={`url(#gradient-${asset.id})`} 
                    strokeWidth={2}
                  />
                </AreaChart>
             </ResponsiveContainer>
          </div>

          <div className="text-right">
            <p className="font-bold text-sm tabular-nums">{asset.price}</p>
            <p className={cn(
              "text-xs font-medium tabular-nums",
              asset.isPositive ? "text-primary" : "text-destructive"
            )}>
              {asset.change}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}