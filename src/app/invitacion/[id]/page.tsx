"use client";

import { useState, useEffect, use, useCallback } from "react";
import type { Guest } from "@/types/guest";
import type { PartySettings } from "@/types/settings";
import Confetti from "@/components/Confetti";
import MusicPlayer from "@/components/MusicPlayer";
import Sparkles from "@/components/Sparkles";

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

function AnimatedSection({
  children,
  delay,
  show,
}: {
  children: React.ReactNode;
  delay: number;
  show: boolean;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(timer);
    }
  }, [show, delay]);

  return (
    <div
      className={`transition-all duration-700 ease-out ${
        visible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-6 scale-[0.97]"
      }`}
    >
      {children}
    </div>
  );
}

function Countdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    function calculate() {
      const target = new Date(targetDate + "T00:00:00").getTime();
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setExpired(true);
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (expired) {
    return (
      <div className="p-4 rounded-2xl bg-gold/[0.06] border border-gold/15 text-center">
        <p className="text-gold font-display font-bold text-lg">La fiesta es hoy!</p>
      </div>
    );
  }

  const units = [
    { value: timeLeft.days, label: "Dias" },
    { value: timeLeft.hours, label: "Horas" },
    { value: timeLeft.minutes, label: "Min" },
    { value: timeLeft.seconds, label: "Seg" },
  ];

  return (
    <div className="p-5 rounded-2xl bg-gold/[0.04] border border-gold/10">
      <p className="text-xs font-medium text-gold/50 uppercase tracking-[0.2em] mb-3">
        Cuenta regresiva
      </p>
      <div className="grid grid-cols-4 gap-3">
        {units.map((unit) => (
          <div key={unit.label} className="text-center">
            <div className="text-3xl sm:text-4xl font-display font-bold text-gold text-glow tabular-nums">
              {String(unit.value).padStart(2, "0")}
            </div>
            <div className="text-[10px] text-foreground/30 uppercase tracking-[0.15em] mt-1">
              {unit.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
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
  const [justDeclined, setJustDeclined] = useState(false);

  // Intro screen states
  const [showIntro, setShowIntro] = useState(true);
  const [introFading, setIntroFading] = useState(false);
  const [showContent, setShowContent] = useState(false);

  // Dietary multi-select
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);

  // Plus one
  const [plusOne, setPlusOne] = useState(false);
  const [plusOneName, setPlusOneName] = useState("");

  // Decline
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [declining, setDeclining] = useState(false);

  useEffect(() => {
    fetch(`/api/guests/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setGuest(data.guest);
        setSettings(data.settings);
        if (data.guest.dietary) {
          setSelectedDietary(data.guest.dietary.split(", ").filter(Boolean));
        }
        if (data.guest.plus_one) {
          setPlusOne(true);
          setPlusOneName(data.guest.plus_one_name || "");
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  function toggleDietary(option: string) {
    setSelectedDietary((prev) =>
      prev.includes(option)
        ? prev.filter((d) => d !== option)
        : [...prev, option]
    );
  }

  const handleEnter = useCallback(() => {
    const startMusic = (window as unknown as Record<string, () => void>).__startMusic;
    if (startMusic) startMusic();

    setIntroFading(true);
    setTimeout(() => {
      setShowIntro(false);
      setTimeout(() => setShowContent(true), 100);
    }, 800);
  }, []);

  const handleMusicReady = useCallback(() => {}, []);

  async function handleConfirm() {
    setConfirming(true);
    const dietaryStr = selectedDietary.join(", ");
    try {
      const res = await fetch(`/api/guests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dietary: dietaryStr, action: "confirm", plus_one: plusOne, plus_one_name: plusOne ? plusOneName : "" }),
      });
      if (res.ok) {
        setGuest((prev) => (prev ? { ...prev, confirmed: true, declined: false, dietary: dietaryStr, plus_one: plusOne, plus_one_name: plusOne ? plusOneName : "" } : prev));
        setJustConfirmed(true);
      }
    } catch (err) {
      console.error("Error confirmando:", err);
    } finally {
      setConfirming(false);
    }
  }

  async function handleDecline() {
    setDeclining(true);
    try {
      const res = await fetch(`/api/guests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "decline", decline_reason: declineReason }),
      });
      if (res.ok) {
        setGuest((prev) => (prev ? { ...prev, declined: true, confirmed: false, decline_reason: declineReason } : prev));
        setJustDeclined(true);
        setShowDeclineForm(false);
      }
    } catch (err) {
      console.error("Error declinando:", err);
    } finally {
      setDeclining(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !guest || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center p-10 rounded-3xl bg-surface border border-border glow-gold max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-accent/10 border border-rose-accent/20 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-rose-accent">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h1 className="text-xl font-display font-bold text-foreground mb-2">
            Invitacion no encontrada
          </h1>
          <p className="text-foreground/40 text-sm">
            Este enlace no es valido o ya fue eliminado.
          </p>
        </div>
      </div>
    );
  }

  const alreadyConfirmed = guest.confirmed && !justConfirmed;
  const alreadyDeclined = guest.declined && !justDeclined;

  return (
    <div className="min-h-screen bg-background relative noise-overlay">
      <MusicPlayer onReady={handleMusicReady} />

      {/* ===== INTRO SCREEN ===== */}
      {showIntro && (
        <div
          className={`fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center px-6
                      transition-opacity duration-700 ${introFading ? "opacity-0" : "opacity-100"}`}
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-gold/30"
                style={{
                  left: `${10 + i * 12}%`,
                  top: `${20 + (i % 3) * 25}%`,
                  animation: `sparkle ${2 + i * 0.4}s ease-in-out infinite`,
                  animationDelay: `${i * 0.3}s`,
                }}
              />
            ))}
          </div>

          <div className="absolute w-[400px] h-[400px] rounded-full bg-gold/[0.04] blur-[120px]" />

          <div className="relative text-center animate-[fadeInUp_1s_ease-out]">
            <div className="flex justify-center gap-3 mb-6">
              {[0, 1, 2].map((i) => (
                <svg
                  key={i}
                  width="14" height="14" viewBox="0 0 24 24" fill="currentColor"
                  className="text-gold/50 animate-sparkle"
                  style={{ animationDelay: `${i * 0.6}s` }}
                >
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              ))}
            </div>

            <p className="text-xs font-medium text-gold/40 uppercase tracking-[0.3em] mb-4">
              Tienes una invitacion de
            </p>

            <h1 className="text-5xl sm:text-7xl font-display font-bold text-gold text-glow mb-3 animate-shimmer bg-gradient-to-r from-gold-light via-gold to-gold-dark bg-clip-text text-transparent bg-[length:200%_auto]">
              {settings.birthday_person || "???"}
            </h1>

            <div className="w-20 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent mx-auto mb-8" />

            <button
              onClick={handleEnter}
              className="group relative px-10 py-4 rounded-2xl font-semibold text-background text-base tracking-wide
                         bg-gradient-to-r from-gold-dark via-gold to-gold-light
                         hover:shadow-[0_0_50px_rgba(212,168,83,0.4)]
                         active:scale-[0.97]
                         transition-all duration-300
                         animate-[fadeInUp_1.2s_ease-out_0.5s_both]"
            >
              <span className="relative z-10">Abrir Invitacion</span>
            </button>

            <p className="text-foreground/20 text-xs mt-6 tracking-wider animate-[fadeInUp_1.2s_ease-out_0.8s_both]">
              Toca para ver los detalles
            </p>
          </div>
        </div>
      )}

      {/* ===== MAIN CONTENT ===== */}
      {!showIntro && (
        <>
          <Sparkles />
          {(justConfirmed || alreadyConfirmed) && <Confetti />}

          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gold/[0.04] blur-[150px] animate-[floatGlow_8s_ease-in-out_infinite]" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-rose-accent/[0.03] blur-[120px] animate-[floatGlow_10s_ease-in-out_infinite_reverse]" />
            <div className="absolute top-1/3 right-0 w-[300px] h-[300px] rounded-full bg-gold/[0.03] blur-[100px] animate-[floatGlow_12s_ease-in-out_infinite]" />
          </div>

          <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-lg">
              <AnimatedSection show={showContent} delay={0}>
                <div className="p-10 sm:p-12 rounded-3xl bg-surface border border-border glow-gold-strong text-center animate-border-glow">

                  <AnimatedSection show={showContent} delay={300}>
                    <div className="flex justify-center gap-2 mb-4">
                      {[0, 1, 2].map((i) => (
                        <svg
                          key={i}
                          width="12" height="12" viewBox="0 0 24 24" fill="currentColor"
                          className="text-gold/40 animate-sparkle"
                          style={{ animationDelay: `${i * 0.5}s` }}
                        >
                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                        </svg>
                      ))}
                    </div>
                  </AnimatedSection>

                  <AnimatedSection show={showContent} delay={500}>
                    <p className="text-xs font-medium text-gold/50 uppercase tracking-[0.3em] mb-3">
                      Estas invitado/a al cumple de
                    </p>
                  </AnimatedSection>

                  <AnimatedSection show={showContent} delay={700}>
                    <h1 className="text-5xl sm:text-6xl font-display font-bold text-gold text-glow mb-2 animate-shimmer bg-gradient-to-r from-gold-light via-gold to-gold-dark bg-clip-text text-transparent bg-[length:200%_auto]">
                      {settings.birthday_person || "???"}
                    </h1>
                    <div className="w-16 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent mx-auto mb-8" />
                  </AnimatedSection>

                  {/* Personalized greeting */}
                  <AnimatedSection show={showContent} delay={1000}>
                    <div className="mb-8 p-5 rounded-2xl bg-gold/[0.04] border border-gold/10">
                      <p className="text-lg text-foreground/80 font-display">
                        Hola <span className="font-bold text-gold">{guest.name}</span>
                      </p>
                      <p className="text-foreground/30 text-sm mt-1 tracking-wide">
                        Te esperamos para celebrar juntos
                      </p>
                    </div>
                  </AnimatedSection>

                  {/* Countdown */}
                  {settings.party_date && (
                    <AnimatedSection show={showContent} delay={1200}>
                      <div className="mb-8">
                        <Countdown targetDate={settings.party_date} />
                      </div>
                    </AnimatedSection>
                  )}

                  {/* Party details */}
                  <AnimatedSection show={showContent} delay={1400}>
                    <div className="space-y-3 mb-8">
                      {settings.party_date && (
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-border">
                          <div className="w-10 h-10 rounded-lg bg-gold/[0.08] border border-gold/15 flex items-center justify-center shrink-0">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                              <line x1="16" y1="2" x2="16" y2="6" />
                              <line x1="8" y1="2" x2="8" y2="6" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-medium text-foreground/30 uppercase tracking-[0.15em]">Fecha</p>
                            <p className="font-medium text-foreground/80 text-sm">{formatDate(settings.party_date)}</p>
                          </div>
                        </div>
                      )}

                      {settings.party_time && (
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-border">
                          <div className="w-10 h-10 rounded-lg bg-gold/[0.08] border border-gold/15 flex items-center justify-center shrink-0">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-medium text-foreground/30 uppercase tracking-[0.15em]">Hora</p>
                            <p className="font-medium text-foreground/80 text-sm">{formatTime(settings.party_time)}</p>
                          </div>
                        </div>
                      )}

                      {settings.party_location && (
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-border">
                          <div className="w-10 h-10 rounded-lg bg-gold/[0.08] border border-gold/15 flex items-center justify-center shrink-0">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-medium text-foreground/30 uppercase tracking-[0.15em]">Lugar</p>
                            <p className="font-medium text-foreground/80 text-sm">{settings.party_location}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </AnimatedSection>

                  {/* Google Maps link */}
                  {settings.party_map_url && (
                    <AnimatedSection show={showContent} delay={1500}>
                      <div className="mb-8 flex justify-center">
                        <a
                          href={settings.party_map_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full
                                     border border-gold/40 text-gold text-sm font-medium
                                     bg-gold/[0.06] hover:bg-gold/[0.12] hover:border-gold/60
                                     hover:shadow-[0_0_20px_rgba(212,168,83,0.15)]
                                     transition-all duration-300"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          Ver en Google Maps
                        </a>
                      </div>
                    </AnimatedSection>
                  )}

                  {/* Custom message */}
                  {settings.party_message && (
                    <AnimatedSection show={showContent} delay={1700}>
                      <div className="mb-6 p-5 rounded-2xl bg-rose-accent/[0.04] border border-rose-accent/10">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-rose-accent/60 mx-auto mb-2">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        <p className="text-foreground/60 text-sm whitespace-pre-line leading-relaxed">
                          {settings.party_message}
                        </p>
                      </div>
                    </AnimatedSection>
                  )}

                  {/* Safety message */}
                  {settings.party_safety_message && (
                    <AnimatedSection show={showContent} delay={1900}>
                      <div className="mb-8 p-5 rounded-2xl bg-amber-500/[0.06] border border-amber-500/15">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-400">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                          </svg>
                          <span className="text-xs font-bold text-amber-400 uppercase tracking-[0.2em]">
                            Importante
                          </span>
                        </div>
                        <p className="text-foreground/60 text-sm whitespace-pre-line leading-relaxed font-medium">
                          {settings.party_safety_message}
                        </p>
                      </div>
                    </AnimatedSection>
                  )}

                  {/* Confirm / Decline / Status */}
                  <AnimatedSection show={showContent} delay={2100}>
                    {guest.confirmed ? (
                      <div className="p-6 rounded-2xl bg-emerald-accent/[0.06] border border-emerald-accent/15">
                        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-emerald-accent/10 border border-emerald-accent/20 flex items-center justify-center">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-accent">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <p className="font-display font-bold text-emerald-accent text-lg">
                          {justConfirmed ? "Asistencia confirmada!" : "Ya confirmaste tu asistencia"}
                        </p>
                        <p className="text-emerald-accent/50 text-sm mt-1">
                          {justConfirmed ? "Gracias! Te esperamos" : "Nos vemos en la fiesta!"}
                        </p>
                        {guest.plus_one && guest.plus_one_name && (
                          <p className="text-emerald-accent/50 text-sm mt-2">
                            Vienes con {guest.plus_one_name}
                          </p>
                        )}
                        {guest.dietary && (
                          <p className="text-emerald-accent/40 text-xs mt-3">
                            Restricciones: {guest.dietary}
                          </p>
                        )}
                      </div>
                    ) : guest.declined ? (
                      <div className="p-6 rounded-2xl bg-rose-accent/[0.06] border border-rose-accent/15">
                        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-rose-accent/10 border border-rose-accent/20 flex items-center justify-center">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-rose-accent">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </div>
                        <p className="font-display font-bold text-rose-accent text-lg">
                          {justDeclined ? "Respuesta registrada" : "No asisitras a la fiesta"}
                        </p>
                        <p className="text-rose-accent/50 text-sm mt-1">
                          {justDeclined ? "Gracias por avisarnos" : "Esperamos verte en otra ocasion"}
                        </p>
                        {guest.decline_reason && (
                          <p className="text-rose-accent/40 text-xs mt-3">
                            Motivo: {guest.decline_reason}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {/* Dietary selection */}
                        <div>
                          <label className="block text-xs font-medium text-foreground/40 mb-3 tracking-wide uppercase text-left">
                            Tienes alguna restriccion alimentaria?
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {DIETARY_OPTIONS.map((option) => {
                              const isSelected = selectedDietary.includes(option);
                              return (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => toggleDietary(option)}
                                  className={`px-3 py-2.5 rounded-xl text-xs font-medium text-left
                                             transition-all duration-200 border
                                             ${isSelected
                                               ? "bg-gold/15 border-gold/40 text-gold"
                                               : "bg-white/[0.02] border-border text-foreground/40 hover:border-border-hover hover:text-foreground/60"
                                             }`}
                                >
                                  <span className="flex items-center gap-2">
                                    <span className={`w-4 h-4 rounded flex items-center justify-center border transition-all
                                                      ${isSelected ? "bg-gold/20 border-gold/50" : "border-foreground/20"}`}>
                                      {isSelected && (
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-gold">
                                          <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                      )}
                                    </span>
                                    {option}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                          {selectedDietary.length > 0 && (
                            <p className="text-xs text-gold/50 mt-2 text-left">
                              Seleccionado: {selectedDietary.join(", ")}
                            </p>
                          )}
                        </div>

                        {/* Plus one companion */}
                        <div>
                          <button
                            type="button"
                            onClick={() => { setPlusOne(!plusOne); if (plusOne) setPlusOneName(""); }}
                            className="flex items-center gap-3 w-full text-left"
                          >
                            <span className={`relative w-11 h-6 rounded-full border transition-all duration-300 shrink-0
                                              ${plusOne
                                                ? "bg-gold/20 border-gold/50"
                                                : "bg-white/[0.04] border-border"
                                              }`}>
                              <span className={`absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300
                                                ${plusOne
                                                  ? "left-[22px] bg-gold shadow-[0_0_8px_rgba(212,168,83,0.4)]"
                                                  : "left-0.5 bg-foreground/30"
                                                }`} />
                            </span>
                            <span className="text-sm text-foreground/50">Vienes con acompanante?</span>
                          </button>
                          {plusOne && (
                            <input
                              type="text"
                              value={plusOneName}
                              onChange={(e) => setPlusOneName(e.target.value)}
                              placeholder="Nombre del acompanante"
                              className="mt-3 w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-border
                                         text-foreground text-sm placeholder:text-foreground/20
                                         focus:outline-none focus:border-gold/30
                                         transition-all duration-300"
                            />
                          )}
                        </div>

                        {/* Confirm button */}
                        <button
                          onClick={handleConfirm}
                          disabled={confirming}
                          className="w-full py-4 rounded-2xl font-semibold text-background text-base tracking-wide
                                     bg-gradient-to-r from-gold-dark via-gold to-gold-light
                                     hover:shadow-[0_0_40px_rgba(212,168,83,0.35)]
                                     active:scale-[0.98] disabled:opacity-50
                                     transition-all duration-300"
                        >
                          {confirming ? "Confirmando..." : "Confirmar Asistencia"}
                        </button>

                        {/* Decline section */}
                        {!showDeclineForm ? (
                          <button
                            onClick={() => setShowDeclineForm(true)}
                            className="w-full py-3 rounded-xl text-sm text-foreground/30
                                       hover:text-rose-accent/70 hover:bg-rose-accent/[0.04]
                                       border border-transparent hover:border-rose-accent/15
                                       transition-all duration-300"
                          >
                            No puedo asistir
                          </button>
                        ) : (
                          <div className="p-4 rounded-2xl bg-rose-accent/[0.04] border border-rose-accent/15 space-y-3">
                            <p className="text-sm text-foreground/50 text-left">
                              Lamentamos que no puedas venir. Quieres dejar un motivo?
                            </p>
                            <textarea
                              value={declineReason}
                              onChange={(e) => setDeclineReason(e.target.value)}
                              placeholder="Ej: Tengo otro compromiso ese dia (opcional)"
                              rows={2}
                              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-border
                                         text-foreground text-sm placeholder:text-foreground/20
                                         focus:outline-none focus:border-rose-accent/30
                                         transition-all duration-300 resize-none"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={handleDecline}
                                disabled={declining}
                                className="flex-1 py-2.5 rounded-xl text-sm font-medium
                                           bg-rose-accent/15 text-rose-accent border border-rose-accent/25
                                           hover:bg-rose-accent/25 disabled:opacity-50
                                           transition-all duration-300"
                              >
                                {declining ? "Enviando..." : "Confirmar que no asistire"}
                              </button>
                              <button
                                onClick={() => setShowDeclineForm(false)}
                                className="px-4 py-2.5 rounded-xl text-sm text-foreground/30
                                           hover:text-foreground/50 border border-border
                                           transition-all duration-300"
                              >
                                Volver
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </AnimatedSection>

                  {/* Link to playlist */}
                  <AnimatedSection show={showContent} delay={2300}>
                    <div className="mt-8 flex justify-center">
                      <a
                        href="/playlist"
                        className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl
                                   border border-gold/30 text-gold text-sm font-medium
                                   bg-gold/[0.04] hover:bg-gold/[0.10] hover:border-gold/50
                                   hover:shadow-[0_0_15px_rgba(212,168,83,0.1)]
                                   transition-all duration-300"
                      >
                        <span>🎵</span>
                        Sugerir Canciones para la Fiesta
                      </a>
                    </div>
                  </AnimatedSection>
                </div>
              </AnimatedSection>

              <AnimatedSection show={showContent} delay={2600}>
                <div className="flex justify-center gap-1 mt-8">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="w-1 h-1 rounded-full bg-gold/20" />
                  ))}
                </div>
              </AnimatedSection>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
