"use client";

import type { ShoppingItem } from "@/types/shopping";

interface ShoppingStatsProps {
  items: ShoppingItem[];
}

export default function ShoppingStats({ items }: ShoppingStatsProps) {
  const total = items.length;
  const bought = items.filter((i) => i.bought).length;
  const pending = total - bought;
  const percentage = total > 0 ? Math.round((bought / total) * 100) : 0;

  return (
    <div className="p-5 rounded-2xl bg-surface border border-border glow-gold">
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <p className="text-[10px] font-medium text-foreground/30 tracking-widest uppercase mb-1 flex items-center justify-center gap-1.5">
            <span className="text-base">🛒</span> Total
          </p>
          <p className="text-2xl font-bold text-gold">{total}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-medium text-foreground/30 tracking-widest uppercase mb-1 flex items-center justify-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-accent">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Comprado
          </p>
          <p className="text-2xl font-bold text-emerald-accent">{bought}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-medium text-foreground/30 tracking-widest uppercase mb-1 flex items-center justify-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold/50">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Pendiente
          </p>
          <p className="text-2xl font-bold text-gold/50">{pending}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-2.5 rounded-full bg-white/[0.05] overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-accent/80 to-emerald-accent transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-center text-[11px] text-foreground/30 mt-2">
        {percentage}% completado
      </p>
    </div>
  );
}
