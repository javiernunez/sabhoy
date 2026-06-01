"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import type { VideoCategory } from "@prisma/client";
import { AdminMdxField } from "@/components/admin/AdminMdxField";
import { VIDEO_CATEGORIES, videoCategoryLabel } from "@/lib/video-categories";

type AdminVideo = {
  id: number;
  url: string;
  description: string;
  descriptionVal: string | null;
  category: VideoCategory;
};

type Props = { video?: AdminVideo };

export function AdminVideoForm({ video }: Props) {
  const isEdit = Boolean(video);
  const router = useRouter();
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice(null);
    const form = new FormData(event.currentTarget);
    const payload = {
      url: form.get("url"),
      description: form.get("description"),
      descriptionVal: (form.get("descriptionVal") as string) || null,
      category: form.get("category"),
    };
    const url = isEdit ? `/api/videos/${video!.id}` : "/api/videos";
    const method = isEdit ? "PATCH" : "POST";
    const response = await fetch(url, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      setBusy(false);
      setNotice(`No se pudo ${isEdit ? "guardar" : "crear"} el video.`);
      return;
    }
    router.push(`/admin/videos?ok=${isEdit ? "updated" : "created"}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{isEdit ? "Editar video" : "Nuevo video"}</h1>
        <Link href="/admin/videos" className="text-sm font-medium text-slate-600 hover:underline">
          ← Volver al listado
        </Link>
      </div>
      {notice ? <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-800">{notice}</p> : null}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <form onSubmit={onSubmit} className="grid gap-3">
          <input name="url" required defaultValue={video?.url ?? ""} placeholder="URL del video" className="w-full rounded border border-slate-300 px-3 py-2 text-sm" />
          <label className="block text-sm font-medium text-slate-700">Categoría</label>
          <select name="category" defaultValue={video?.category ?? "GENERAL"} className="w-full max-w-sm rounded border border-slate-300 px-3 py-2 text-sm">
            {VIDEO_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {videoCategoryLabel[c]}
              </option>
            ))}
          </select>
          <AdminMdxField name="description" defaultValue={video?.description ?? ""} required minHeight={220} label="Descripcion (CAST) — editor visual" placeholder="Descripcion" />
          <AdminMdxField name="descriptionVal" defaultValue={video?.descriptionVal ?? ""} minHeight={220} label="Descripcio (VAL) — editor visual" placeholder="Descripcio" />
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
              {busy ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear video"}
            </button>
            <Link href="/admin/videos" className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-700">
              Cancelar
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
