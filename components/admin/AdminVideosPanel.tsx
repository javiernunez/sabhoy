"use client";

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
  createdAt: string | Date;
};

type Props = {
  readonly initialVideos: AdminVideo[];
};

function formatDate(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function AdminVideosPanel({ initialVideos }: Props) {
  const [videos, setVideos] = useState(initialVideos);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingBusy, setEditingBusy] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [newVideoKey, setNewVideoKey] = useState(0);

  async function createVideo(event: FormEvent<HTMLFormElement>) {
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

    const response = await fetch("/api/videos", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setNotice("No se pudo crear el video.");
      setBusy(false);
      return;
    }

    const created = (await response.json()) as AdminVideo;
    setVideos((old) => [created, ...old]);
    setNotice("Video creado correctamente.");
    setNewVideoKey((k) => k + 1);
    event.currentTarget.reset();
    setBusy(false);
  }

  function startEdit(videoId: number) {
    setNotice(null);
    setEditingId(videoId);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function updateVideo(event: FormEvent<HTMLFormElement>, id: number) {
    event.preventDefault();
    setEditingBusy(true);
    setNotice(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      url: form.get("url"),
      description: form.get("description"),
      descriptionVal: (form.get("descriptionVal") as string) || null,
      category: form.get("category"),
    };

    const response = await fetch(`/api/videos/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setNotice("No se pudo actualizar el video.");
      setEditingBusy(false);
      return;
    }

    const updated = (await response.json()) as AdminVideo;
    setVideos((old) => old.map((video) => (video.id === id ? updated : video)));
    setNotice("Video actualizado correctamente.");
    setEditingBusy(false);
    cancelEdit();
  }

  async function deleteVideo(id: number) {
    const confirmed = globalThis.confirm("¿Seguro que quieres eliminar este video?");
    if (!confirmed) return;

    setDeletingId(id);
    setNotice(null);
    const response = await fetch(`/api/videos/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      setNotice("No se pudo eliminar el video.");
      setDeletingId(null);
      return;
    }

    setVideos((old) => old.filter((video) => video.id !== id));
    setNotice("Video eliminado.");
    if (editingId === id) cancelEdit();
    setDeletingId(null);
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Videos</h1>
      {notice ? <p className="rounded bg-blue-50 px-3 py-2 text-sm text-blue-700">{notice}</p> : null}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Crear video</h2>
        <form onSubmit={createVideo} className="mt-4 grid gap-3">
          <input
            name="url"
            required
            placeholder="URL del video"
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
          <label className="block text-sm font-medium text-slate-700">Categoría</label>
          <select
            name="category"
            defaultValue="GENERAL"
            className="w-full max-w-sm rounded border border-slate-300 px-3 py-2 text-sm"
          >
            {VIDEO_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {videoCategoryLabel[c]}
              </option>
            ))}
          </select>
          <AdminMdxField
            key={`vid-new-desc-cast-${newVideoKey}`}
            name="description"
            defaultValue=""
            required
            minHeight={200}
            label="Descripcion (CAST) — editor visual"
            placeholder="Descripcion"
          />
          <AdminMdxField
            key={`vid-new-desc-val-${newVideoKey}`}
            name="descriptionVal"
            defaultValue=""
            minHeight={200}
            label="Descripcio (VAL) — editor visual"
            placeholder="Descripcio"
          />
          <button type="submit" disabled={busy} className="w-fit rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
            {busy ? "Guardando..." : "Guardar video"}
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Videos publicados</h2>
        <div className="mt-4 space-y-3">
          {videos.map((video) => (
            <article key={video.id} className="rounded border border-slate-200 p-3">
              {editingId === video.id ? (
                <form className="grid gap-3" onSubmit={(event) => void updateVideo(event, video.id)}>
                  <input
                    name="url"
                    required
                    defaultValue={video.url}
                    placeholder="URL del video"
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  />
                  <label className="block text-sm font-medium text-slate-700">Categoría</label>
                  <select
                    name="category"
                    defaultValue={video.category}
                    className="w-full max-w-sm rounded border border-slate-300 px-3 py-2 text-sm"
                  >
                    {VIDEO_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {videoCategoryLabel[c]}
                      </option>
                    ))}
                  </select>
                  <AdminMdxField
                    key={`vid-edit-d-${video.id}`}
                    name="description"
                    defaultValue={video.description}
                    required
                    minHeight={200}
                    label="Descripcion (CAST) — editor visual"
                    placeholder="Descripcion"
                  />
                  <AdminMdxField
                    key={`vid-edit-dv-${video.id}`}
                    name="descriptionVal"
                    defaultValue={video.descriptionVal ?? ""}
                    minHeight={200}
                    label="Descripcio (VAL) — editor visual"
                    placeholder="Descripcio"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="submit"
                      disabled={editingBusy}
                      className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                    >
                      {editingBusy ? "Guardando..." : "Guardar cambios"}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      disabled={editingBusy}
                      className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-700"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <p className="text-xs text-slate-500">{formatDate(video.createdAt)}</p>
                  <p className="text-xs font-medium text-indigo-700">
                    {videoCategoryLabel[video.category]}
                  </p>
                  <p className="mt-1 text-sm text-slate-700">{video.description}</p>
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-sm font-semibold text-blue-700 hover:underline"
                  >
                    Abrir video →
                  </a>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(video.id)}
                      className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteVideo(video.id)}
                      disabled={deletingId === video.id}
                      className="rounded border border-rose-300 px-3 py-1.5 text-sm text-rose-700 disabled:opacity-60"
                    >
                      {deletingId === video.id ? "Eliminando..." : "Eliminar"}
                    </button>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
