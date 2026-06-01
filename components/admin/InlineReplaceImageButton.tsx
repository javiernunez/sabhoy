"use client";

import { useId, useState } from "react";

type Props = {
  entryId: number;
};

export function InlineReplaceImageButton({ entryId }: Props) {
  const inputId = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setError(null);

    try {
      const form = new FormData();
      form.set("file", file);

      const uploadRes = await fetch("/api/admin/upload", {
        method: "POST",
        body: form,
        credentials: "same-origin",
      });
      if (!uploadRes.ok) {
        throw new Error("No se pudo subir la imagen.");
      }
      const uploadJson = (await uploadRes.json()) as { url: string };

      const saveRes = await fetch(`/api/local-directory/${entryId}/image`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ imageUrl: uploadJson.url }),
      });
      if (!saveRes.ok) {
        throw new Error("No se pudo guardar la imagen.");
      }

      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al reemplazar imagen.");
      setBusy(false);
    }
  }

  return (
    <div>
      <label
        htmlFor={inputId}
        title="Reemplazar foto"
        aria-label="Reemplazar foto"
        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded bg-black/70 text-sm text-white hover:bg-black/80"
      >
        {busy ? "…" : "🖼️"}
      </label>
      <input
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/tiff"
        className="hidden"
        onChange={onFileChange}
        disabled={busy}
      />
      {error ? <p className="mt-1 rounded bg-red-600/90 px-2 py-1 text-[11px] text-white">{error}</p> : null}
    </div>
  );
}
