"use client";

import type { ShoppingItem } from "@/types/shopping";
import { BUDGET_TOTAL, SHOPPING_CATEGORIES } from "@/types/shopping";

const CATEGORY_ICONS: Record<string, string> = {
  "Comida Fuerte": "🍖",
  "Comida para Picar": "🍿",
  "Dulces y Torta": "🎂",
  "Decoracion": "🎈",
  "Mesa y Servicio": "🍽️",
  "Liquidos": "🥤",
};

const CATEGORY_COLORS: Record<string, string> = {
  "Comida Fuerte": "from-orange-400 to-orange-500",
  "Comida para Picar": "from-yellow-400 to-amber-500",
  "Dulces y Torta": "from-pink-400 to-rose-500",
  "Decoracion": "from-violet-400 to-purple-500",
  "Mesa y Servicio": "from-sky-400 to-blue-500",
  "Liquidos": "from-emerald-400 to-teal-500",
};

const CATEGORY_BG: Record<string, string> = {
  "Comida Fuerte": "bg-orange-400",
  "Comida para Picar": "bg-amber-400",
  "Dulces y Torta": "bg-pink-400",
  "Decoracion": "bg-violet-400",
  "Mesa y Servicio": "bg-sky-400",
  "Liquidos": "bg-emerald-400",
};

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

  // Calculate spending per category
  const categoryData = SHOPPING_CATEGORIES.map((cat) => {
    const catItems = items.filter((i) => i.category === cat);
    const catTotal = catItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    return {
      category: cat,
      icon: CATEGORY_ICONS[cat],
      total: catTotal,
      count: catItems.length,
      color: CATEGORY_COLORS[cat],
      bg: CATEGORY_BG[cat],
    };
  }).filter((c) => c.count > 0);

  const maxCategorySpent = Math.max(...categoryData.map((c) => c.total), 1);

  // For the donut chart
  const categoriesWithSpending = categoryData.filter((c) => c.total > 0);
  const totalForChart = categoriesWithSpending.reduce((sum, c) => sum + c.total, 0);

  return (
    <div className="space-y-4">
      {/* Budget summary */}
      <div className="p-5 rounded-2xl bg-surface border border-border glow-gold space-y-5">
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

      {/* Chart: Spending by category */}
      {categoryData.length > 0 && (
        <div className="p-5 rounded-2xl bg-surface border border-border glow-gold space-y-5">
          <h3 className="text-[10px] font-medium text-foreground/30 tracking-widest uppercase">
            Gastos por Categoria
          </h3>

          {/* Horizontal bar chart */}
          <div className="space-y-3">
            {categoryData
              .sort((a, b) => b.total - a.total)
              .map((cat) => {
                const barPercent = maxCategorySpent > 0
                  ? Math.max((cat.total / maxCategorySpent) * 100, cat.total > 0 ? 4 : 0)
                  : 0;
                const budgetShare = totalSpent > 0
                  ? Math.round((cat.total / totalSpent) * 100)
                  : 0;

                return (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{cat.icon}</span>
                        <span className="text-xs font-medium text-foreground/60">
                          {cat.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-foreground/30">
                          {budgetShare}%
                        </span>
                        <span className="text-xs font-semibold text-gold/70">
                          {formatPrice(cat.total)}
                        </span>
                      </div>
                    </div>
                    <div className="relative h-4 rounded-full bg-white/[0.04] overflow-hidden">
                      <div
                        className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${cat.color} transition-all duration-700 ease-out`}
                        style={{ width: `${barPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Mini donut / pie breakdown */}
          {categoriesWithSpending.length > 1 && (
            <div className="pt-4 border-t border-border/30">
              <h4 className="text-[10px] font-medium text-foreground/25 tracking-widest uppercase mb-3">
                Distribucion del gasto
              </h4>

              {/* Stacked bar as visual summary */}
              <div className="relative h-6 rounded-full overflow-hidden flex">
                {categoriesWithSpending
                  .sort((a, b) => b.total - a.total)
                  .map((cat, i) => {
                    const pct = (cat.total / totalForChart) * 100;
                    return (
                      <div
                        key={cat.category}
                        className={`h-full ${cat.bg} ${i === 0 ? "rounded-l-full" : ""} ${
                          i === categoriesWithSpending.length - 1 ? "rounded-r-full" : ""
                        } transition-all duration-700 relative group`}
                        style={{ width: `${pct}%`, opacity: 0.8 }}
                        title={`${cat.category}: ${formatPrice(cat.total)} (${Math.round(pct)}%)`}
                      />
                    );
                  })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
                {categoriesWithSpending
                  .sort((a, b) => b.total - a.total)
                  .map((cat) => {
                    const pct = Math.round((cat.total / totalForChart) * 100);
                    return (
                      <div key={cat.category} className="flex items-center gap-1.5">
                        <div className={`w-2.5 h-2.5 rounded-full ${cat.bg}`} style={{ opacity: 0.8 }} />
                        <span className="text-[10px] text-foreground/40">
                          {cat.icon} {cat.category} ({pct}%)
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
