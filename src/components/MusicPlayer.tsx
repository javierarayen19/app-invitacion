"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface MusicPlayerProps {
  onReady?: () => void;
}

export default function MusicPlayer({ onReady }: MusicPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const readyCalled = useRef(false);

  useEffect(() => {
    audioRef.current = new Audio("/music/post-malone-too-young.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const startMusic = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.play().then(() => {
      setPlaying(true);
      setShowPulse(false);
      if (!readyCalled.current && onReady) {
        readyCalled.current = true;
        onReady();
      }
    }).catch(() => {
      // Fallback: still trigger onReady even if audio blocked
      if (!readyCalled.current && onReady) {
        readyCalled.current = true;
        onReady();
      }
    });
  }, [onReady]);

  function toggle() {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setPlaying(true);
    }
    setShowPulse(false);
  }

  // Expose startMusic on the window for the intro screen to call
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__startMusic = startMusic;
    return () => {
      delete (window as unknown as Record<string, unknown>).__startMusic;
    };
  }, [startMusic]);

  return (
    <button
      onClick={toggle}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full
                 bg-gold/20 backdrop-blur-xl border border-gold/30
                 flex items-center justify-center
                 hover:bg-gold/30 hover:border-gold/50
                 transition-all duration-300 group"
      title={playing ? "Pausar musica" : "Reproducir musica"}
      aria-label={playing ? "Pausar musica" : "Reproducir musica"}
    >
      {showPulse && !playing && (
        <span className="absolute inset-0 rounded-full border-2 border-gold/40"
              style={{ animation: "pulseRing 2s ease-out infinite" }} />
      )}

      {playing ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gold">
          <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" />
          <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gold">
          <path d="M8 5v14l11-7L8 5z" fill="currentColor" />
        </svg>
      )}

      {playing && (
        <div className="absolute -top-1 -right-1 flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1 bg-gold rounded-full"
              style={{
                height: "8px",
                animation: `float ${0.5 + i * 0.2}s ease-in-out infinite`,
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      )}
    </button>
  );
}
