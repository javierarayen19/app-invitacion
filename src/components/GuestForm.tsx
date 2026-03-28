"use client";

import { useState } from "react";

interface GuestFormProps {
  onGuestAdded: () => void;
}

export default function GuestForm({ onGuestAdded }: GuestFormProps) {
  const [name, setName] = useState("");
  const [confirmed, setConfirmed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, confirmed }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al agregar invitado");
      }

      setName("");
      setConfirmed(true);
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

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setConfirmed(!confirmed)}
          className={`relative w-12 h-7 rounded-full transition-all duration-300 ${
            confirmed
              ? "bg-emerald-accent/30 border border-emerald-accent/50"
              : "bg-white/[0.05] border border-border"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full shadow-md
                        transition-all duration-300 ${
                          confirmed
                            ? "translate-x-5 bg-emerald-accent"
                            : "translate-x-0 bg-foreground/30"
                        }`}
          />
        </button>
        <span className="text-sm text-foreground/50">
          {confirmed ? "Confirmado" : "Pendiente"}
        </span>
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
