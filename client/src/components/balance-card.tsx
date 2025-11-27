import { motion } from "framer-motion";

export function BalanceCard() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-card to-card border border-white/5 p-6 shadow-2xl"
    >
      {/* Abstract background elements */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-background/50 to-transparent pointer-events-none" />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-muted-foreground text-sm font-medium mb-1">Total Balance</p>
            <h2 className="text-4xl font-bold font-display text-white tracking-tight">
              $24,562.80
            </h2>
          </div>
          <div className="bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            <span className="text-primary text-xs font-bold">+2.4%</span>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="h-1 flex-1 bg-primary rounded-full opacity-100" />
          <div className="h-1 flex-1 bg-primary/30 rounded-full" />
          <div className="h-1 flex-1 bg-primary/30 rounded-full" />
        </div>
      </div>
    </motion.div>
  );
}