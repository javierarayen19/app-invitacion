"use client";

import type { Guest } from "@/types/guest";

interface StatsBarProps {
  guests: Guest[];
}

export default function StatsBar({ guests }: StatsBarProps) {
  const totalGuests = guests.length;
  const totalPeople = guests.reduce((sum, g) => sum + 1 + g.companions, 0);
  const confirmed = guests.filter((g) => g.confirmed).length;
  const confirmedPeople = guests
    .filter((g) => g.confirmed)
    .reduce((sum, g) => sum + 1 + g.companions, 0);

  const stats = [
    {
      label: "Invitados",
      value: totalGuests,
      color: "from-amber-400 to-orange-400",
      icon: "📋",
    },
    {
      label: "Total personas",
      value: totalPeople,
      color: "from-rose-400 to-pink-400",
      icon: "👥",
    },
    {
      label: "Confirmados",
      value: confirmed,
      color: "from-emerald-400 to-teal-400",
      icon: "✅",
    },
    {
      label: "Personas confirm.",
      value: confirmedPeople,
      color: "from-violet-400 to-purple-400",
      icon: "🎉",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
