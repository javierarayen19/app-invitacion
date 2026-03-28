"use client";

import { useEffect, useState } from "react";

interface Particle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  shape: "circle" | "square" | "star";
}

const COLORS = ["#d4a853", "#f0d890", "#e85d75", "#34d399", "#a78bfa", "#f472b6", "#fbbf24"];

export default function Confetti({ active = true }: { active?: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) return;
    const p: Particle[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 4 + Math.random() * 8,
      shape: (["circle", "square", "star"] as const)[Math.floor(Math.random() * 3)],
    }));
    setParticles(p);
  }, [active]);

  if (!active || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.left}%`,
            top: "-2%",
            width: p.size,
            height: p.shape === "star" ? p.size : p.size * (p.shape === "square" ? 1 : 1),
            backgroundColor: p.shape !== "star" ? p.color : "transparent",
            borderRadius: p.shape === "circle" ? "50%" : p.shape === "square" ? "2px" : "0",
            borderLeft: p.shape === "star" ? `${p.size / 2}px solid transparent` : undefined,
            borderRight: p.shape === "star" ? `${p.size / 2}px solid transparent` : undefined,
            borderBottom: p.shape === "star" ? `${p.size}px solid ${p.color}` : undefined,
            animation: `confettiFall ${p.duration}s linear ${p.delay}s infinite`,
            opacity: 0.8,
          }}
        />
      ))}
    </div>
  );
}
