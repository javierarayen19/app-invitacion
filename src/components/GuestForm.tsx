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
          className="block text-sm font-semibold text-amber-900 mb-1.5"
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
          className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 bg-white/70
                     text-amber-950 placeholder:text-amber-300
                     focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200
                     transition-all duration-200"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setConfirmed(!confirmed)}
          className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
            confirmed ? "bg-emerald-500" : "bg-amber-200"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md
                        transition-transform duration-200 ${
                          confirmed ? "translate-x-5" : "translate-x-0"
                        }`}
          />
        </button>
        <span className="text-sm font-medium text-amber-900">
          {confirmed ? "Confirmado" : "Pendiente"}
        </span>
      </div>

      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 px-4 py-2 rounded-lg">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-xl font-bold text-white
                   bg-gradient-to-r from-rose-500 to-amber-500
                   hover:from-rose-600 hover:to-amber-600
                   active:scale-[0.98] disabled:opacity-50
                   transition-all duration-200 shadow-lg shadow-rose-200/50
                   text-base tracking-wide"
      >
        {loading ? "Agregando..." : "Agregar Invitado"}
      </button>
    </form>
  );
}
