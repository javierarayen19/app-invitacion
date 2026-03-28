"use client";

import { useState } from "react";
import { SHOPPING_CATEGORIES } from "@/types/shopping";

interface ShoppingFormProps {
  onItemAdded: () => void;
}

export default function ShoppingForm({ onItemAdded }: ShoppingFormProps) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState<string>(SHOPPING_CATEGORIES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/shopping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, quantity, price, category }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al agregar item");
      }

      setName("");
      setQuantity(1);
      setPrice(0);
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
            type="number"
            min={0}
            value={price || ""}
            onChange={(e) => setPrice(Number(e.target.value))}
            placeholder="0"
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
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-3.5 rounded-xl bg-white/[0.03] border border-border
                     text-foreground appearance-none
                     focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20
                     focus:bg-white/[0.05] transition-all duration-300"
        >
          {SHOPPING_CATEGORIES.map((cat) => (
            <option key={cat} value={cat} className="bg-surface text-foreground">
              {cat}
            </option>
          ))}
        </select>
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
