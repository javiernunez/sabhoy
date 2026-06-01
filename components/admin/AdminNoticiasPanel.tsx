"use client";

import { FormEvent, useState } from "react";
import { AdminImageUpload } from "@/components/admin/AdminImageUpload";
import { AdminMdxField } from "@/components/admin/AdminMdxField";

type AdminArticle = {
  id: number;
  title: string;
  titleVal: string | null;
  slug: string;
  content: string;
  contentVal: string | null;
  summary: string | null;
  summaryVal: string | null;
  imageUrl: string | null;
  category: string;
  isHero: boolean;
};

type Props = {
  readonly initialArticles: AdminArticle[];
};

const CATEGORY_OPTIONS = [
  { value: "GENERAL", label: "General" },
  { value: "POLITICA_LOCAL", label: "Politica local" },
  { value: "ELECCIONES_2027", label: "Elecciones 2027" },
  { value: "SUCESOS", label: "Sucesos" },
  { value: "CULTURA", label: "Cultura" },
  { value: "DEPORTE", label: "Deporte" },
] as const;

export function AdminNoticiasPanel({ initialArticles }: Props) {
  const [articles, setArticles] = useState(initialArticles);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingBusy, setEditingBusy] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editImageUrl, setEditImageUrl] = useState("");
  const [newArticleKey, setNewArticleKey] = useState(0);

  async function createArticle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice(null);
    const form = new FormData(event.currentTarget);
    const payload = {
      title: form.get("title"),
      titleVal: (form.get("titleVal") as string) || null,
      content: form.get("content"),
      contentVal: (form.get("contentVal") as string) || null,
      summary: (form.get("summary") as string) || null,
      summaryVal: (form.get("summaryVal") as string) || null,
      imageUrl: imageUrl.trim() || null,
      category: form.get("category") || "GENERAL",
      isHero: form.get("isHero") === "on",
    };

    const response = await fetch("/api/news", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setNotice("No se pudo crear la noticia.");
      setBusy(false);
      return;
    }

    const created = (await response.json()) as AdminArticle;
    setArticles((old) => [created, ...old]);
    setNotice("Noticia creada correctamente.");
    setImageUrl("");
    setNewArticleKey((k) => k + 1);
    event.currentTarget.reset();
    setBusy(false);
  }

  function startEdit(article: AdminArticle) {
    setNotice(null);
    setEditingId(article.id);
    setEditImageUrl(article.imageUrl ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditImageUrl("");
  }

  async function updateArticle(event: FormEvent<HTMLFormElement>, id: number) {
    event.preventDefault();
    setEditingBusy(true);
    setNotice(null);
    const form = new FormData(event.currentTarget);
    const payload = {
      title: form.get("title"),
      titleVal: (form.get("titleVal") as string) || null,
      content: form.get("content"),
      contentVal: (form.get("contentVal") as string) || null,
      summary: (form.get("summary") as string) || null,
      summaryVal: (form.get("summaryVal") as string) || null,
      imageUrl: editImageUrl.trim() || null,
      category: form.get("category") || "GENERAL",
      isHero: form.get("isHero") === "on",
    };

    const response = await fetch(`/api/news/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setNotice("No se pudo actualizar la noticia.");
      setEditingBusy(false);
      return;
    }

    const updated = (await response.json()) as AdminArticle;
    setArticles((old) => old.map((article) => (article.id === id ? updated : article)));
    setNotice("Noticia actualizada correctamente.");
    setEditingBusy(false);
    cancelEdit();
  }

  async function deleteArticle(id: number) {
    const confirmed = globalThis.confirm("¿Seguro que quieres eliminar esta noticia?");
    if (!confirmed) return;

    setDeletingId(id);
    setNotice(null);
    const response = await fetch(`/api/news/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      setNotice("No se pudo eliminar la noticia.");
      setDeletingId(null);
      return;
    }

    setArticles((old) => old.filter((article) => article.id !== id));
    setNotice("Noticia eliminada.");
    if (editingId === id) cancelEdit();
    setDeletingId(null);
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Noticias</h1>
      {notice ? <p className="rounded bg-blue-50 px-3 py-2 text-sm text-blue-700">{notice}</p> : null}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Crear noticia</h2>
        <form onSubmit={createArticle} className="mt-4 grid gap-3">
          <input
            name="title"
            required
            placeholder="Titulo (CAST)"
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            name="titleVal"
            placeholder="Titol (VAL)"
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
          <AdminMdxField
            key={`new-summary-cast-${newArticleKey}`}
            name="summary"
            defaultValue=""
            minHeight={200}
            label="Resumen (CAST) — cards y SEO"
            placeholder="Resumen corto (texto o formato)"
          />
          <AdminMdxField
            key={`new-summary-val-${newArticleKey}`}
            name="summaryVal"
            defaultValue=""
            minHeight={200}
            label="Resum (VAL) — card i SEO"
            placeholder="Resum curt (text o format)"
          />
          <label className="text-sm text-slate-600">
            <span>Categoria</span>
            <select name="category" className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm">
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="isHero" className="rounded border-slate-300" />
            <span>Destacar en portada (heroe)</span>
          </label>
          <AdminMdxField
            key={`new-content-cast-${newArticleKey}`}
            name="content"
            defaultValue=""
            required
            placeholder="Contenido CAST"
            minHeight={360}
            diffSourceViewMode="source"
            label="Cuerpo (CAST) — Markdown por defecto; «Texto enriquecido» para edición visual"
          />
          <AdminMdxField
            key={`new-content-val-${newArticleKey}`}
            name="contentVal"
            defaultValue=""
            placeholder="Contingut VAL"
            minHeight={360}
            diffSourceViewMode="source"
            label="Cos (VAL) — Markdown per defecte; «Text enriquit» per a edició visual"
          />
          <AdminImageUpload name="imageUrl" value={imageUrl} onUrlChange={setImageUrl} />
          <button
            type="submit"
            disabled={busy}
            className="w-fit rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
          >
            {busy ? "Guardando..." : "Guardar noticia"}
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Noticias publicadas</h2>
        <div className="mt-4 space-y-3">
          {articles.map((article) => (
            <article key={article.id} className="rounded border border-slate-200 p-3">
              {editingId === article.id ? (
                <form className="grid gap-3" onSubmit={(event) => void updateArticle(event, article.id)}>
                  <input
                    name="title"
                    required
                    defaultValue={article.title}
                    placeholder="Titulo (CAST)"
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  />
                  <input
                    name="titleVal"
                    defaultValue={article.titleVal ?? ""}
                    placeholder="Titol (VAL)"
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  />
                  <AdminMdxField
                    key={`edit-article-${article.id}-summary`}
                    name="summary"
                    defaultValue={article.summary ?? ""}
                    minHeight={200}
                    label="Resumen (CAST) — cards y SEO"
                    placeholder="Resumen corto (texto o formato)"
                  />
                  <AdminMdxField
                    key={`edit-article-${article.id}-summaryVal`}
                    name="summaryVal"
                    defaultValue={article.summaryVal ?? ""}
                    minHeight={200}
                    label="Resum (VAL) — card i SEO"
                    placeholder="Resum curt (text o format)"
                  />
                  <label className="text-sm text-slate-600">
                    <span>Categoria</span>
                    <select
                      name="category"
                      defaultValue={article.category}
                      className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                    >
                      {CATEGORY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" name="isHero" defaultChecked={article.isHero} className="rounded border-slate-300" />
                    <span>Destacar en portada (heroe)</span>
                  </label>
                  <AdminMdxField
                    key={`edit-article-${article.id}-content`}
                    name="content"
                    defaultValue={article.content}
                    required
                    minHeight={360}
                    diffSourceViewMode="source"
                    label="Cuerpo (CAST) — Markdown por defecto; «Texto enriquecido» para edición visual"
                    placeholder="Contenido CAST"
                  />
                  <AdminMdxField
                    key={`edit-article-${article.id}-contentVal`}
                    name="contentVal"
                    defaultValue={article.contentVal ?? ""}
                    minHeight={360}
                    diffSourceViewMode="source"
                    label="Cos (VAL) — Markdown per defecte; «Text enriquit» per a edició visual"
                    placeholder="Contingut VAL"
                  />
                  <AdminImageUpload name="imageUrl" value={editImageUrl} onUrlChange={setEditImageUrl} />
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
                  <h3 className="font-semibold">{article.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {article.category} {article.isHero ? "· Hero" : ""} · /{article.slug}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(article)}
                      className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteArticle(article.id)}
                      disabled={deletingId === article.id}
                      className="rounded border border-rose-300 px-3 py-1.5 text-sm text-rose-700 disabled:opacity-60"
                    >
                      {deletingId === article.id ? "Eliminando..." : "Eliminar"}
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
