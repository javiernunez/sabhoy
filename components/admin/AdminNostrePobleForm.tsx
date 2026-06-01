"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import type { NostrePoblePage, PoblePageCategory } from "@prisma/client";
import { AdminImageUpload } from "@/components/admin/AdminImageUpload";
import { AdminMdxField } from "@/components/admin/AdminMdxField";

const CATEGORIES: PoblePageCategory[] = ["MONUMENTS", "TRADITIONS", "HISTORY", "MAYORS", "OTHER"];

type Props = { page?: NostrePoblePage };

export function AdminNostrePobleForm({ page }: Props) {
  const isEdit = Boolean(page);
  const router = useRouter();
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [imageUrl, setImageUrl] = useState(page?.imageUrl ?? "");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice(null);
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
      imageUrl: imageUrl.trim() || null,
      sortOrder: Number(form.get("sortOrder") || 0),
      isPublished: form.get("isPublished") === "on",
    };
    const url = isEdit ? `/api/nostre-poble/${page!.id}` : "/api/nostre-poble";
    const method = isEdit ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      setBusy(false);
      setNotice(`No se pudo ${isEdit ? "guardar" : "crear"} la página.`);
      return;
    }
    router.push(`/admin/nostre-poble?ok=${isEdit ? "updated" : "created"}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{isEdit ? "Editar página" : "Nueva página"}</h1>
        <Link href="/admin/nostre-poble" className="text-sm font-medium text-slate-600 hover:underline">
          ← Volver al listado
        </Link>
      </div>
      {notice ? <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-800">{notice}</p> : null}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <form onSubmit={onSubmit} className="grid gap-2">
          <select name="category" required defaultValue={page?.category ?? "MONUMENTS"} className="rounded border border-slate-300 px-3 py-2 text-sm">
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input name="title" required defaultValue={page?.title ?? ""} placeholder="Titulo (CAST)" className="rounded border border-slate-300 px-3 py-2 text-sm" />
          <input name="titleVal" defaultValue={page?.titleVal ?? ""} placeholder="Titol (VAL)" className="rounded border border-slate-300 px-3 py-2 text-sm" />
          <input name="slug" defaultValue={page?.slug ?? ""} placeholder="slug (opcional)" className="rounded border border-slate-300 px-3 py-2 text-sm" />
          <AdminMdxField name="summary" defaultValue={page?.summary ?? ""} minHeight={160} label="Resumen SEO (CAST)" placeholder="Resumen (opcional)" />
          <AdminMdxField name="summaryVal" defaultValue={page?.summaryVal ?? ""} minHeight={160} label="Resum SEO (VAL)" placeholder="Resum (opcional)" />
          <AdminImageUpload name="imageUrl" value={imageUrl} onUrlChange={setImageUrl} label="Imagen de cabecera (opcional)" />
          <input name="sortOrder" type="number" defaultValue={page?.sortOrder ?? 0} placeholder="Orden" className="rounded border border-slate-300 px-3 py-2 text-sm" />
          <AdminMdxField name="content" defaultValue={page?.content ?? ""} required minHeight={400} label="Cuerpo (CAST)" placeholder="Contenido" />
          <AdminMdxField name="contentVal" defaultValue={page?.contentVal ?? ""} minHeight={400} label="Cos (VAL)" placeholder="Contingut" />
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input type="checkbox" name="isPublished" defaultChecked={page?.isPublished ?? true} />
            Publicada
          </label>
          <div className="mt-2 flex gap-2">
            <button type="submit" disabled={busy} className="rounded bg-slate-800 px-3 py-2 text-sm font-medium text-white">
              {busy ? "Guardando..." : isEdit ? "Guardar" : "Crear"}
            </button>
            <Link href="/admin/nostre-poble" className="rounded border border-slate-300 px-3 py-2 text-sm text-slate-700">
              Cancelar
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
