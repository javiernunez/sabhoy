"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AdminMdxField } from "@/components/admin/AdminMdxField";

type PageModel = {
  id: number;
  title: string;
  titleVal: string | null;
  slug: string;
  content: string;
  contentVal: string | null;
  isHighlighted: boolean;
};

type Props = {
  page?: PageModel;
};

export function AdminPaginaEditForm({ page }: Props) {
  const router = useRouter();
  const [notice, setNotice] = useState<string | null>(null);
  const isEdit = Boolean(page);

  async function saveEvergreen(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    const form = new FormData(event.currentTarget);
    const payload = {
      title: form.get("title"),
      titleVal: (form.get("titleVal") as string) || null,
      slug: form.get("slug"),
      content: form.get("content"),
      contentVal: (form.get("contentVal") as string) || null,
      isHighlighted: form.get("isHighlighted") === "on",
    };

    const response = await fetch(isEdit ? `/api/evergreen/${page!.id}` : "/api/evergreen", {
      method: isEdit ? "PATCH" : "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setNotice(`No se pudo ${isEdit ? "guardar" : "crear"} la página.`);
      return;
    }

    router.push(`/admin/paginas?ok=${isEdit ? "updated" : "created"}`);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{isEdit ? "Editar página" : "Nueva página"}</h1>
        <Link
          href="/admin/paginas"
          className="text-sm font-medium text-slate-600 underline-offset-2 hover:underline"
        >
          ← Volver al listado
        </Link>
      </div>

      {notice ? <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-800">{notice}</p> : null}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          {isEdit ? page!.title : "Crear ficha evergreen"}
          {isEdit ? <span className="ml-2 font-normal text-slate-500">(ID {page!.id})</span> : null}
        </h2>
        <form onSubmit={saveEvergreen} className="mt-4 space-y-3">
          <div className="grid gap-2 md:grid-cols-2">
            <div>
              <label className="text-xs text-slate-500">Título (CAST)</label>
              <input
                name="title"
                defaultValue={page?.title ?? ""}
                className="mt-0.5 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Títol (VAL)</label>
              <input
                name="titleVal"
                defaultValue={page?.titleVal ?? ""}
                className="mt-0.5 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-slate-500">Slug (URL)</label>
              <input
                name="slug"
                defaultValue={page?.slug ?? ""}
                className="mt-0.5 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <AdminMdxField
            key="eg-content"
            name="content"
            defaultValue={page?.content ?? ""}
            minHeight={320}
            className="mt-2"
            label="Contenido (CAST) — editor visual"
            placeholder="Contenido CAST"
          />
          <AdminMdxField
            key="eg-contentVal"
            name="contentVal"
            defaultValue={page?.contentVal ?? ""}
            minHeight={320}
            className="mt-2"
            label="Contingut (VAL) — editor visual"
            placeholder="Contingut VAL"
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isHighlighted" defaultChecked={page?.isHighlighted ?? false} />
            Destacar en portada
          </label>
          <div className="flex flex-wrap gap-3 pt-2">
            <button type="submit" className="rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white">
              Guardar página
            </button>
            <Link
              href="/admin/paginas"
              className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
