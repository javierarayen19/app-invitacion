"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { ShoppingItem } from "@/types/shopping";
import ShoppingForm from "@/components/ShoppingForm";
import ShoppingList from "@/components/ShoppingList";
import ShoppingStats from "@/components/ShoppingStats";
import Sparkles from "@/components/Sparkles";

export default function ComprasPage() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_auth");
    if (saved === "true") {
      setAuthenticated(true);
    }
    setCheckingAuth(false);
  }, []);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/shopping");
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error("Error cargando productos:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authenticated) fetchItems();
  }, [authenticated, fetchItems]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        setAuthenticated(true);
        sessionStorage.setItem("admin_auth", "true");
      } else {
        setAuthError("Contraseña incorrecta");
      }
    } catch {
      setAuthError("Error de conexion");
    }
  }

  async function handleToggleBought(id: string, bought: boolean) {
    try {
      const res = await fetch("/api/shopping", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, bought }),
      });
      if (res.ok) fetchItems();
    } catch (err) {
      console.error("Error actualizando item:", err);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/shopping?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchItems();
    } catch (err) {
      console.error("Error eliminando item:", err);
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background relative noise-overlay">
        <Sparkles />
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-64 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-gold/[0.04] blur-[120px]" />
        </div>
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-sm p-8 rounded-3xl bg-surface border border-border glow-gold text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1 className="text-2xl font-display font-bold text-gold mb-2">
              Panel de Admin
            </h1>
            <p className="text-foreground/30 text-sm mb-6">
              Ingresa la contraseña para acceder
            </p>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                required
                className="w-full px-4 py-3.5 rounded-xl bg-white/[0.03] border border-border
                           text-foreground placeholder:text-foreground/20 text-center
                           focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20
                           focus:bg-white/[0.05] transition-all duration-300"
              />
              {authError && (
                <p className="text-sm text-rose-accent bg-rose-accent/10 px-4 py-2 rounded-xl border border-rose-accent/20">
                  {authError}
                </p>
              )}
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-semibold text-background text-sm tracking-wide
                           bg-gradient-to-r from-gold-dark via-gold to-gold-light
                           hover:shadow-[0_0_30px_rgba(212,168,83,0.3)]
                           active:scale-[0.98] transition-all duration-300"
              >
                Acceder
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative noise-overlay">
      <Sparkles />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-64 -right-64 w-[500px] h-[500px] rounded-full bg-gold/[0.03] blur-[120px]" />
        <div className="absolute top-1/2 -left-64 w-[400px] h-[400px] rounded-full bg-rose-accent/[0.02] blur-[100px]" />
        <div className="absolute -bottom-64 right-1/3 w-[350px] h-[350px] rounded-full bg-gold/[0.02] blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/[0.08] border border-gold/15 text-gold/70 text-xs font-medium mb-5 tracking-[0.2em] uppercase">
            <span className="text-sm">🛒</span>
            <span>Lista de Compras</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-display font-bold tracking-tight text-glow">
            <span className="bg-gradient-to-r from-gold-light via-gold to-gold-dark bg-clip-text text-transparent animate-shimmer">
              Compras
            </span>
          </h1>
          <p className="mt-4 text-foreground/30 text-base max-w-md mx-auto tracking-wide">
            Organiza todo lo que necesitas para la fiesta
          </p>
          <div className="mt-4 w-24 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent mx-auto" />

          {/* Navigation */}
          <div className="mt-5 flex items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                         bg-white/[0.03] border border-border text-foreground/30
                         hover:text-gold hover:border-gold/20
                         text-xs font-medium transition-all duration-300"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
              Invitados
            </Link>
            <span className="px-4 py-2 rounded-xl bg-gold/10 border border-gold/20 text-gold text-xs font-medium">
              🛒 Compras
            </span>
            <button
              onClick={() => {
                sessionStorage.removeItem("admin_auth");
                setAuthenticated(false);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                         bg-white/[0.03] border border-border text-foreground/30
                         hover:text-rose-accent hover:border-rose-accent/20 hover:bg-rose-accent/5
                         text-xs font-medium transition-all duration-300"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Salir
            </button>
          </div>
        </header>

        {/* Stats */}
        <section className="mb-10">
          <ShoppingStats items={items} />
        </section>

        {/* Main content */}
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="sticky top-8 p-6 rounded-2xl bg-surface border border-border glow-gold">
              <h2 className="text-sm font-medium text-foreground/50 mb-5 flex items-center gap-3 tracking-wide">
                <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
                Nuevo Producto
              </h2>
              <ShoppingForm onItemAdded={fetchItems} />
            </div>
          </div>

          {/* Shopping list */}
          <div className="lg:col-span-3">
            <div className="p-6 rounded-2xl bg-surface border border-border glow-gold">
              <h2 className="text-sm font-medium text-foreground/50 mb-5 flex items-center gap-3 tracking-wide">
                <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
                  <span className="text-sm">📋</span>
                </div>
                Productos
                {items.length > 0 && (
                  <span className="text-foreground/20 font-normal">
                    ({items.length})
                  </span>
                )}
              </h2>

              {loading ? (
                <div className="text-center py-16">
                  <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin mx-auto" />
                  <p className="text-foreground/20 mt-4 text-sm">Cargando...</p>
                </div>
              ) : (
                <ShoppingList
                  items={items}
                  onToggleBought={handleToggleBought}
                  onDelete={handleDelete}
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 text-xs text-foreground/15 tracking-widest uppercase">
          Hecho con amor por Javiera
        </footer>
      </div>
    </div>
  );
}
