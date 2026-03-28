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

    function fallbackCopy() {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedId(guestId);
      setTimeout(() => setCopiedId(null), 2000);
    }

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedId(guestId);
        setTimeout(() => setCopiedId(null), 2000);
      }).catch(() => {
        fallbackCopy();
      });
    } else {
      fallbackCopy();
    }
  }

  if (guests.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/5 border border-gold/10 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold/30">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
        </div>
        <p className="text-foreground/40 text-sm font-medium">
          Aun no hay invitados
        </p>
        <p className="text-foreground/20 text-xs mt-1">
          Agrega el primero usando el formulario
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {guests.map((guest) => (
        <div
          key={guest.id}
          className="group flex items-center gap-4 p-4 rounded-xl
                     bg-white/[0.02] border border-transparent
                     hover:bg-white/[0.05] hover:border-border
                     transition-all duration-300"
        >
          <button
            onClick={() => onToggleConfirm(guest.id, !guest.confirmed)}
            className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                        transition-all duration-300 border ${
                          guest.confirmed
                            ? "bg-emerald-accent/10 border-emerald-accent/30 text-emerald-accent"
                            : "bg-white/[0.03] border-border text-foreground/30"
                        }`}
            title={
              guest.confirmed
                ? "Click para marcar pendiente"
                : "Click para confirmar"
            }
          >
            {guest.confirmed ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            )}
          </button>

          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground/90 truncate text-sm">
              {guest.name}
            </p>
            <p className="text-xs mt-0.5 flex items-center gap-2 flex-wrap">
              <span
                className={
                  guest.declined
                    ? "text-rose-accent/70"
                    : guest.confirmed
                    ? "text-emerald-accent/70"
                    : "text-gold/50"
                }
              >
                {guest.declined ? "No asistira" : guest.confirmed ? "Confirmado" : "Pendiente"}
              </span>
              {guest.dietary && (
                <span className="text-rose-accent/60 bg-rose-accent/10 px-2 py-0.5 rounded-full text-[10px] font-medium">
                  {guest.dietary}
                </span>
              )}
              {guest.declined && guest.decline_reason && (
                <span className="text-foreground/30 text-[10px]">
                  — {guest.decline_reason}
                </span>
              )}
            </p>
          </div>

          <button
            onClick={() => handleCopyLink(guest.id)}
            className={`shrink-0 h-8 px-3 rounded-lg flex items-center justify-center gap-1.5
                       text-xs font-medium transition-all duration-300
                       ${
                         copiedId === guest.id
                           ? "bg-emerald-accent/15 text-emerald-accent border border-emerald-accent/30"
                           : "bg-white/[0.03] text-foreground/30 border border-transparent hover:border-border hover:text-gold/70 opacity-0 group-hover:opacity-100"
                       }`}
            title="Copiar enlace de invitacion"
          >
            {copiedId === guest.id ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Copiado</span>
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                <span>Copiar</span>
              </>
            )}
          </button>

          <button
            onClick={() => onDelete(guest.id)}
            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                       text-foreground/15 hover:text-rose-accent hover:bg-rose-accent/10
                       border border-transparent hover:border-rose-accent/20
                       opacity-0 group-hover:opacity-100 transition-all duration-300"
            title="Eliminar invitado"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
