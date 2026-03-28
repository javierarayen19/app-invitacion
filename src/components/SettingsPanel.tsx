"use client";

import { useState, useEffect } from "react";
import type { PartySettings } from "@/types/settings";

export default function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<PartySettings>({
    organizer_whatsapp: "",
    party_date: "",
    party_time: "",
    party_location: "",
    birthday_person: "",
    party_message: "",
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch(console.error);
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error("Error guardando configuracion:", err);
    } finally {
      setLoading(false);
    }
  }

  function updateField(key: keyof PartySettings, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="rounded-3xl bg-white/50 backdrop-blur-md border border-amber-100 shadow-xl shadow-amber-100/20 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-400 flex items-center justify-center text-white text-sm">
            ⚙
          </span>
          <span className="font-bold text-amber-900">
            Configuracion de la Fiesta
          </span>
        </div>
        <span
          className={`text-amber-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <form onSubmit={handleSave} className="px-6 pb-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-amber-900 mb-1.5">
              Nombre del cumpleanero/a
            </label>
            <input
              type="text"
              value={settings.birthday_person}
              onChange={(e) => updateField("birthday_person", e.target.value)}
              placeholder="Ej: Javiera"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-amber-200 bg-white/70
                         text-amber-950 placeholder:text-amber-300
                         focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200
                         transition-all duration-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-amber-900 mb-1.5">
              WhatsApp del organizador
            </label>
            <input
              type="tel"
              value={settings.organizer_whatsapp}
              onChange={(e) =>
                updateField("organizer_whatsapp", e.target.value)
              }
              placeholder="Ej: 56912345678 (codigo pais sin +)"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-amber-200 bg-white/70
                         text-amber-950 placeholder:text-amber-300
                         focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200
                         transition-all duration-200 text-sm"
            />
            <p className="text-xs text-amber-500 mt-1">
              Numero con codigo de pais, sin + ni espacios
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-amber-900 mb-1.5">
                Fecha
              </label>
              <input
                type="date"
                value={settings.party_date}
                onChange={(e) => updateField("party_date", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-amber-200 bg-white/70
                           text-amber-950
                           focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200
                           transition-all duration-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-amber-900 mb-1.5">
                Hora
              </label>
              <input
                type="time"
                value={settings.party_time}
                onChange={(e) => updateField("party_time", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-amber-200 bg-white/70
                           text-amber-950
                           focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200
                           transition-all duration-200 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-amber-900 mb-1.5">
              Lugar
            </label>
            <input
              type="text"
              value={settings.party_location}
              onChange={(e) => updateField("party_location", e.target.value)}
              placeholder="Ej: Mi Casa, Calle Los Aromos 123"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-amber-200 bg-white/70
                         text-amber-950 placeholder:text-amber-300
                         focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200
                         transition-all duration-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-amber-900 mb-1.5">
              Mensaje para los invitados
            </label>
            <textarea
              value={settings.party_message}
              onChange={(e) => updateField("party_message", e.target.value)}
              placeholder="Ej: Traigan lo que quieran tomar!"
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-amber-200 bg-white/70
                         text-amber-950 placeholder:text-amber-300 resize-none
                         focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200
                         transition-all duration-200 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold text-white text-sm
                       transition-all duration-200 shadow-lg
                       ${
                         saved
                           ? "bg-emerald-500 shadow-emerald-200/50"
                           : "bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 shadow-violet-200/50"
                       }
                       active:scale-[0.98] disabled:opacity-50`}
          >
            {saved ? "✓ Guardado" : loading ? "Guardando..." : "Guardar Configuracion"}
          </button>
        </form>
      )}
    </div>
  );
}
