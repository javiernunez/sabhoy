"use client";

import { useState } from "react";
import { uiMediaUrl } from "@/lib/media-url";

type Props = {
  name: string;
  value: string;
  onUrlChange: (url: string) => void;
  label?: string;
  allowManualUrl?: boolean;
};

export function AdminImageUpload({ name, value, onUrlChange, label = "Imagen", allowManualUrl = true }: Readonly<Props>) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [lastInfo, setLastInfo] = useState<string | null>(null);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setErr(null);
    setLastInfo(null);
    setBusy(true);
    const form = new FormData();
    form.set("file", file);
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: form,
      credentials: "same-origin",
    });
    setBusy(false);
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setErr(j.error || "Error al subir");
      return;
    }
    const j = (await res.json()) as {
      url: string;
      bytes: number;
      width: number;
      height: number;
      format: string;
      variants?: { width: number; bytes: number }[];
    };
    onUrlChange(j.url);
    const variantNote =
      j.variants?.length && j.variants.length > 1
        ? ` · ${j.variants.length} tamaños (${j.variants.map((v) => `w${v.width}:${(v.bytes / 1024).toFixed(0)}KB`).join(", ")})`
        : "";
    setLastInfo(`Listo: WebP ${j.width}×${j.height}px · ${(j.bytes / 1024).toFixed(0)} KB${variantNote}`);
  }

  const preview = uiMediaUrl(value || null);
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        {label}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/tiff"
          onChange={onFileChange}
          disabled={busy}
          className="mt-1 block w-full text-sm text-slate-600"
        />
      </label>
      {busy ? <p className="text-xs text-slate-500">Optimizando y subiendo (WebP)…</p> : null}
      {err ? <p className="text-xs text-red-600">{err}</p> : null}
      {lastInfo ? <p className="text-xs text-blue-700">{lastInfo}</p> : null}
      <p className="text-xs text-slate-500">
        Se convierten a WebP, se orientan (EXIF) y se acotan a ~1920px.
        {allowManualUrl ? " Tambien puedes pegar URL manual si ya está en otra CDN." : ""}
      </p>
      {allowManualUrl ? (
        <input
          type="text"
          name={name}
          value={value}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="O pega URL https://… o ruta /media/… (opcional)"
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
        />
      ) : (
        <input type="hidden" name={name} value={value} />
      )}
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="" className="mt-1 max-h-40 rounded border border-slate-200 object-contain" />
      ) : null}
    </div>
  );
}
