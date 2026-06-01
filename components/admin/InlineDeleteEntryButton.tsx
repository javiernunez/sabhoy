"use client";

import { useState } from "react";

type Props = {
  entryId: number;
};

export function InlineDeleteEntryButton({ entryId }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    const confirmed = globalThis.confirm("¿Seguro que quieres eliminar este registro?");
    if (!confirmed) return;

    setBusy(true);
    setError(null);

    try {
      const response = await fetch(`/api/local-directory/${entryId}`, {
        method: "DELETE",
        credentials: "same-origin",
      });

      if (!response.ok) {
        throw new Error("No se pudo eliminar el registro.");
      }

      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar el registro.");
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => void onDelete()}
        disabled={busy}
        title="Eliminar registro"
        aria-label="Eliminar registro"
        className="inline-flex h-8 w-8 items-center justify-center rounded bg-rose-700/85 text-sm text-white hover:bg-rose-800/90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {busy ? "…" : "🗑️"}
      </button>
      {error ? <p className="mt-1 rounded bg-red-600/90 px-2 py-1 text-[11px] text-white">{error}</p> : null}
    </div>
  );
}
