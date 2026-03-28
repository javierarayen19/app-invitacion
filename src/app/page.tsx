"use client";

import { useState, useEffect, useCallback } from "react";
import type { Guest } from "@/types/guest";
import GuestForm from "@/components/GuestForm";
import GuestList from "@/components/GuestList";
import StatsBar from "@/components/StatsBar";
import SettingsPanel from "@/components/SettingsPanel";
import Sparkles from "@/components/Sparkles";

export default function Home() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGuests = useCallback(async () => {
    try {
      const res = await fetch("/api/guests");
      const data = await res.json();
      setGuests(data);
    } catch (err) {
      console.error("Error cargando invitados:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/guests?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchGuests();
    } catch (err) {
      console.error("Error eliminando invitado:", err);
    }
  }

  async function handleToggleConfirm(id: string, confirmed: boolean) {
    try {
      const res = await fetch("/api/guests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, confirmed }),
      });
      if (res.ok) fetchGuests();
    } catch (err) {
      console.error("Error actualizando invitado:", err);
    }
  }

  return (
    <div className="min-h-screen bg-background relative noise-overlay">
      <Sparkles />

      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-64 -right-64 w-[500px] h-[500px] rounded-full bg-gold/[0.03] blur-[120px]" />
        <div className="absolute top-1/2 -left-64 w-[400px] h-[400px] rounded-full bg-rose-accent/[0.02] blur-[100px]" />
        <div className="absolute -bottom-64 right-1/3 w-[350px] h-[350px] rounded-full bg-gold/[0.02] blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/[0.08] border border-gold/15 text-gold/70 text-xs font-medium mb-5 tracking-[0.2em] uppercase">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            <span>Organizador de Fiesta</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-display font-bold tracking-tight text-glow">
            <span className="bg-gradient-to-r from-gold-light via-gold to-gold-dark bg-clip-text text-transparent animate-shimmer">
              Lista de Invitados
            </span>
          </h1>
          <p className="mt-4 text-foreground/30 text-base max-w-md mx-auto tracking-wide">
            Registra y controla los invitados a tu cumpleanos
          </p>
          <div className="mt-4 w-24 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent mx-auto" />
        </header>

        {/* Settings */}
        <section className="mb-8">
          <SettingsPanel />
        </section>

        {/* Stats */}
        <section className="mb-10">
          <StatsBar guests={guests} />
        </section>

        {/* Main content */}
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="sticky top-8 p-6 rounded-2xl bg-surface border border-border glow-gold">
              <h2 className="text-sm font-medium text-foreground/50 mb-5 flex items-center gap-3 tracking-wide">
                <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
                Nuevo Invitado
              </h2>
              <GuestForm onGuestAdded={fetchGuests} />
            </div>
          </div>

          {/* Guest list */}
          <div className="lg:col-span-3">
            <div className="p-6 rounded-2xl bg-surface border border-border glow-gold">
              <h2 className="text-sm font-medium text-foreground/50 mb-5 flex items-center gap-3 tracking-wide">
                <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                </div>
                Invitados
                {guests.length > 0 && (
                  <span className="text-foreground/20 font-normal">
                    ({guests.length})
                  </span>
                )}
              </h2>

              {loading ? (
                <div className="text-center py-16">
                  <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin mx-auto" />
                  <p className="text-foreground/20 mt-4 text-sm">Cargando...</p>
                </div>
              ) : (
                <GuestList
                  guests={guests}
                  onDelete={handleDelete}
                  onToggleConfirm={handleToggleConfirm}
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 text-xs text-foreground/15 tracking-widest uppercase">
          Hecho con amor por Javiera
        </footer>
      </div>
    </div>
  );
}
