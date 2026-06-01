"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";
import { AdminDataTable } from "@/components/admin/AdminDataTable";

type AdminReport = {
  id: number;
  title: string;
};

type Props = { initialReports: AdminReport[]; notice?: string | null };

export function AdminDenunciasList({ initialReports, notice }: Readonly<Props>) {
  const router = useRouter();
  const [reports, setReports] = useState(initialReports);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const selected = reports.find((r) => r.id === deleteId) ?? null;

  async function confirmDelete() {
    if (!selected) return;
    setBusy(true);
    const response = await fetch(`/api/reports/${selected.id}`, { method: "DELETE", credentials: "include" });
    if (!response.ok) {
      setBusy(false);
      return;
    }
    setReports((old) => old.filter((item) => item.id !== selected.id));
    setDeleteId(null);
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Denuncias</h1>
        <Link href="/admin/denuncias/nuevo" className="rounded bg-slate-800 px-3 py-2 text-sm font-medium text-white">
          Nuevo
        </Link>
      </div>
      {notice ? <p className="rounded bg-blue-50 px-3 py-2 text-sm text-blue-700">{notice}</p> : null}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Listado</h2>
        <AdminDataTable
          rows={reports.map((report) => ({
            id: report.id,
            title: report.title,
            actions: (
              <>
                <Link href={`/admin/denuncias/${report.id}`} className="inline-block rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700">
                  Editar
                </Link>
                <button type="button" onClick={() => setDeleteId(report.id)} className="ml-2 inline-block rounded border border-rose-300 px-3 py-1.5 text-sm text-rose-700">
                  Eliminar
                </button>
              </>
            ),
          }))}
        />
      </section>
      <AdminConfirmModal
        open={Boolean(selected)}
        title="Eliminar denuncia"
        message={`Se eliminará "${selected?.title ?? ""}". Esta acción no se puede deshacer.`}
        busy={busy}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
