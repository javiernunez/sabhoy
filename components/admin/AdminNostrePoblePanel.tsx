"use client";

import { FormEvent, useState } from "react";
import type { NostrePoblePage, PoblePageCategory } from "@prisma/client";
import { AdminImageUpload } from "@/components/admin/AdminImageUpload";
import { AdminMdxField } from "@/components/admin/AdminMdxField";

const CATEGORIES: PoblePageCategory[] = ["MONUMENTS", "TRADITIONS", "HISTORY", "MAYORS", "OTHER"];

type Props = { initialPages: NostrePoblePage[] };

export function AdminNostrePoblePanel({ initialPages }: Props) {
  const [pages, setPages] = useState(initialPages);
  const [notice, setNotice] = useState<string | null>(null);
  const [newPageKey, setNewPageKey] = useState(0);
  const [newHeaderImageUrl, setNewHeaderImageUrl] = useState("");
  const [headerImageByPageId, setHeaderImageByPageId] = useState<Record<number, string>>(() =>
    Object.fromEntries(initialPages.map((p) => [p.id, p.imageUrl ?? ""])),
  );

  async function createPage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      category: form.get("category") as PoblePageCategory,
      title: form.get("title"),
      titleVal: (form.get("titleVal") as string) || null,
      slug: (form.get("slug") as string) || undefined,
      summary: (form.get("summary") as string) || null,
      summaryVal: (form.get("summaryVal") as string) || null,
      content: form.get("content"),
      contentVal: (form.get("contentVal") as string) || null,
      imageUrl: newHeaderImageUrl.trim() || null,
      sortOrder: Number(form.get("sortOrder") || 0),
    };
    const res = await fetch("/api/nostre-poble", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      setNotice("No se pudo crear la pagina.");
      return;
    }
    const created = (await res.json()) as NostrePoblePage;
    setPages((old) => [...old, created].sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title)));
    setHeaderImageByPageId((m) => ({ ...m, [created.id]: created.imageUrl ?? "" }));
    setNotice("Pagina creada.");
    setNewPageKey((k) => k + 1);
    setNewHeaderImageUrl("");
    event.currentTarget.reset();
  }

  async function savePage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const id = Number(form.get("id"));
    const payload = {
      category: form.get("category") as PoblePageCategory,
      title: form.get("title"),
      titleVal: (form.get("titleVal") as string) || null,
      slug: form.get("slug"),
      summary: (form.get("summary") as string) || null,
      summaryVal: (form.get("summaryVal") as string) || null,
      content: form.get("content"),
      contentVal: (form.get("contentVal") as string) || null,
      imageUrl: (headerImageByPageId[id] ?? "").trim() || null,
      sortOrder: Number(form.get("sortOrder") || 0),
      isPublished: form.get("isPublished") === "on",
    };
    const res = await fetch(`/api/nostre-poble/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      setNotice("No se pudo guardar.");
      return;
    }
    const updated = (await res.json()) as NostrePoblePage;
    setPages((old) => old.map((p) => (p.id === updated.id ? updated : p)));
    setHeaderImageByPageId((m) => ({ ...m, [updated.id]: updated.imageUrl ?? "" }));
    setNotice("Guardado.");
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">El Nostre Poble (contenidos)</h1>
      {notice ? <p className="rounded bg-blue-50 px-3 py-2 text-sm text-blue-700">{notice}</p> : null}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Nueva pagina</h2>
        <p className="mt-2 text-sm text-slate-500">
          Bloques con titular <code className="rounded bg-slate-100 px-1">##</code> o secciones separadas con <code className="rounded bg-slate-100 px-1">---</code> en su
          propia linea. Si no, el texto se parte por dobles saltos.
        </p>
        <form onSubmit={createPage} className="mt-4 grid gap-2">
          <select name="category" required className="rounded border border-slate-300 px-3 py-2 text-sm">
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input name="title" required placeholder="Titulo (CAST)" className="rounded border border-slate-300 px-3 py-2 text-sm" />
          <input name="titleVal" placeholder="Titol (VAL)" className="rounded border border-slate-300 px-3 py-2 text-sm" />
          <input name="slug" placeholder="slug (opcional, se genera del titulo)" className="rounded border border-slate-300 px-3 py-2 text-sm" />
          <AdminMdxField
            key={`np-new-summary-${newPageKey}`}
            name="summary"
            defaultValue=""
            minHeight={160}
            label="Resumen SEO (CAST)"
            placeholder="Resumen (opcional)"
          />
          <AdminMdxField
            key={`np-new-summaryVal-${newPageKey}`}
            name="summaryVal"
            defaultValue=""
            minHeight={160}
            label="Resum SEO (VAL)"
            placeholder="Resum (opcional)"
          />
          <AdminImageUpload
            name="imageUrl"
            value={newHeaderImageUrl}
            onUrlChange={setNewHeaderImageUrl}
            label="Imagen de cabecera (opcional)"
          />
          <input name="sortOrder" type="number" placeholder="Orden" defaultValue={0} className="rounded border border-slate-300 px-3 py-2 text-sm" />
          <AdminMdxField
            key={`np-new-c-${newPageKey}`}
            name="content"
            defaultValue=""
            required
            minHeight={400}
            label="Cuerpo (CAST)"
            placeholder="Contenido"
          />
          <AdminMdxField
            key={`np-new-cv-${newPageKey}`}
            name="contentVal"
            defaultValue=""
            minHeight={400}
            label="Cos (VAL)"
            placeholder="Contingut"
          />
          <button type="submit" className="rounded bg-slate-800 px-3 py-2 text-sm font-medium text-white">
            Crear
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Editar</h2>
        <div className="mt-4 space-y-6">
          {pages.map((page) => (
            <form key={page.id} onSubmit={savePage} className="rounded border border-slate-200 p-4">
              <input type="hidden" name="id" value={page.id} />
              <label className="text-xs text-slate-500">Categoria</label>
              <select name="category" defaultValue={page.category} className="mb-2 block w-full rounded border border-slate-300 px-3 py-2 text-sm">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <div className="grid gap-2 md:grid-cols-2">
                <input name="title" defaultValue={page.title} className="rounded border border-slate-300 px-3 py-2 text-sm" />
                <input name="titleVal" defaultValue={page.titleVal ?? ""} className="rounded border border-slate-300 px-3 py-2 text-sm" />
                <input name="slug" defaultValue={page.slug} className="rounded border border-slate-300 px-3 py-2 text-sm" />
                <div className="md:col-span-2">
                  <AdminImageUpload
                    name="imageUrl"
                    value={headerImageByPageId[page.id] ?? page.imageUrl ?? ""}
                    onUrlChange={(url) => setHeaderImageByPageId((m) => ({ ...m, [page.id]: url }))}
                    label="Imagen de cabecera (opcional)"
                  />
                </div>
              </div>
              <AdminMdxField
                key={`np-s-${page.id}`}
                name="summary"
                defaultValue={page.summary ?? ""}
                minHeight={160}
                className="mt-2"
                label="Resumen SEO (CAST)"
                placeholder="Resumen (opcional)"
              />
              <AdminMdxField
                key={`np-sv-${page.id}`}
                name="summaryVal"
                defaultValue={page.summaryVal ?? ""}
                minHeight={160}
                className="mt-2"
                label="Resum SEO (VAL)"
                placeholder="Resum (opcional)"
              />
              <input name="sortOrder" type="number" defaultValue={page.sortOrder} className="mt-2 w-32 rounded border border-slate-300 px-3 py-2 text-sm" />
              <AdminMdxField
                key={`np-c-${page.id}`}
                name="content"
                defaultValue={page.content}
                required
                minHeight={400}
                className="mt-2"
                label="Cuerpo (CAST)"
                placeholder="Contenido"
              />
              <AdminMdxField
                key={`np-cv-${page.id}`}
                name="contentVal"
                defaultValue={page.contentVal ?? ""}
                minHeight={400}
                className="mt-2"
                label="Cos (VAL)"
                placeholder="Contingut"
              />
              <label className="mt-2 flex items-center gap-2 text-sm">
                <input type="checkbox" name="isPublished" defaultChecked={page.isPublished} />
                Publicada
              </label>
              <a
                href={`/el-nostre-poble/${page.slug}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-sm text-blue-700 hover:underline"
              >
                Ver en web
              </a>
              <button type="submit" className="ml-3 mt-2 rounded bg-slate-800 px-3 py-2 text-sm text-white">
                Guardar
              </button>
            </form>
          ))}
        </div>
      </section>
    </div>
  );
}
