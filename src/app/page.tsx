"use client";

import { useState, useEffect, useCallback } from "react";
import type { Guest } from "@/types/guest";
import GuestForm from "@/components/GuestForm";
import GuestList from "@/components/GuestList";
import StatsBar from "@/components/StatsBar";

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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-orange-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-rose-200/30 blur-3xl" />
        <div className="absolute top-1/3 -left-48 w-80 h-80 rounded-full bg-amber-200/30 blur-3xl" />
        <div className="absolute -bottom-32 right-1/4 w-72 h-72 rounded-full bg-orange-200/20 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100/80 text-rose-600 text-sm font-medium mb-4 backdrop-blur-sm">
            <span>🎂</span>
            <span>Organizador de Fiesta</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-rose-600 via-amber-600 to-orange-500 bg-clip-text text-transparent">
              Lista de Invitados
            </span>
          </h1>
          <p className="mt-3 text-amber-700/80 text-lg max-w-md mx-auto">
            Registra y controla los invitados a tu cumpleanos
          </p>
        </header>

        {/* Stats */}
        <section className="mb-8">
          <StatsBar guests={guests} />
        </section>

        {/* Main content */}
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form - sidebar */}
          <div className="lg:col-span-2">
            <div className="sticky top-8 p-6 rounded-3xl bg-white/50 backdrop-blur-md border border-amber-100 shadow-xl shadow-amber-100/20">
              <h2 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-amber-400 flex items-center justify-center text-white text-sm">
                  +
                </span>
                Nuevo Invitado
              </h2>
              <GuestForm onGuestAdded={fetchGuests} />
            </div>
          </div>

          {/* Guest list */}
          <div className="lg:col-span-3">
            <div className="p-6 rounded-3xl bg-white/50 backdrop-blur-md border border-amber-100 shadow-xl shadow-amber-100/20">
              <h2 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-white text-sm">
                  📋
                </span>
                Invitados
                {guests.length > 0 && (
                  <span className="text-sm font-normal text-amber-500">
                    ({guests.length})
                  </span>
                )}
              </h2>

              {loading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-3 border-amber-200 border-t-rose-500 rounded-full animate-spin mx-auto" />
                  <p className="text-amber-600 mt-3 text-sm">Cargando...</p>
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
        <footer className="text-center mt-12 text-sm text-amber-400">
          Hecho con ❤️ por Javiera
        </footer>
      </div>
    </div>
  );
}
