"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AdminImageUpload } from "@/components/admin/AdminImageUpload";
import { AdminMdxField } from "@/components/admin/AdminMdxField";
import { getArticlePublishedAt, toDatetimeLocalValue } from "@/lib/article-dates";

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
  status: string;
  isHero: boolean;
  publishedAt: Date;
  createdAt?: Date;
};

const CATEGORY_OPTIONS = [
  { value: "GENERAL", label: "General" },
  { value: "POLITICA_LOCAL", label: "Politica local" },
  { value: "ELECCIONES_2027", label: "Elecciones 2027" },
  { value: "SUCESOS", label: "Sucesos" },
  { value: "CULTURA", label: "Cultura" },
  { value: "DEPORTE", label: "Deporte" },
] as const;

type Props = {
  article?: AdminArticle;
};

export function AdminNoticiaForm({ article }: Props) {
  const isEdit = Boolean(article);
  const router = useRouter();
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [imageUrl, setImageUrl] = useState(article?.imageUrl ?? "");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
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
      status: form.get("status") || "published",
      isHero: form.get("isHero") === "on",
      publishedAt: form.get("publishedAt") || undefined,
    };
    const url = isEdit ? `/api/news/${article!.id}` : "/api/news";
    const method = isEdit ? "PATCH" : "POST";
    const response = await fetch(url, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      setBusy(false);
      setNotice(`No se pudo ${isEdit ? "guardar" : "crear"} la noticia.`);
      return;
    }
    router.push(`/admin/noticias?ok=${isEdit ? "updated" : "created"}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{isEdit ? "Editar noticia" : "Nueva noticia"}</h1>
        <Link href="/admin/noticias" className="text-sm font-medium text-slate-600 hover:underline">
          ← Volver al listado
        </Link>
      </div>
      {notice ? <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-800">{notice}</p> : null}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <form onSubmit={onSubmit} className="grid gap-3">
          <input name="title" required defaultValue={article?.title ?? ""} placeholder="Titulo (CAST)" className="w-full rounded border border-slate-300 px-3 py-2 text-sm" />
          <input name="titleVal" defaultValue={article?.titleVal ?? ""} placeholder="Titol (VAL)" className="w-full rounded border border-slate-300 px-3 py-2 text-sm" />
          <AdminMdxField name="summary" defaultValue={article?.summary ?? ""} minHeight={200} label="Resumen (CAST) — cards y SEO" placeholder="Resumen corto (texto o formato)" />
          <AdminMdxField name="summaryVal" defaultValue={article?.summaryVal ?? ""} minHeight={200} label="Resum (VAL) — card i SEO" placeholder="Resum curt (text o format)" />
          <label className="text-sm text-slate-600">
            <span>Categoria</span>
            <select name="category" defaultValue={article?.category ?? "GENERAL"} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm">
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-slate-600">
            <span>Estado</span>
            <select name="status" defaultValue={article?.status ?? "published"} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm">
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
            </select>
          </label>
          <label className="text-sm text-slate-600">
            <span>Fecha de publicación</span>
            <input
              type="datetime-local"
              name="publishedAt"
              defaultValue={toDatetimeLocalValue(
                article ? getArticlePublishedAt(article) : new Date(),
              )}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="isHero" defaultChecked={article?.isHero ?? false} className="rounded border-slate-300" />
            <span>Destacar en portada (heroe)</span>
          </label>
          <AdminMdxField
            name="content"
            defaultValue={article?.content ?? ""}
            required
            minHeight={360}
            diffSourceViewMode="source"
            label="Cuerpo (CAST) — Markdown por defecto; «Texto enriquecido» para edición visual"
            placeholder="Contenido CAST"
          />
          <AdminMdxField
            name="contentVal"
            defaultValue={article?.contentVal ?? ""}
            minHeight={360}
            diffSourceViewMode="source"
            label="Cos (VAL) — Markdown per defecte; «Text enriquit» per a edició visual"
            placeholder="Contingut VAL"
          />
          <AdminImageUpload name="imageUrl" value={imageUrl} onUrlChange={setImageUrl} />
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
              {busy ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear noticia"}
            </button>
            <Link href="/admin/noticias" className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-700">
              Cancelar
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
