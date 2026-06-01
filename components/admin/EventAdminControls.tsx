"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";

type Props = Readonly<{
  eventId: number;
  isVal?: boolean;
  className?: string;
  /** Más compacto para filas estrechas o tooltips */
  compact?: boolean;
  /** Si se indica, tras borrar se navega aquí en lugar de solo `refresh` (útil en ficha del evento) */
  afterDeleteNavigateTo?: string;
}>;

export function EventAdminControls({
  eventId,
  isVal = false,
  className = "",
  compact = false,
  afterDeleteNavigateTo,
}: Props) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const L = {
    edit: isVal ? "Editar" : "Editar",
    del: isVal ? "Eliminar" : "Eliminar",
    modalTitle: isVal ? "Eliminar esdeveniment" : "Eliminar evento",
    modalMsg: isVal
      ? "S'eliminarà este esdeveniment. Esta acció no es pot desfer."
      : "Se eliminará este evento. Esta acción no se puede deshacer.",
  };

  const btnBase = compact
    ? "rounded border px-1.5 py-0.5 text-[10px] font-semibold leading-tight"
    : "rounded border px-2 py-1 text-[11px] font-semibold";

  async function confirmDelete() {
    setBusy(true);
    const response = await fetch(`/api/eventos/${eventId}`, { method: "DELETE", credentials: "include" });
    setBusy(false);
    if (!response.ok) return;
    setConfirmOpen(false);
    if (afterDeleteNavigateTo) router.push(afterDeleteNavigateTo);
    else router.refresh();
  }

  return (
    <div className={`flex flex-wrap items-center gap-1 ${className}`} onClick={(e) => e.stopPropagation()}>
      <Link
        href={`/admin/eventos/${eventId}`}
        className={`${btnBase} border-slate-300 bg-white text-slate-700 hover:bg-slate-50`}
      >
        {L.edit}
      </Link>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className={`${btnBase} border-rose-200 bg-white text-rose-700 hover:bg-rose-50`}
      >
        {L.del}
      </button>
      <AdminConfirmModal
        open={confirmOpen}
        title={L.modalTitle}
        message={L.modalMsg}
        busy={busy}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
