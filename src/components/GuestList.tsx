"use client";

import { useState } from "react";
import type { Guest } from "@/types/guest";

interface GuestListProps {
  guests: Guest[];
  onDelete: (id: string) => void;
  onToggleConfirm: (id: string, confirmed: boolean) => void;
}

export default function GuestList({
  guests,
  onDelete,
  onToggleConfirm,
}: GuestListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function handleCopyLink(guestId: string) {
    const url = `${window.location.origin}/invitacion/${guestId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(guestId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  if (guests.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎈</div>
        <p className="text-amber-700 text-lg font-medium">
          Aun no hay invitados
        </p>
        <p className="text-amber-500 text-sm mt-1">
          Agrega el primero usando el formulario
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {guests.map((guest, index) => (
        <div
          key={guest.id}
          className="group flex items-center gap-4 p-4 rounded-2xl bg-white/60
                     border border-amber-100 hover:border-rose-200
                     hover:shadow-md hover:shadow-rose-100/30
                     transition-all duration-200"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <button
            onClick={() => onToggleConfirm(guest.id, !guest.confirmed)}
            className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg
                        transition-all duration-200 ${
                          guest.confirmed
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-amber-100 text-amber-500"
                        }`}
            title={
              guest.confirmed
                ? "Click para marcar pendiente"
                : "Click para confirmar"
            }
          >
            {guest.confirmed ? "✓" : "?"}
          </button>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-amber-950 truncate">
              {guest.name}
            </p>
            <p className="text-xs">
              <span
                className={
                  guest.confirmed ? "text-emerald-600" : "text-amber-500"
                }
              >
                {guest.confirmed ? "Confirmado" : "Pendiente"}
              </span>
            </p>
          </div>

          <button
            onClick={() => handleCopyLink(guest.id)}
            className={`shrink-0 h-8 px-3 rounded-full flex items-center justify-center gap-1.5
                       text-xs font-medium transition-all duration-200
                       ${
                         copiedId === guest.id
                           ? "bg-emerald-100 text-emerald-600"
                           : "bg-amber-50 text-amber-600 hover:bg-amber-100 opacity-0 group-hover:opacity-100"
                       }`}
            title="Copiar enlace de invitacion"
          >
            {copiedId === guest.id ? (
              <>
                <span>✓</span>
                <span>Copiado</span>
              </>
            ) : (
              <>
                <span>🔗</span>
                <span>Copiar</span>
              </>
            )}
          </button>

          <button
            onClick={() => onDelete(guest.id)}
            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                       text-amber-300 hover:text-rose-500 hover:bg-rose-50
                       opacity-0 group-hover:opacity-100 transition-all duration-200"
            title="Eliminar invitado"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
