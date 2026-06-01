"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AdminImageUpload } from "@/components/admin/AdminImageUpload";
import { AdminMdxField } from "@/components/admin/AdminMdxField";
import { REPORT_CATEGORIES } from "@/lib/constants";

type AdminReport = {
  id: number;
  title: string;
  content: string;
  categories: string[];
  status: string;
  imageUrl: string | null;
};

const REPORT_STATUSES = ["pending", "reviewed", "published"] as const;

type Props = Readonly<{ report?: AdminReport }>;

export function AdminDenunciaForm({ report }: Props) {
  const isEdit = Boolean(report);
  const router = useRouter();
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [imageUrl, setImageUrl] = useState(report?.imageUrl ?? "");
  const [categories, setCategories] = useState<(typeof REPORT_CATEGORIES)[number][]>(
    report?.categories?.length ? (report.categories.filter((item): item is (typeof REPORT_CATEGORIES)[number] => REPORT_CATEGORIES.includes(item as (typeof REPORT_CATEGORIES)[number])) as (typeof REPORT_CATEGORIES)[number][]) : [REPORT_CATEGORIES[0]]
  );
  let submitLabel = "Crear";
  if (isEdit) submitLabel = "Guardar";
  if (busy) submitLabel = "Guardando...";

  function toggleCategory(category: (typeof REPORT_CATEGORIES)[number], checked: boolean) {
    setCategories((old) => {
      if (checked) {
        if (old.includes(category)) return old;
        return [...old, category];
      }
      const next = old.filter((item) => item !== category);
      return next.length ? next : old;
    });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice(null);
    if (!categories.length) {
      setBusy(false);
      setNotice("Selecciona al menos una categoria.");
      return;
    }
    const form = new FormData(event.currentTarget);
    const response = isEdit
      ? await fetch(`/api/reports/${report!.id}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.get("title"),
            content: form.get("content"),
            categories,
            imageUrl: imageUrl.trim() || null,
            status: form.get("status"),
          }),
        })
      : await fetch("/api/reports", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.get("title"),
            content: form.get("content"),
            categories,
            imageUrl: imageUrl.trim() || null,
          }),
        });

    if (!response.ok) {
      setBusy(false);
      setNotice(`No se pudo ${isEdit ? "guardar" : "crear"} la denuncia.`);
      return;
    }
    router.push(`/admin/denuncias?ok=${isEdit ? "updated" : "created"}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{isEdit ? "Editar denuncia" : "Nueva denuncia"}</h1>
        <Link href="/admin/denuncias" className="text-sm font-medium text-slate-600 hover:underline">
          ← Volver al listado
        </Link>
      </div>
      {notice ? <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-800">{notice}</p> : null}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <form onSubmit={onSubmit} className="grid gap-3">
          {isEdit ? (
            <>
              <input name="title" required defaultValue={report!.title} placeholder="Título" className="rounded border border-slate-300 px-3 py-2 text-sm" />
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium text-slate-700">Categorias (tags)</legend>
                <div className="flex flex-wrap gap-2">
                  {REPORT_CATEGORIES.map((category) => (
                    <label key={category} className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={categories.includes(category)}
                        onChange={(event) => toggleCategory(category, event.target.checked)}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      <span>{category}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <AdminImageUpload name="imageUrl" value={imageUrl} onUrlChange={setImageUrl} label="Imagen de la denuncia" allowManualUrl={false} />
              <AdminMdxField name="content" defaultValue={report!.content} required minHeight={220} label="Descripción" placeholder="Descripción" />
              <label className="text-sm text-slate-600">
                <span>Estado</span>
                <select name="status" defaultValue={report!.status} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm">
                  {REPORT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
            </>
          ) : (
            <>
              <input name="title" required placeholder="Título" className="rounded border border-slate-300 px-3 py-2 text-sm" />
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium text-slate-700">Categorias (tags)</legend>
                <div className="flex flex-wrap gap-2">
                  {REPORT_CATEGORIES.map((category) => (
                    <label key={category} className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={categories.includes(category)}
                        onChange={(event) => toggleCategory(category, event.target.checked)}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      <span>{category}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <AdminImageUpload name="imageUrl" value={imageUrl} onUrlChange={setImageUrl} label="Imagen de la denuncia" allowManualUrl={false} />
              <AdminMdxField name="content" defaultValue="" required minHeight={220} label="Descripción" placeholder="Descripción" />
            </>
          )}
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className="rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white">
              {submitLabel}
            </button>
            <Link href="/admin/denuncias" className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-700">
              Cancelar
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
