"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";
import { AdminDataTable } from "@/components/admin/AdminDataTable";

type EventRow = {
  id: number;
  title: string;
};

type Props = {
  initialEvents: EventRow[];
  notice?: string | null;
};

export function AdminEventosList({ initialEvents, notice }: Readonly<Props>) {
  const router = useRouter();
  const [events, setEvents] = useState(initialEvents);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const selected = events.find((item) => item.id === deleteId) ?? null;

  async function confirmDelete() {
    if (!selected) return;
    setBusy(true);
    const response = await fetch(`/api/eventos/${selected.id}`, { method: "DELETE", credentials: "include" });
    if (!response.ok) {
      setBusy(false);
      return;
    }
    setEvents((old) => old.filter((item) => item.id !== selected.id));
    setDeleteId(null);
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Eventos</h1>
        <Link href="/admin/eventos/nuevo" className="rounded bg-slate-800 px-3 py-2 text-sm font-medium text-white">
          Nuevo
        </Link>
      </div>
      {notice ? <p className="rounded bg-blue-50 px-3 py-2 text-sm text-blue-700">{notice}</p> : null}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Listado</h2>
        <AdminDataTable
          rows={events.map((event) => ({
            id: event.id,
            title: event.title,
            actions: (
              <>
                <Link href={`/admin/eventos/${event.id}`} className="inline-block rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700">
                  Editar
                </Link>
                <button type="button" onClick={() => setDeleteId(event.id)} className="ml-2 inline-block rounded border border-rose-300 px-3 py-1.5 text-sm text-rose-700">
                  Eliminar
                </button>
              </>
            ),
          }))}
        />
      </section>
      <AdminConfirmModal
        open={Boolean(selected)}
        title="Eliminar evento"
        message="Se eliminará este evento. Esta acción no se puede deshacer."
        busy={busy}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
