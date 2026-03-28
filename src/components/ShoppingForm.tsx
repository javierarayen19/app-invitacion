"use client";

import { useState } from "react";
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

interface ShoppingFormProps {
  onItemAdded: () => void;
}

export default function ShoppingForm({ onItemAdded }: ShoppingFormProps) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [priceText, setPriceText] = useState("");
  const [category, setCategory] = useState<string>(SHOPPING_CATEGORIES[0]);
  const [responsible, setResponsible] = useState("");
  const [link, setLink] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const price = parsePrice(priceText);

    try {
      const res = await fetch("/api/shopping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, quantity, price, category, responsible, urgent, link }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al agregar item");
      }

      setName("");
      setQuantity(1);
      setPriceText("");
      setResponsible("");
      setLink("");
      setUrgent(false);
      onItemAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground/50 mb-2 tracking-wide">
          Producto
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Papas fritas"
          required
          className="w-full px-4 py-3.5 rounded-xl bg-white/[0.03] border border-border
                     text-foreground placeholder:text-foreground/20
                     focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20
                     focus:bg-white/[0.05] transition-all duration-300"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-foreground/50 mb-2 tracking-wide">
            Cantidad
          </label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full px-4 py-3.5 rounded-xl bg-white/[0.03] border border-border
                       text-foreground placeholder:text-foreground/20
                       focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20
                       focus:bg-white/[0.05] transition-all duration-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/50 mb-2 tracking-wide">
            Precio ($)
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={priceText}
            onChange={(e) => setPriceText(formatPrice(e.target.value))}
            placeholder="Ej: 49.900"
            className="w-full px-4 py-3.5 rounded-xl bg-white/[0.03] border border-border
                       text-foreground placeholder:text-foreground/20
                       focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20
                       focus:bg-white/[0.05] transition-all duration-300"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground/50 mb-2 tracking-wide">
          Categoria
        </label>
        <div className="grid grid-cols-2 gap-2">
          {SHOPPING_CATEGORIES.map((cat) => {
            const isSelected = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left
                           text-xs font-medium transition-all duration-300
                           ${
                             isSelected
                               ? "bg-gold/10 border-gold/30 text-gold shadow-[0_0_12px_rgba(212,168,83,0.1)]"
                               : "bg-white/[0.02] border-border/50 text-foreground/40 hover:border-gold/20 hover:text-foreground/60 hover:bg-white/[0.04]"
                           }`}
              >
                <span className="text-base">{CATEGORY_ICONS[cat]}</span>
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground/50 mb-2 tracking-wide">
          Link del producto
        </label>
        <input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="Ej: https://www.jumbo.cl/pizza-napolitana"
          className="w-full px-4 py-3.5 rounded-xl bg-white/[0.03] border border-border
                     text-foreground placeholder:text-foreground/20 text-sm
                     focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20
                     focus:bg-white/[0.05] transition-all duration-300"
        />
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
        <div>
          <label className="block text-sm font-medium text-foreground/50 mb-2 tracking-wide">
            Responsable
          </label>
          <input
            type="text"
            value={responsible}
            onChange={(e) => setResponsible(e.target.value)}
            placeholder="Ej: Karen"
            className="w-full px-4 py-3.5 rounded-xl bg-white/[0.03] border border-border
                       text-foreground placeholder:text-foreground/20
                       focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20
                       focus:bg-white/[0.05] transition-all duration-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/50 mb-2 tracking-wide">
            Urgente
          </label>
          <button
            type="button"
            onClick={() => setUrgent(!urgent)}
            className={`px-4 py-3.5 rounded-xl border transition-all duration-300 text-lg
                       ${
                         urgent
                           ? "bg-rose-accent/10 border-rose-accent/40 text-rose-accent shadow-[0_0_12px_rgba(244,63,94,0.15)]"
                           : "bg-white/[0.03] border-border text-foreground/30 hover:border-gold/30 hover:text-foreground/50"
                       }`}
          >
            🔥
          </button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-rose-accent bg-rose-accent/10 px-4 py-2.5 rounded-xl border border-rose-accent/20">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-xl font-semibold text-background text-sm tracking-wide
                   bg-gradient-to-r from-gold-dark via-gold to-gold-light
                   hover:shadow-[0_0_30px_rgba(212,168,83,0.3)]
                   active:scale-[0.98] disabled:opacity-50
                   transition-all duration-300"
      >
        {loading ? "Agregando..." : "Agregar Producto"}
      </button>
    </form>
  );
}
