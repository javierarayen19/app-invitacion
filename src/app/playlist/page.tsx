"use client";

import { useState, useEffect, useCallback } from "react";
import type { PlaylistSong } from "@/types/playlist";
import Sparkles from "@/components/Sparkles";

export default function PlaylistPage() {
  const [songs, setSongs] = useState<PlaylistSong[]>([]);
  const [songName, setSongName] = useState("");
  const [artist, setArtist] = useState("");
  const [suggestedBy, setSuggestedBy] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const fetchSongs = useCallback(async () => {
    try {
      const res = await fetch("/api/playlist");
      const data = await res.json();
      setSongs(data);
    } catch (err) {
      console.error("Error cargando playlist:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    try {
      const res = await fetch("/api/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ song_name: songName, artist, suggested_by: suggestedBy }),
      });
      if (res.ok) {
        setSongName("");
        setArtist("");
        fetchSongs();
      }
    } catch (err) {
      console.error("Error agregando cancion:", err);
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="min-h-screen bg-background relative noise-overlay">
      <Sparkles />
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-64 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-gold/[0.04] blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-10 sm:py-16">
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/[0.08] border border-gold/15 text-gold/70 text-xs font-medium mb-5 tracking-[0.2em] uppercase">
            <span className="text-sm">🎵</span>
            <span>Playlist Colaborativa</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-bold tracking-tight">
            <span className="bg-gradient-to-r from-gold-light via-gold to-gold-dark bg-clip-text text-transparent">
              Sugiere Canciones
            </span>
          </h1>
          <p className="mt-3 text-foreground/30 text-sm max-w-sm mx-auto">
            Agrega las canciones que quieres escuchar en la fiesta
          </p>
        </header>

        {/* Add song form */}
        <div className="p-6 rounded-2xl bg-surface border border-border glow-gold mb-8">
          <form onSubmit={handleAdd} className="space-y-4">
            <input
              type="text"
              value={songName}
              onChange={(e) => setSongName(e.target.value)}
              placeholder="Nombre de la cancion"
              required
              className="w-full px-4 py-3.5 rounded-xl bg-white/[0.03] border border-border
                         text-foreground placeholder:text-foreground/20
                         focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20
                         focus:bg-white/[0.05] transition-all duration-300"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Artista"
                className="w-full px-4 py-3.5 rounded-xl bg-white/[0.03] border border-border
                           text-foreground placeholder:text-foreground/20
                           focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20
                           focus:bg-white/[0.05] transition-all duration-300"
              />
              <input
                type="text"
                value={suggestedBy}
                onChange={(e) => setSuggestedBy(e.target.value)}
                placeholder="Tu nombre"
                className="w-full px-4 py-3.5 rounded-xl bg-white/[0.03] border border-border
                           text-foreground placeholder:text-foreground/20
                           focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20
                           focus:bg-white/[0.05] transition-all duration-300"
              />
            </div>
            <button
              type="submit"
              disabled={adding}
              className="w-full py-3.5 rounded-xl font-semibold text-background text-sm tracking-wide
                         bg-gradient-to-r from-gold-dark via-gold to-gold-light
                         hover:shadow-[0_0_30px_rgba(212,168,83,0.3)]
                         active:scale-[0.98] disabled:opacity-50 transition-all duration-300"
            >
              {adding ? "Agregando..." : "🎵 Agregar Cancion"}
            </button>
          </form>
        </div>

        {/* Song list */}
        <div className="p-6 rounded-2xl bg-surface border border-border glow-gold">
          <h2 className="text-sm font-medium text-foreground/50 mb-4 flex items-center gap-2">
            <span>🎶</span>
            Canciones sugeridas
            {songs.length > 0 && (
              <span className="text-foreground/20">({songs.length})</span>
            )}
          </h2>

          {loading ? (
            <div className="text-center py-10">
              <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin mx-auto" />
            </div>
          ) : songs.length === 0 ? (
            <div className="text-center py-10">
              <span className="text-3xl block mb-3">🎵</span>
              <p className="text-foreground/30 text-sm">Aun no hay canciones</p>
              <p className="text-foreground/15 text-xs mt-1">Se la primera en sugerir!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {songs.map((song, i) => (
                <div
                  key={song.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-transparent
                             hover:bg-white/[0.05] hover:border-border transition-all duration-300"
                >
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold/60 text-xs font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground/90 truncate">
                      {song.song_name}
                    </p>
                    <p className="text-xs text-foreground/30 truncate">
                      {song.artist && <span>{song.artist}</span>}
                      {song.artist && song.suggested_by && <span> · </span>}
                      {song.suggested_by && <span>sugerida por {song.suggested_by}</span>}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
