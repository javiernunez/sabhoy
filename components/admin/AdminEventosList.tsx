"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";
import { AdminDataTable } from "@/components/admin/AdminDataTable";

type EventRow = {
  id: number;
  title: string;
  status: string;
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
  const [toggleBusyId, setToggleBusyId] = useState<number | null>(null);
  const selected = events.find((item) => item.id === deleteId) ?? null;

  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  async function togglePublish(id: number, active: boolean) {
    setToggleBusyId(id);
    const res = await fetch(`/api/eventos/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intent: "status", status: active ? "active" : "draft" }),
    });
    setToggleBusyId(null);
    if (!res.ok) return;
    const updated = (await res.json()) as { id: number; status: string };
    setEvents((old) => old.map((e) => (e.id === id ? { ...e, status: updated.status } : e)));
    router.refresh();
  }

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
      {notice ? <p className="rounded bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{notice}</p> : null}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Listado</h2>
        <AdminDataTable
          publishColumn
          rows={events.map((event) => ({
            id: event.id,
            title: event.title,
            publishSwitch: (
              <label className="inline-flex cursor-pointer items-center gap-2 select-none">
                <span className="sr-only">Publicado</span>
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={event.status === "active"}
                  disabled={toggleBusyId === event.id}
                  onChange={(e) => void togglePublish(event.id, e.target.checked)}
                />
                <span
                  className="relative h-6 w-11 shrink-0 rounded-full bg-slate-300 transition peer-checked:bg-emerald-600 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-500 peer-focus-visible:ring-offset-2 peer-disabled:opacity-50 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5"
                  aria-hidden
                />
              </label>
            ),
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
