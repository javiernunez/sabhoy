"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";
import { AdminDataTable } from "@/components/admin/AdminDataTable";

type NewsRow = {
  id: number;
  title: string;
  status: string;
};

type PortadaItem = {
  id: number;
  title: string;
};

type Props = {
  initialArticles: NewsRow[];
  initialPortadaItems: PortadaItem[];
  notice?: string | null;
};

function moveItem<T>(list: T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex === toIndex) return list;
  const copy = [...list];
  const [removed] = copy.splice(fromIndex, 1);
  if (removed === undefined) return list;
  copy.splice(toIndex, 0, removed);
  return copy;
}

export function AdminNoticiasList({ initialArticles, initialPortadaItems, notice }: Readonly<Props>) {
  const router = useRouter();
  const [articles, setArticles] = useState(initialArticles);
  const [portadaItems, setPortadaItems] = useState(initialPortadaItems);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [toggleBusyId, setToggleBusyId] = useState<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [portadaSaving, setPortadaSaving] = useState(false);
  const [portadaError, setPortadaError] = useState<string | null>(null);

  useEffect(() => {
    setArticles(initialArticles);
  }, [initialArticles]);

  useEffect(() => {
    setPortadaItems(initialPortadaItems);
  }, [initialPortadaItems]);

  const selected = articles.find((a) => a.id === deleteId) ?? null;

  async function confirmDelete() {
    if (!selected) return;
    setBusy(true);
    const response = await fetch(`/api/news/${selected.id}`, { method: "DELETE", credentials: "include" });
    if (!response.ok) {
      setBusy(false);
      return;
    }
    setArticles((old) => old.filter((item) => item.id !== selected.id));
    setPortadaItems((items) => items.filter((x) => x.id !== selected.id));
    setDeleteId(null);
    setBusy(false);
    router.refresh();
  }

  const persistPortadaOrder = useCallback(async (next: PortadaItem[]) => {
    setPortadaSaving(true);
    setPortadaError(null);
    try {
      const res = await fetch("/api/news/reorder-portada", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: next.map((x) => x.id) }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        setPortadaError(typeof err.error === "string" ? err.error : "No se pudo guardar el orden.");
        return false;
      }
      router.refresh();
      return true;
    } finally {
      setPortadaSaving(false);
    }
  }, [router]);

  async function handleDropOnIndex(targetIndex: number) {
    if (dragIndex == null) return;
    if (dragIndex === targetIndex) {
      setDragIndex(null);
      return;
    }
    const prev = portadaItems;
    const next = moveItem(portadaItems, dragIndex, targetIndex);
    setDragIndex(null);
    setPortadaItems(next);
    const ok = await persistPortadaOrder(next);
    if (!ok) setPortadaItems(prev);
  }

  async function togglePublish(id: number, published: boolean) {
    setToggleBusyId(id);
    setPortadaError(null);
    const res = await fetch(`/api/news/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intent: "status", status: published ? "published" : "draft" }),
    });
    setToggleBusyId(null);
    if (!res.ok) return;
    const updated = (await res.json()) as { id: number; status: string; title: string };
    setArticles((old) => old.map((a) => (a.id === id ? { ...a, status: updated.status } : a)));
    setPortadaItems((items) => {
      if (published) {
        if (items.some((x) => x.id === id)) return items;
        return [{ id, title: updated.title }, ...items];
      }
      return items.filter((x) => x.id !== id);
    });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Noticias</h1>
        <Link href="/admin/noticias/nuevo" className="rounded bg-slate-800 px-3 py-2 text-sm font-medium text-white">
          Nuevo
        </Link>
      </div>
      {notice ? <p className="rounded bg-blue-50 px-3 py-2 text-sm text-blue-700">{notice}</p> : null}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Listado</h2>
        <AdminDataTable
          publishColumn
          rows={articles.map((article) => ({
            id: article.id,
            title: article.title,
            publishSwitch: (
              <label className="inline-flex cursor-pointer items-center gap-2 select-none">
                <span className="sr-only">Publicada</span>
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={article.status === "published"}
                  disabled={toggleBusyId === article.id}
                  onChange={(e) => void togglePublish(article.id, e.target.checked)}
                />
                <span
                  className="relative h-6 w-11 shrink-0 rounded-full bg-slate-300 transition peer-checked:bg-blue-600 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-2 peer-disabled:opacity-50 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5"
                  aria-hidden
                />
              </label>
            ),
            actions: (
              <>
                <Link href={`/admin/noticias/${article.id}`} className="inline-block rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700">
                  Editar
                </Link>
                <button
                  type="button"
                  onClick={() => setDeleteId(article.id)}
                  className="ml-2 inline-block rounded border border-rose-300 px-3 py-1.5 text-sm text-rose-700"
                >
                  Eliminar
                </button>
              </>
            ),
          }))}
        />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Orden en portada</h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          Las cuatro primeras noticias publicadas de esta lista son las que aparecen en la página de inicio. Arrastra para
          cambiar el orden (las de arriba salen antes). Solo noticias con «Publicada» activada.
        </p>
        {portadaError ? <p className="mt-2 text-sm text-rose-600">{portadaError}</p> : null}
        {portadaItems.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No hay noticias publicadas para ordenar.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200">
            {portadaItems.map((item, index) => (
              <li
                key={item.id}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => void handleDropOnIndex(index)}
                onDragEnd={() => setDragIndex(null)}
                className={`flex cursor-grab items-center gap-3 bg-white px-3 py-2.5 text-sm active:cursor-grabbing ${
                  dragIndex === index ? "bg-blue-50" : ""
                }`}
              >
                <span className="font-mono text-xs text-slate-400" aria-hidden>
                  ::
                </span>
                <span className="min-w-0 flex-1 font-medium text-slate-900">
                  <span className="text-slate-400">{index + 1}. </span>
                  {item.title}
                </span>
                <span className="shrink-0 text-xs text-slate-500">id {item.id}</span>
              </li>
            ))}
          </ul>
        )}
        {portadaSaving ? <p className="mt-2 text-xs text-slate-500">Guardando orden…</p> : null}
      </section>

      <AdminConfirmModal
        open={Boolean(selected)}
        title="Eliminar noticia"
        message={`Se eliminará "${selected?.title ?? ""}". Esta acción no se puede deshacer.`}
        busy={busy}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
