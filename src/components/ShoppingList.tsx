"use client";

import type { ShoppingItem } from "@/types/shopping";
import { SHOPPING_CATEGORIES } from "@/types/shopping";

const CATEGORY_ICONS: Record<string, string> = {
  "Comida Fuerte": "🍖",
  "Comida para Picar": "🍿",
  "Decoracion": "🎈",
  "Mesa y Servicio": "🍽️",
  "Liquidos": "🥤",
};

interface ShoppingListProps {
  items: ShoppingItem[];
  onToggleBought: (id: string, bought: boolean) => void;
  onDelete: (id: string) => void;
}

export default function ShoppingList({
  items,
  onToggleBought,
  onDelete,
}: ShoppingListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/5 border border-gold/10 flex items-center justify-center">
          <span className="text-2xl">🛒</span>
        </div>
        <p className="text-foreground/40 text-sm font-medium">
          Aun no hay productos
        </p>
        <p className="text-foreground/20 text-xs mt-1">
          Agrega el primero usando el formulario
        </p>
      </div>
    );
  }

  // Group by category in defined order
  const grouped = SHOPPING_CATEGORIES.map((cat) => ({
    category: cat,
    icon: CATEGORY_ICONS[cat],
    items: items.filter((item) => item.category === cat),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="space-y-6">
      {grouped.map((group) => {
        const boughtCount = group.items.filter((i) => i.bought).length;
        const allBought = boughtCount === group.items.length;
        const categoryTotal = group.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

        return (
          <div key={group.category}>
            {/* Category header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{group.icon}</span>
                <h3 className="text-sm font-semibold text-foreground/70 tracking-wide">
                  {group.category}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {categoryTotal > 0 && (
                  <span className="text-[10px] font-medium text-gold/50">
                    ${categoryTotal.toLocaleString("es-CL")}
                  </span>
                )}
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    allBought
                      ? "bg-emerald-accent/15 text-emerald-accent"
                      : "bg-gold/10 text-gold/60"
                  }`}
                >
                  {boughtCount}/{group.items.length}
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-1.5">
              {group.items.map((item) => (
                <div
                  key={item.id}
                  className={`group flex items-center gap-3 px-4 py-3 rounded-xl
                             border transition-all duration-300 ${
                               item.bought
                                 ? "bg-emerald-accent/[0.03] border-emerald-accent/10"
                                 : item.urgent
                                   ? "bg-rose-accent/[0.04] border-l-2 border-l-rose-accent/40 border-t-transparent border-r-transparent border-b-transparent hover:bg-rose-accent/[0.07]"
                                   : "bg-white/[0.02] border-transparent hover:bg-white/[0.05] hover:border-border"
                             }`}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => onToggleBought(item.id, !item.bought)}
                    className={`shrink-0 w-6 h-6 rounded-lg flex items-center justify-center
                               border transition-all duration-300 ${
                                 item.bought
                                   ? "bg-emerald-accent/20 border-emerald-accent/40 text-emerald-accent"
                                   : "bg-white/[0.03] border-border hover:border-gold/30"
                               }`}
                  >
                    {item.bought && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>

                  {/* Item info */}
                  <div className={`flex-1 min-w-0 ${item.bought ? "opacity-40" : ""}`}>
                    <div className="flex items-center gap-1.5">
                      {item.urgent && !item.bought && (
                        <span className="text-xs" title="Urgente">🔥</span>
                      )}
                      <span
                        className={`text-sm font-medium ${
                          item.bought
                            ? "line-through text-foreground/50"
                            : "text-foreground/90"
                        }`}
                      >
                        {item.name}
                      </span>
                    </div>
                    {item.responsible && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-foreground/40 mt-0.5">
                        👤 {item.responsible}
                      </span>
                    )}
                  </div>

                  {/* Quantity & Price */}
                  <div className={`shrink-0 flex items-center gap-1.5 ${item.bought ? "opacity-40" : ""}`}>
                    {item.quantity > 1 && (
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                          item.bought
                            ? "bg-emerald-accent/10 text-emerald-accent/50"
                            : "bg-gold/10 text-gold/70"
                        }`}
                      >
                        x{item.quantity}
                      </span>
                    )}
                    {item.price > 0 && (
                      <span className="text-[11px] font-semibold text-gold/60">
                        ${(item.price * item.quantity).toLocaleString("es-CL")}
                      </span>
                    )}
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => onDelete(item.id)}
                    className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center
                               text-foreground/20 hover:text-rose-accent hover:bg-rose-accent/10
                               border border-border/30 hover:border-rose-accent/20
                               transition-all duration-300"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
