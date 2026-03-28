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

  // Intro screen states
  const [showIntro, setShowIntro] = useState(true);
  const [introFading, setIntroFading] = useState(false);
  const [showContent, setShowContent] = useState(false);

  // Dietary multi-select
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);

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
    // Trigger music
    const startMusic = (window as unknown as Record<string, () => void>).__startMusic;
    if (startMusic) startMusic();

    // Fade out intro
    setIntroFading(true);
    setTimeout(() => {
      setShowIntro(false);
      setTimeout(() => setShowContent(true), 100);
    }, 800);
  }, []);

  const handleMusicReady = useCallback(() => {
    // Music started or failed gracefully — content reveal is already handled by handleEnter
  }, []);

  async function handleConfirm() {
    setConfirming(true);
    const dietaryStr = selectedDietary.join(", ");
    try {
      const res = await fetch(`/api/guests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dietary: dietaryStr }),
      });
      if (res.ok) {
        setGuest((prev) => (prev ? { ...prev, confirmed: true, dietary: dietaryStr } : prev));
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

  return (
    <div className="min-h-screen bg-background relative noise-overlay">
      <MusicPlayer onReady={handleMusicReady} />

      {/* ===== INTRO SCREEN ===== */}
      {showIntro && (
        <div
          className={`fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center px-6
                      transition-opacity duration-700 ${introFading ? "opacity-0" : "opacity-100"}`}
        >
          {/* Floating particles on intro */}
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

          {/* Glow behind title */}
          <div className="absolute w-[400px] h-[400px] rounded-full bg-gold/[0.04] blur-[120px]" />

          <div className="relative text-center animate-[fadeInUp_1s_ease-out]">
            {/* Stars */}
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
              <span className="absolute inset-0 rounded-2xl border-2 border-gold/0 group-hover:border-gold/30 transition-all duration-500" />
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

          {/* Ambient glows - animated */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gold/[0.04] blur-[150px] animate-[floatGlow_8s_ease-in-out_infinite]" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-rose-accent/[0.03] blur-[120px] animate-[floatGlow_10s_ease-in-out_infinite_reverse]" />
            <div className="absolute top-1/3 right-0 w-[300px] h-[300px] rounded-full bg-gold/[0.03] blur-[100px] animate-[floatGlow_12s_ease-in-out_infinite]" />
          </div>

          <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-lg">
              {/* Invitation card */}
              <AnimatedSection show={showContent} delay={0}>
                <div className="p-10 sm:p-12 rounded-3xl bg-surface border border-border glow-gold-strong text-center animate-border-glow">

                  {/* Star decoration */}
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

                  {/* Party details */}
                  <AnimatedSection show={showContent} delay={1300}>
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
                            <p className="text-xs font-medium text-foreground/30 uppercase tracking-[0.15em]">
                              Fecha
                            </p>
                            <p className="font-medium text-foreground/80 text-sm">
                              {formatDate(settings.party_date)}
                            </p>
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
                            <p className="text-xs font-medium text-foreground/30 uppercase tracking-[0.15em]">
                              Hora
                            </p>
                            <p className="font-medium text-foreground/80 text-sm">
                              {formatTime(settings.party_time)}
                            </p>
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
                            <p className="text-xs font-medium text-foreground/30 uppercase tracking-[0.15em]">
                              Lugar
                            </p>
                            <p className="font-medium text-foreground/80 text-sm">
                              {settings.party_location}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </AnimatedSection>

                  {/* Custom message */}
                  {settings.party_message && (
                    <AnimatedSection show={showContent} delay={1600}>
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

                  {/* Safety message (Uber / no driving) */}
                  {settings.party_safety_message && (
                    <AnimatedSection show={showContent} delay={1800}>
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

                  {/* Dietary multi-select + Confirm / Confirmed */}
                  <AnimatedSection show={showContent} delay={2000}>
                    {guest.confirmed ? (
                      <div className="p-6 rounded-2xl bg-emerald-accent/[0.06] border border-emerald-accent/15">
                        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-emerald-accent/10 border border-emerald-accent/20 flex items-center justify-center">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-accent">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <p className="font-display font-bold text-emerald-accent text-lg">
                          {justConfirmed
                            ? "Asistencia confirmada!"
                            : "Ya confirmaste tu asistencia"}
                        </p>
                        <p className="text-emerald-accent/50 text-sm mt-1">
                          {justConfirmed
                            ? "Gracias! Te esperamos"
                            : "Nos vemos en la fiesta!"}
                        </p>
                        {guest.dietary && (
                          <p className="text-emerald-accent/40 text-xs mt-3">
                            Restricciones: {guest.dietary}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-5">
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
                                                      ${isSelected
                                                        ? "bg-gold/20 border-gold/50"
                                                        : "border-foreground/20"
                                                      }`}>
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
                      </div>
                    )}
                  </AnimatedSection>
                </div>
              </AnimatedSection>

              {/* Bottom decoration */}
              <AnimatedSection show={showContent} delay={2300}>
                <div className="flex justify-center gap-1 mt-8">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 h-1 rounded-full bg-gold/20"
                    />
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
