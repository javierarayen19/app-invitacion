"use client";

import { useState, useRef, useEffect } from "react";

export default function MusicPlayer() {
  const [playing, setPlaying] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/music/post-malone-too-young.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;

    audioRef.current.play().then(() => {
      setPlaying(true);
      setShowPulse(false);
    }).catch(() => {
      // Autoplay bloqueado por el navegador — el usuario puede presionar el botón
    });

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  function toggle() {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setPlaying(!playing);
    setShowPulse(false);
  }

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
