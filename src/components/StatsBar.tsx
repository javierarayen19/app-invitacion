"use client";

import type { Guest } from "@/types/guest";

interface StatsBarProps {
  guests: Guest[];
}

export default function StatsBar({ guests }: StatsBarProps) {
  const totalGuests = guests.length;
  const confirmed = guests.filter((g) => g.confirmed).length;

  const stats = [
    {
      label: "Invitados",
      value: totalGuests,
      color: "from-amber-400 to-orange-400",
      icon: "📋",
    },
    {
      label: "Confirmados",
      value: confirmed,
      color: "from-emerald-400 to-teal-400",
      icon: "✅",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="relative overflow-hidden rounded-2xl p-4 bg-white/60 border border-amber-100"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{stat.icon}</span>
            <span className="text-xs font-medium text-amber-600 uppercase tracking-wider">
              {stat.label}
            </span>
          </div>
          <p
            className={`text-3xl font-extrabold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
          >
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
