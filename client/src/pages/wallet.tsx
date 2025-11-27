import { CryptoList } from "@/components/crypto-list";
import { TransactionHistory } from "@/components/transaction-history";
import { BottomNav } from "@/components/bottom-nav";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const data = [
  { name: 'BTC', value: 400, color: '#F7931A' },
  { name: 'ETH', value: 300, color: '#627EEA' },
  { name: 'SOL', value: 300, color: '#14F195' },
  { name: 'Other', value: 200, color: '#E6007A' },
];

export default function Wallet() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-6 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-white mb-6">Your Wallet</h1>
        
        <div className="glass-panel rounded-3xl p-6 mb-8 flex items-center justify-center relative overflow-hidden">
          <div className="w-48 h-48 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-muted-foreground text-xs">Total</span>
              <span className="text-xl font-bold text-white">$24k</span>
            </div>
          </div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Assets</h2>
            <CryptoList />
          </div>
          
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Recent Activity</h2>
            <TransactionHistory />
          </div>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}