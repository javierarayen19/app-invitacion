"use client";

import { useState, useEffect } from "react";
import type { PartySettings } from "@/types/settings";

export default function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<PartySettings>({
    notification_email: "",
    party_date: "",
    party_time: "",
    party_location: "",
    birthday_person: "",
    party_message: "",
    party_safety_message: "",
    admin_password: "",
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

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-border text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 focus:bg-white/[0.05] transition-all duration-300 text-sm";

  return (
    <div className="rounded-2xl bg-surface border border-border overflow-hidden glow-gold transition-all duration-300 hover:border-border-hover">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </div>
          <span className="font-medium text-foreground/70 text-sm tracking-wide">
            Configuracion de la Fiesta
          </span>
        </div>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`text-foreground/30 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <form onSubmit={handleSave} className="px-6 pb-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-foreground/40 mb-1.5 tracking-wide uppercase">
              Nombre del cumpleanero/a
            </label>
            <input
              type="text"
              value={settings.birthday_person}
              onChange={(e) => updateField("birthday_person", e.target.value)}
              placeholder="Ej: Javiera"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground/40 mb-1.5 tracking-wide uppercase">
              Correo de notificaciones
            </label>
            <input
              type="email"
              value={settings.notification_email}
              onChange={(e) => updateField("notification_email", e.target.value)}
              placeholder="Ej: javiera@gmail.com"
              className={inputClass}
            />
            <p className="text-xs text-foreground/20 mt-1">
              Recibiras un correo cada vez que alguien confirme asistencia
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground/40 mb-1.5 tracking-wide uppercase">
                Fecha
              </label>
              <input
                type="date"
                value={settings.party_date}
                onChange={(e) => updateField("party_date", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground/40 mb-1.5 tracking-wide uppercase">
                Hora
              </label>
              <input
                type="time"
                value={settings.party_time}
                onChange={(e) => updateField("party_time", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground/40 mb-1.5 tracking-wide uppercase">
              Lugar
            </label>
            <input
              type="text"
              value={settings.party_location}
              onChange={(e) => updateField("party_location", e.target.value)}
              placeholder="Ej: Mi Casa, Calle Los Aromos 123"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground/40 mb-1.5 tracking-wide uppercase">
              Mensaje para los invitados
            </label>
            <textarea
              value={settings.party_message}
              onChange={(e) => updateField("party_message", e.target.value)}
              placeholder="Ej: Traigan lo que quieran tomar!"
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground/40 mb-1.5 tracking-wide uppercase">
              Mensaje de seguridad
            </label>
            <textarea
              value={settings.party_safety_message}
              onChange={(e) => updateField("party_safety_message", e.target.value)}
              placeholder="Ej: Prefiere venir en Uber, NO SE CONDUCE CON ALCOHOL EN EL CUERPO"
              rows={3}
              className={`${inputClass} resize-none`}
            />
            <p className="text-xs text-foreground/20 mt-1">
              Se mostrara destacado en la invitacion con icono de advertencia
            </p>
          </div>

          <div className="pt-2 border-t border-border">
            <label className="block text-xs font-medium text-foreground/40 mb-1.5 tracking-wide uppercase">
              Contraseña de admin
            </label>
            <input
              type="password"
              value={settings.admin_password}
              onChange={(e) => updateField("admin_password", e.target.value)}
              placeholder="Establece una contraseña para proteger el panel"
              className={inputClass}
            />
            <p className="text-xs text-foreground/20 mt-1">
              Se pedira al ingresar al panel de administracion
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-sm tracking-wide
                       transition-all duration-300
                       ${
                         saved
                           ? "bg-emerald-accent/20 text-emerald-accent border border-emerald-accent/30"
                           : "bg-gold/15 text-gold border border-gold/25 hover:bg-gold/25 hover:border-gold/40"
                       }
                       active:scale-[0.98] disabled:opacity-50`}
          >
            {saved ? "Guardado" : loading ? "Guardando..." : "Guardar Configuracion"}
          </button>
        </form>
      )}
    </div>
  );
}
