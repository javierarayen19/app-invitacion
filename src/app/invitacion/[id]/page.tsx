"use client";

import { useState, useEffect, use } from "react";
import type { Guest } from "@/types/guest";
import type { PartySettings } from "@/types/settings";

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  const months = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];
  return `${Number(day)} de ${months[Number(month) - 1]} de ${year}`;
}

function formatTime(timeStr: string): string {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":");
  const hour = Number(h);
  return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? "PM" : "AM"}`;
}

export default function InvitacionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [guest, setGuest] = useState<Guest | null>(null);
  const [settings, setSettings] = useState<PartySettings | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [justConfirmed, setJustConfirmed] = useState(false);

  useEffect(() => {
    fetch(`/api/guests/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setGuest(data.guest);
        setSettings(data.settings);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleConfirm() {
    setConfirming(true);
    try {
      const res = await fetch(`/api/guests/${id}`, { method: "PATCH" });
      if (res.ok) {
        setGuest((prev) => (prev ? { ...prev, confirmed: true } : prev));
        setJustConfirmed(true);
      }
    } catch (err) {
      console.error("Error confirmando:", err);
    } finally {
      setConfirming(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-rose-50 to-orange-50">
        <div className="w-10 h-10 border-4 border-amber-200 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !guest || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-rose-50 to-orange-50 px-4">
        <div className="text-center p-8 rounded-3xl bg-white/60 backdrop-blur-md border border-amber-100 shadow-xl max-w-md">
          <div className="text-6xl mb-4">😢</div>
          <h1 className="text-2xl font-bold text-amber-900 mb-2">
            Invitacion no encontrada
          </h1>
          <p className="text-amber-600">
            Este enlace no es valido o ya fue eliminado.
          </p>
        </div>
      </div>
    );
  }

  const alreadyConfirmed = guest.confirmed && !justConfirmed;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-orange-50 relative overflow-hidden">
      {/* Decorative background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-rose-200/30 blur-3xl" />
        <div className="absolute top-1/2 -left-48 w-80 h-80 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute -bottom-32 right-1/4 w-72 h-72 rounded-full bg-orange-200/20 blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {/* Invitation card */}
          <div className="p-8 sm:p-10 rounded-3xl bg-white/60 backdrop-blur-md border border-amber-100 shadow-2xl shadow-rose-100/30 text-center">
            {/* Party emoji header */}
            <div className="text-5xl mb-2">🎂</div>

            <p className="text-sm font-medium text-rose-500 uppercase tracking-widest mb-2">
              Estas invitado/a al cumple de
            </p>

            <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-rose-600 via-amber-600 to-orange-500 bg-clip-text text-transparent mb-6">
              {settings.birthday_person || "???"}
            </h1>

            {/* Personalized greeting */}
            <div className="mb-8 p-4 rounded-2xl bg-amber-50/80 border border-amber-100">
              <p className="text-lg text-amber-900">
                Hola <span className="font-bold">{guest.name}</span>!
              </p>
              <p className="text-amber-700 text-sm mt-1">
                Te esperamos para celebrar juntos
              </p>
            </div>

            {/* Party details */}
            <div className="space-y-3 mb-8">
              {settings.party_date && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/70 border border-amber-50">
                  <span className="text-2xl">📅</span>
                  <div className="text-left">
                    <p className="text-xs font-medium text-amber-500 uppercase tracking-wider">
                      Fecha
                    </p>
                    <p className="font-semibold text-amber-900">
                      {formatDate(settings.party_date)}
                    </p>
                  </div>
                </div>
              )}

              {settings.party_time && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/70 border border-amber-50">
                  <span className="text-2xl">🕐</span>
                  <div className="text-left">
                    <p className="text-xs font-medium text-amber-500 uppercase tracking-wider">
                      Hora
                    </p>
                    <p className="font-semibold text-amber-900">
                      {formatTime(settings.party_time)}
                    </p>
                  </div>
                </div>
              )}

              {settings.party_location && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/70 border border-amber-50">
                  <span className="text-2xl">📍</span>
                  <div className="text-left">
                    <p className="text-xs font-medium text-amber-500 uppercase tracking-wider">
                      Lugar
                    </p>
                    <p className="font-semibold text-amber-900">
                      {settings.party_location}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Custom message */}
            {settings.party_message && (
              <div className="mb-8 p-4 rounded-2xl bg-rose-50/80 border border-rose-100">
                <p className="text-2xl mb-1">📢</p>
                <p className="text-amber-900 text-sm whitespace-pre-line">
                  {settings.party_message}
                </p>
              </div>
            )}

            {/* Confirm button or confirmed state */}
            {guest.confirmed ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="text-3xl mb-2">🎉</div>
                <p className="font-bold text-emerald-700 text-lg">
                  {justConfirmed
                    ? "Asistencia confirmada!"
                    : "Ya confirmaste tu asistencia"}
                </p>
                <p className="text-emerald-600 text-sm mt-1">
                  {justConfirmed
                    ? "Gracias! Te esperamos"
                    : "Nos vemos en la fiesta!"}
                </p>
              </div>
            ) : (
              <button
                onClick={handleConfirm}
                disabled={confirming}
                className="w-full py-4 rounded-2xl font-bold text-white text-lg
                           bg-gradient-to-r from-rose-500 to-amber-500
                           hover:from-rose-600 hover:to-amber-600
                           active:scale-[0.98] disabled:opacity-50
                           transition-all duration-200 shadow-lg shadow-rose-200/50"
              >
                {confirming ? "Confirmando..." : "Confirmar Asistencia"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
