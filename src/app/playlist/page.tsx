"use client";

import { useState, useEffect, useCallback } from "react";
import type { PlaylistSong } from "@/types/playlist";
import Sparkles from "@/components/Sparkles";

const SPOTIFY_PLAYLIST_URL = "https://open.spotify.com/playlist/1t93ohUyM6sEnqVg5WALfh?si=dfnTpONoSxeGfHR75hnJKA";

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

  function getSpotifySearchUrl(song: string, songArtist: string) {
    const query = songArtist ? `${song} ${songArtist}` : song;
    return `https://open.spotify.com/search/${encodeURIComponent(query)}`;
  }

  return (
    <div className="min-h-screen bg-background relative noise-overlay">
      <Sparkles />

      {/* Background blurs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-64 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-gold/[0.04] blur-[120px]" />
        <div className="absolute top-1/3 -right-48 w-[350px] h-[350px] rounded-full bg-emerald-500/[0.03] blur-[100px]" />
        <div className="absolute bottom-0 -left-48 w-[400px] h-[400px] rounded-full bg-gold/[0.02] blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 py-10 sm:py-16">
        <div className="w-full max-w-lg">

          {/* Header */}
          <header className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/[0.08] border border-gold/15 text-gold/70 text-xs font-medium mb-5 tracking-[0.2em] uppercase">
              <span className="text-sm">🎵</span>
              <span>Playlist Colaborativa</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-display font-bold tracking-tight">
              <span className="bg-gradient-to-r from-gold-light via-gold to-gold-dark bg-clip-text text-transparent animate-shimmer">
                Fiesta de JC
              </span>
            </h1>
            <p className="mt-3 text-foreground/30 text-sm max-w-sm mx-auto leading-relaxed">
              Sugiere las canciones que no pueden faltar en la fiesta
            </p>
            <div className="mt-4 w-24 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent mx-auto" />
          </header>

          {/* Spotify Playlist Card */}
          <div className="mb-8 p-5 rounded-2xl bg-gradient-to-br from-[#1DB954]/10 via-surface to-surface border border-[#1DB954]/20 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-[#1DB954]/15 border border-[#1DB954]/25 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#1DB954">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#1DB954] mb-1">
                  Playlist Oficial del Cumple
                </h3>
                <p className="text-foreground/25 text-xs mb-3">
                  Escucha la playlist que sonara en la fiesta
                </p>
              </div>
              <a
                href={SPOTIFY_PLAYLIST_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full
                           bg-[#1DB954] text-white text-sm font-semibold
                           hover:bg-[#1ed760] hover:shadow-[0_0_25px_rgba(29,185,84,0.3)]
                           active:scale-[0.97] transition-all duration-300"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                Abrir en Spotify
              </a>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <span className="text-[10px] text-foreground/20 tracking-widest uppercase">o sugiere una cancion</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>

          {/* Add song form */}
          <div className="p-6 rounded-2xl bg-surface border border-border glow-gold mb-8">
            <h2 className="text-sm font-medium text-foreground/50 mb-4 flex items-center gap-2 tracking-wide">
              <div className="w-7 h-7 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
                <span className="text-xs">✨</span>
              </div>
              Sugerir Cancion
            </h2>
            <form onSubmit={handleAdd} className="space-y-3">
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
                {adding ? "Agregando..." : "Agregar Cancion"}
              </button>
            </form>
          </div>

          {/* Song list */}
          <div className="p-6 rounded-2xl bg-surface border border-border glow-gold">
            <h2 className="text-sm font-medium text-foreground/50 mb-4 flex items-center gap-2 tracking-wide">
              <div className="w-7 h-7 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
                <span className="text-xs">🎶</span>
              </div>
              Canciones sugeridas
              {songs.length > 0 && (
                <span className="text-foreground/20 font-normal">({songs.length})</span>
              )}
            </h2>

            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin mx-auto" />
                <p className="text-foreground/20 mt-3 text-xs">Cargando playlist...</p>
              </div>
            ) : songs.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gold/5 border border-gold/10 flex items-center justify-center">
                  <span className="text-2xl">🎵</span>
                </div>
                <p className="text-foreground/30 text-sm font-medium">Aun no hay canciones</p>
                <p className="text-foreground/15 text-xs mt-1">Se la primera persona en sugerir!</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {songs.map((song, i) => (
                  <div
                    key={song.id}
                    className="group flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-transparent
                               hover:bg-white/[0.05] hover:border-border transition-all duration-300"
                  >
                    {/* Number */}
                    <div className="shrink-0 w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold/60 text-xs font-bold">
                      {i + 1}
                    </div>

                    {/* Song info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground/90 truncate">
                        {song.song_name}
                      </p>
                      <p className="text-xs text-foreground/30 truncate">
                        {song.artist && <span>{song.artist}</span>}
                        {song.artist && song.suggested_by && <span> · </span>}
                        {song.suggested_by && <span>por {song.suggested_by}</span>}
                      </p>
                    </div>

                    {/* Spotify search link */}
                    <a
                      href={getSpotifySearchUrl(song.song_name, song.artist)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 w-7 h-7 rounded-full bg-[#1DB954]/10 border border-[#1DB954]/20
                                 flex items-center justify-center
                                 hover:bg-[#1DB954]/20 hover:border-[#1DB954]/40
                                 transition-all duration-300"
                      title="Buscar en Spotify"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#1DB954">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                      </svg>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="text-center mt-12 text-xs text-foreground/15 tracking-widest uppercase">
            Hecho con amor para JC
          </footer>

        </div>
      </div>
    </div>
  );
}
