"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";
import { AdminDataTable } from "@/components/admin/AdminDataTable";

type DirectoryKind = "COMMERCE" | "SPORT" | "ASSOCIATION" | "POLITICS";

type AdminDirectoryEntry = {
  id: number;
  name: string;
  kind: DirectoryKind;
};

type Props = {
  initialEntries: AdminDirectoryEntry[];
  notice?: string | null;
  kindFilter?: DirectoryKind;
  title?: string;
};

const KIND_LABEL: Record<DirectoryKind, string> = {
  COMMERCE: "Comercio",
  ASSOCIATION: "Asociación",
  SPORT: "Deporte",
  POLITICS: "Política",
};

export function AdminDirectorioList({ initialEntries, notice, kindFilter, title }: Readonly<Props>) {
  const router = useRouter();
  const [entries, setEntries] = useState(initialEntries);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const selected = entries.find((entry) => entry.id === deleteId) ?? null;

  const visibleEntries = useMemo(
    () => (kindFilter ? entries.filter((entry) => entry.kind === kindFilter) : entries),
    [entries, kindFilter],
  );

  async function confirmDelete() {
    if (!selected) return;
    setBusy(true);
    const response = await fetch(`/api/local-directory/${selected.id}`, { method: "DELETE", credentials: "include" });
    if (!response.ok) {
      setBusy(false);
      return;
    }
    setEntries((old) => old.filter((item) => item.id !== selected.id));
    setDeleteId(null);
    setBusy(false);
    router.refresh();
  }

  const heading = title ?? "Directorio local";
  const newHref = kindFilter ? `/admin/directorio/nuevo?kind=${kindFilter}` : "/admin/directorio/nuevo";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{heading}</h1>
        <div className="flex gap-2">
          <Link href="/admin/directorio/gestion" className="rounded border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700">
            Gestión categorías
          </Link>
          <Link href={newHref} className="rounded bg-slate-800 px-3 py-2 text-sm font-medium text-white">
            Nuevo
          </Link>
        </div>
      </div>
      {notice ? <p className="rounded bg-blue-50 px-3 py-2 text-sm text-blue-700">{notice}</p> : null}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Listado{kindFilter ? ` · ${KIND_LABEL[kindFilter]}` : ""}</h2>
        {visibleEntries.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No hay entradas en esta sección todavía.</p>
        ) : (
          <AdminDataTable
            rows={visibleEntries.map((entry) => ({
              id: entry.id,
              title: entry.name,
              actions: (
                <>
                  <Link href={`/admin/directorio/${entry.id}`} className="inline-block rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700">
                    Editar
                  </Link>
                  <button type="button" onClick={() => setDeleteId(entry.id)} className="ml-2 inline-block rounded border border-rose-300 px-3 py-1.5 text-sm text-rose-700">
                    Eliminar
                  </button>
                </>
              ),
            }))}
          />
        )}
      </section>
      <AdminConfirmModal
        open={Boolean(selected)}
        title="Eliminar entrada"
        message={`Se eliminará "${selected?.name ?? ""}". Esta acción no se puede deshacer.`}
        busy={busy}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
