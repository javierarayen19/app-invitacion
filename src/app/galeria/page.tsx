"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Photo } from "@/types/photo";
import Sparkles from "@/components/Sparkles";

function compressImage(file: File, maxDim: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = (height / width) * maxDim;
            width = maxDim;
          } else {
            width = (width / height) * maxDim;
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function GaleriaPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [caption, setCaption] = useState("");
  const [uploadedBy, setUploadedBy] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [viewPhoto, setViewPhoto] = useState<Photo | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchPhotos = useCallback(async () => {
    try {
      const res = await fetch("/api/photos");
      const data = await res.json();
      setPhotos(data);
    } catch (err) {
      console.error("Error cargando fotos:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 800, 0.6);
      setPreview(compressed);
    } catch {
      console.error("Error comprimiendo imagen");
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!preview) return;
    setUploading(true);
    try {
      const res = await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_data: preview, caption, uploaded_by: uploadedBy }),
      });
      if (res.ok) {
        setPreview(null);
        setCaption("");
        if (fileRef.current) fileRef.current.value = "";
        fetchPhotos();
      }
    } catch (err) {
      console.error("Error subiendo foto:", err);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background relative noise-overlay">
      <Sparkles />
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-64 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-gold/[0.04] blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-10 sm:py-16">
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/[0.08] border border-gold/15 text-gold/70 text-xs font-medium mb-5 tracking-[0.2em] uppercase">
            <span className="text-sm">📸</span>
            <span>Galeria de Fotos</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-bold tracking-tight">
            <span className="bg-gradient-to-r from-gold-light via-gold to-gold-dark bg-clip-text text-transparent">
              Momentos
            </span>
          </h1>
          <p className="mt-3 text-foreground/30 text-sm max-w-sm mx-auto">
            Comparte tus fotos de la fiesta
          </p>
        </header>

        {/* Upload form */}
        <div className="p-6 rounded-2xl bg-surface border border-border glow-gold mb-8">
          <form onSubmit={handleUpload} className="space-y-4">
            {/* File input */}
            <div
              onClick={() => fileRef.current?.click()}
              className="relative cursor-pointer rounded-xl border-2 border-dashed border-border
                         hover:border-gold/30 transition-all duration-300 overflow-hidden"
            >
              {preview ? (
                <img src={preview} alt="Preview" className="w-full max-h-64 object-cover" />
              ) : (
                <div className="py-12 text-center">
                  <span className="text-3xl block mb-2">📷</span>
                  <p className="text-foreground/30 text-sm">Toca para seleccionar una foto</p>
                  <p className="text-foreground/15 text-xs mt-1">Se comprimira automaticamente</p>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Descripcion (opcional)"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-border
                           text-foreground placeholder:text-foreground/20 text-sm
                           focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20
                           transition-all duration-300"
              />
              <input
                type="text"
                value={uploadedBy}
                onChange={(e) => setUploadedBy(e.target.value)}
                placeholder="Tu nombre"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-border
                           text-foreground placeholder:text-foreground/20 text-sm
                           focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20
                           transition-all duration-300"
              />
            </div>

            <button
              type="submit"
              disabled={!preview || uploading}
              className="w-full py-3.5 rounded-xl font-semibold text-background text-sm tracking-wide
                         bg-gradient-to-r from-gold-dark via-gold to-gold-light
                         hover:shadow-[0_0_30px_rgba(212,168,83,0.3)]
                         active:scale-[0.98] disabled:opacity-50 transition-all duration-300"
            >
              {uploading ? "Subiendo..." : "📸 Subir Foto"}
            </button>
          </form>
        </div>

        {/* Photo grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin mx-auto" />
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-4xl block mb-3">📸</span>
            <p className="text-foreground/30 text-sm">Aun no hay fotos</p>
            <p className="text-foreground/15 text-xs mt-1">Se la primera en compartir un momento!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map((photo) => (
              <button
                key={photo.id}
                onClick={() => setViewPhoto(photo)}
                className="relative aspect-square rounded-xl overflow-hidden border border-border
                           hover:border-gold/30 transition-all duration-300 group"
              >
                <img
                  src={photo.image_data}
                  alt={photo.caption || "Foto de la fiesta"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {(photo.caption || photo.uploaded_by) && (
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                    {photo.caption && (
                      <p className="text-white text-[10px] truncate">{photo.caption}</p>
                    )}
                    {photo.uploaded_by && (
                      <p className="text-white/50 text-[9px]">por {photo.uploaded_by}</p>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Lightbox */}
        {viewPhoto && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setViewPhoto(null)}
          >
            <div className="max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
              <img
                src={viewPhoto.image_data}
                alt={viewPhoto.caption || "Foto"}
                className="w-full rounded-xl"
              />
              {(viewPhoto.caption || viewPhoto.uploaded_by) && (
                <div className="text-center mt-3">
                  {viewPhoto.caption && (
                    <p className="text-white text-sm">{viewPhoto.caption}</p>
                  )}
                  {viewPhoto.uploaded_by && (
                    <p className="text-white/40 text-xs mt-1">por {viewPhoto.uploaded_by}</p>
                  )}
                </div>
              )}
              <button
                onClick={() => setViewPhoto(null)}
                className="mt-4 mx-auto block px-6 py-2 rounded-xl bg-white/10 text-white/60 text-sm
                           hover:bg-white/20 transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
