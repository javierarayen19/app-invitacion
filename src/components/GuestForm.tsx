"use client";

import { useState } from "react";

const DIETARY_OPTIONS = [
  "Vegano",
  "Vegetariano",
  "Alergico",
  "Celiaco",
  "Intolerante a lactosa",
  "Sin gluten",
  "Sin mariscos",
  "Sin frutos secos",
];

interface GuestFormProps {
  onGuestAdded: () => void;
}

export default function GuestForm({ onGuestAdded }: GuestFormProps) {
  const [name, setName] = useState("");
  const [confirmed] = useState(false);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleDietary(option: string) {
    setSelectedDietary((prev) =>
      prev.includes(option)
        ? prev.filter((d) => d !== option)
        : [...prev, option]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          confirmed,
          dietary: selectedDietary.join(", "),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al agregar invitado");
      }

      setName("");
      setSelectedDietary([]);
      onGuestAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-foreground/50 mb-2 tracking-wide"
        >
          Nombre del invitado
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Maria Lopez"
          required
          className="w-full px-4 py-3.5 rounded-xl bg-white/[0.03] border border-border
                     text-foreground placeholder:text-foreground/20
                     focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20
                     focus:bg-white/[0.05]
                     transition-all duration-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground/50 mb-2 tracking-wide">
          Restriccion alimentaria
        </label>
        <div className="flex flex-wrap gap-2">
          {DIETARY_OPTIONS.map((option) => {
            const isSelected = selectedDietary.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => toggleDietary(option)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium
                           transition-all duration-200 border
                           ${isSelected
                             ? "bg-gold/15 border-gold/40 text-gold"
                             : "bg-white/[0.02] border-border text-foreground/40 hover:border-border-hover hover:text-foreground/60"
                           }`}
              >
                {option}
              </button>
            );
          })}
        </div>
        {selectedDietary.length > 0 && (
          <p className="text-xs text-gold/50 mt-1.5">
            {selectedDietary.join(", ")}
          </p>
        )}
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
        {loading ? "Agregando..." : "Agregar Invitado"}
      </button>
    </form>
  );
}
