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

  function getInvitationMessage(guestId: string) {
    const guest = guests.find((g) => g.id === guestId);
    const url = `${window.location.origin}/invitacion/${guestId}`;
    return `🎉 Hola${guest ? ` ${guest.name}` : ""}! Estas invitado/a a una fiesta muy especial 🥳✨\n\nAbre tu invitacion personalizada aqui:\n${url}\n\nTe esperamos! 💛`;
  }

  function handleWhatsApp(guestId: string) {
    const message = getInvitationMessage(guestId);
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  }

  function handleCopyLink(guestId: string) {
    const message = getInvitationMessage(guestId);

    function fallbackCopy() {
      const textarea = document.createElement("textarea");
      textarea.value = message;
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
      navigator.clipboard.writeText(message).then(() => {
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
                           : "bg-white/[0.03] text-foreground/40 border border-border/50 hover:border-border hover:text-gold/70"
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
            onClick={() => handleWhatsApp(guest.id)}
            className="shrink-0 h-8 w-8 rounded-lg flex items-center justify-center
                       bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20
                       hover:bg-[#25D366]/20 hover:border-[#25D366]/40
                       transition-all duration-300"
            title="Enviar por WhatsApp"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </button>

          <button
            onClick={() => onDelete(guest.id)}
            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                       text-foreground/30 hover:text-rose-accent hover:bg-rose-accent/10
                       border border-border/50 hover:border-rose-accent/20
                       transition-all duration-300"
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
