"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";
import { AdminDataTable } from "@/components/admin/AdminDataTable";

type VideoRow = {
  id: number;
  description: string;
};

type Props = {
  initialVideos: VideoRow[];
  notice?: string | null;
};

export function AdminVideosList({ initialVideos, notice }: Readonly<Props>) {
  const router = useRouter();
  const [videos, setVideos] = useState(initialVideos);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const selected = videos.find((v) => v.id === deleteId) ?? null;

  async function confirmDelete() {
    if (!selected) return;
    setBusy(true);
    const response = await fetch(`/api/videos/${selected.id}`, { method: "DELETE", credentials: "include" });
    if (!response.ok) {
      setBusy(false);
      return;
    }
    setVideos((old) => old.filter((item) => item.id !== selected.id));
    setDeleteId(null);
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Videos</h1>
        <Link href="/admin/videos/nuevo" className="rounded bg-slate-800 px-3 py-2 text-sm font-medium text-white">
          Nuevo
        </Link>
      </div>
      {notice ? <p className="rounded bg-blue-50 px-3 py-2 text-sm text-blue-700">{notice}</p> : null}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Listado</h2>
        <AdminDataTable
          rows={videos.map((video) => ({
            id: video.id,
            title: video.description,
            actions: (
              <>
                <Link href={`/admin/videos/${video.id}`} className="inline-block rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700">
                  Editar
                </Link>
                <button type="button" onClick={() => setDeleteId(video.id)} className="ml-2 inline-block rounded border border-rose-300 px-3 py-1.5 text-sm text-rose-700">
                  Eliminar
                </button>
              </>
            ),
          }))}
        />
      </section>
      <AdminConfirmModal
        open={Boolean(selected)}
        title="Eliminar video"
        message="Se eliminará este video. Esta acción no se puede deshacer."
        busy={busy}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
