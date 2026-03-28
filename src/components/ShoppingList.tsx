"use client";

import { useState } from "react";
import type { ShoppingItem } from "@/types/shopping";
import { SHOPPING_CATEGORIES } from "@/types/shopping";

const CATEGORY_ICONS: Record<string, string> = {
  "Comida Fuerte": "🍖",
  "Comida para Picar": "🍿",
  "Dulces y Torta": "🎂",
  "Decoracion": "🎈",
  "Mesa y Servicio": "🍽️",
  "Liquidos": "🥤",
};

function formatPrice(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("es-CL");
}

function parsePrice(formatted: string): number {
  const digits = formatted.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

interface ShoppingListProps {
  items: ShoppingItem[];
  onToggleBought: (id: string, bought: boolean) => void;
  onDelete: (id: string) => void;
  onItemUpdated: () => void;
}

export default function ShoppingList({
  items,
  onToggleBought,
  onDelete,
  onItemUpdated,
}: ShoppingListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editQuantity, setEditQuantity] = useState(1);
  const [editPriceText, setEditPriceText] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editResponsible, setEditResponsible] = useState("");
  const [editLink, setEditLink] = useState("");
  const [editUrgent, setEditUrgent] = useState(false);
  const [saving, setSaving] = useState(false);

  function startEdit(item: ShoppingItem) {
    setEditingId(item.id);
    setEditName(item.name);
    setEditQuantity(item.quantity);
    setEditPriceText(item.price > 0 ? formatPrice(String(item.price)) : "");
    setEditCategory(item.category);
    setEditResponsible(item.responsible || "");
    setEditLink(item.link || "");
    setEditUrgent(item.urgent);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit() {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/shopping", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          name: editName,
          quantity: editQuantity,
          price: parsePrice(editPriceText),
          category: editCategory,
          responsible: editResponsible,
          link: editLink,
          urgent: editUrgent,
        }),
      });
      if (res.ok) {
        setEditingId(null);
        onItemUpdated();
      }
    } catch (err) {
      console.error("Error editando item:", err);
    } finally {
      setSaving(false);
    }
  }

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

  const inputClass =
    "w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-border text-foreground placeholder:text-foreground/20 text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all duration-300";

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
              {group.items.map((item) =>
                editingId === item.id ? (
                  /* Edit mode */
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-gold/[0.03] border border-gold/20 space-y-3"
                  >
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Nombre del producto"
                      className={inputClass}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-foreground/30 mb-1 uppercase tracking-wider">Cantidad</label>
                        <input
                          type="number"
                          min={1}
                          value={editQuantity}
                          onChange={(e) => setEditQuantity(Number(e.target.value))}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-foreground/30 mb-1 uppercase tracking-wider">Precio ($)</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={editPriceText}
                          onChange={(e) => setEditPriceText(formatPrice(e.target.value))}
                          placeholder="49.900"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-foreground/30 mb-1 uppercase tracking-wider">Responsable</label>
                        <input
                          type="text"
                          value={editResponsible}
                          onChange={(e) => setEditResponsible(e.target.value)}
                          placeholder="Nombre"
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] text-foreground/30 mb-1 uppercase tracking-wider">Link del producto</label>
                      <input
                        type="url"
                        value={editLink}
                        onChange={(e) => setEditLink(e.target.value)}
                        placeholder="https://..."
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-foreground/30 mb-1 uppercase tracking-wider">Categoria</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {SHOPPING_CATEGORIES.map((cat) => {
                          const isSelected = editCategory === cat;
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setEditCategory(cat)}
                              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-left
                                         text-[10px] font-medium transition-all duration-300
                                         ${
                                           isSelected
                                             ? "bg-gold/10 border-gold/30 text-gold"
                                             : "bg-white/[0.02] border-border/50 text-foreground/35 hover:border-gold/20 hover:text-foreground/50"
                                         }`}
                            >
                              <span className="text-xs">{CATEGORY_ICONS[cat]}</span>
                              <span>{cat}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditUrgent(!editUrgent)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all duration-300 text-xs font-medium
                                   ${
                                     editUrgent
                                       ? "bg-rose-accent/10 border-rose-accent/40 text-rose-accent"
                                       : "bg-white/[0.03] border-border text-foreground/30"
                                   }`}
                      >
                        🔥 {editUrgent ? "Urgente" : "Marcar urgente"}
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={saveEdit}
                        disabled={saving}
                        className="flex-1 py-2 rounded-lg text-xs font-semibold
                                   bg-emerald-accent/15 text-emerald-accent border border-emerald-accent/30
                                   hover:bg-emerald-accent/25 active:scale-[0.98]
                                   disabled:opacity-50 transition-all duration-300"
                      >
                        {saving ? "Guardando..." : "Guardar"}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex-1 py-2 rounded-lg text-xs font-semibold
                                   bg-white/[0.03] text-foreground/40 border border-border
                                   hover:text-foreground/60 active:scale-[0.98]
                                   transition-all duration-300"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Normal display mode */
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
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.responsible && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-foreground/40 mt-0.5">
                            👤 {item.responsible}
                          </span>
                        )}
                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-medium text-gold/50 hover:text-gold mt-0.5 transition-colors"
                            title="Ver producto"
                          >
                            🔗 Ver link
                          </a>
                        )}
                      </div>
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

                    {/* Edit button */}
                    <button
                      onClick={() => startEdit(item)}
                      className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center
                                 text-foreground/20 hover:text-gold hover:bg-gold/10
                                 border border-border/30 hover:border-gold/20
                                 transition-all duration-300"
                      title="Editar producto"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => onDelete(item.id)}
                      className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center
                                 text-foreground/20 hover:text-rose-accent hover:bg-rose-accent/10
                                 border border-border/30 hover:border-rose-accent/20
                                 transition-all duration-300"
                      title="Eliminar producto"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
