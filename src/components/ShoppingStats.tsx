"use client";

import type { ShoppingItem } from "@/types/shopping";
import { BUDGET_TOTAL } from "@/types/shopping";

function formatPrice(n: number) {
  return "$" + n.toLocaleString("es-CL");
}

interface ShoppingStatsProps {
  items: ShoppingItem[];
}

export default function ShoppingStats({ items }: ShoppingStatsProps) {
  const total = items.length;
  const bought = items.filter((i) => i.bought).length;
  const totalSpent = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const remaining = BUDGET_TOTAL - totalSpent;
  const budgetPercent = Math.min(Math.round((totalSpent / BUDGET_TOTAL) * 100), 100);
  const isOverBudget = remaining < 0;

  return (
    <div className="p-5 rounded-2xl bg-surface border border-border glow-gold space-y-5">
      {/* Budget section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[10px] font-medium text-foreground/30 tracking-widest uppercase">
            Presupuesto
          </h3>
          <span className="text-[11px] text-foreground/30">
            {formatPrice(BUDGET_TOTAL)}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="text-center p-3 rounded-xl bg-white/[0.02] border border-border/50">
            <p className="text-[10px] text-foreground/30 tracking-wide mb-1">Gastado</p>
            <p className={`text-lg font-bold ${isOverBudget ? "text-rose-accent" : "text-gold"}`}>
              {formatPrice(totalSpent)}
            </p>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/[0.02] border border-border/50">
            <p className="text-[10px] text-foreground/30 tracking-wide mb-1">Disponible</p>
            <p className={`text-lg font-bold ${isOverBudget ? "text-rose-accent" : "text-emerald-accent"}`}>
              {formatPrice(Math.abs(remaining))}
              {isOverBudget && <span className="text-[10px] block">excedido</span>}
            </p>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/[0.02] border border-border/50">
            <p className="text-[10px] text-foreground/30 tracking-wide mb-1">Productos</p>
            <p className="text-lg font-bold text-gold/70">
              {bought}<span className="text-foreground/20">/{total}</span>
            </p>
          </div>
        </div>

        {/* Budget progress bar */}
        <div className="relative h-3 rounded-full bg-white/[0.05] overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
              isOverBudget
                ? "bg-gradient-to-r from-rose-accent/80 to-rose-accent"
                : budgetPercent > 80
                ? "bg-gradient-to-r from-amber/80 to-amber"
                : "bg-gradient-to-r from-emerald-accent/80 to-emerald-accent"
            }`}
            style={{ width: `${Math.min(budgetPercent, 100)}%` }}
          />
        </div>
        <p className={`text-center text-[11px] mt-1.5 ${
          isOverBudget ? "text-rose-accent" : budgetPercent > 80 ? "text-amber" : "text-foreground/30"
        }`}>
          {budgetPercent}% del presupuesto utilizado
        </p>
      </div>
    </div>
  );
}
