"use client";

import type { Guest } from "@/types/guest";

interface StatsBarProps {
  guests: Guest[];
}

export default function StatsBar({ guests }: StatsBarProps) {
  const totalGuests = guests.length;
  const confirmed = guests.filter((g) => g.confirmed).length;
  const declined = guests.filter((g) => g.declined).length;
  const pending = totalGuests - confirmed - declined;

  const stats = [
    {
      label: "Invitados",
      value: totalGuests,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: "Confirmados",
      value: confirmed,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
    },
    {
      label: "Pendientes",
      value: pending,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
  ];

  const allStats = [
    ...stats,
    {
      label: "No asistiran",
      value: declined,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e85d75" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {allStats.map((stat) => (
        <div
          key={stat.label}
          className="relative p-5 rounded-2xl bg-surface border border-border
                     hover:border-border-hover hover:bg-surface-hover
                     transition-all duration-300 group glow-gold"
        >
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-gold/70 group-hover:text-gold transition-colors">
              {stat.icon}
            </span>
            <span className="text-xs font-medium text-foreground/40 uppercase tracking-[0.15em]">
              {stat.label}
            </span>
          </div>
          <p className="text-4xl font-display font-bold text-gold text-glow">
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
