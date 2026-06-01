"use client";

import type { EventCategory, Prisma } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AdminImageUpload } from "@/components/admin/AdminImageUpload";
import { AdminMdxField } from "@/components/admin/AdminMdxField";
import { EVENT_CATEGORY_OPTIONS, parseDetailsFromDb, type FeriaDetails, type TeatroDetails } from "@/lib/event-category";

type AdminEvent = {
  id: number;
  title: string;
  titleVal: string | null;
  description: string;
  descriptionVal: string | null;
  eventDate: string | Date;
  imageUrl: string | null;
  linkUrl: string | null;
  category: EventCategory;
  details: Prisma.JsonValue | null;
};

type Props = { eventItem?: AdminEvent };

function toDateInputValue(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function AdminEventoForm({ eventItem }: Props) {
  const isEdit = Boolean(eventItem);
  const router = useRouter();
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [imageUrl, setImageUrl] = useState(eventItem?.imageUrl ?? "");

  const initialCategory = eventItem?.category ?? "generico";
  const [category, setCategory] = useState<EventCategory>(initialCategory);

  const teatroSeed = parseDetailsFromDb("teatro", eventItem?.details) as TeatroDetails;
  const feriaSeed = parseDetailsFromDb("feria", eventItem?.details) as FeriaDetails;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice(null);
    const form = new FormData(event.currentTarget);
    let detailsPayload: Record<string, string> | null = null;

    if (category === "teatro") {
      const startTime = String(form.get("startTime") ?? "").trim();
      const theaterCompany = String(form.get("theaterCompany") ?? "").trim();
      const theaterCompanyVal = String(form.get("theaterCompanyVal") ?? "").trim();
      const o: Record<string, string> = {};
      if (startTime) o.startTime = startTime;
      if (theaterCompany) o.theaterCompany = theaterCompany;
      if (theaterCompanyVal) o.theaterCompanyVal = theaterCompanyVal;
      detailsPayload = Object.keys(o).length ? o : null;
    } else if (category === "feria") {
      const endDate = String(form.get("feriaEndDate") ?? "").trim();
      detailsPayload = endDate ? { endDate } : null;
    }

    const payload = {
      title: form.get("title"),
      titleVal: form.get("titleVal"),
      description: form.get("description"),
      descriptionVal: form.get("descriptionVal"),
      eventDate: form.get("eventDate"),
      imageUrl: imageUrl.trim() || null,
      linkUrl: (form.get("linkUrl") as string)?.trim() || null,
      category,
      details: detailsPayload,
    };

    const url = isEdit ? `/api/eventos/${eventItem!.id}` : "/api/eventos";
    const method = isEdit ? "PATCH" : "POST";
    const response = await fetch(url, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      setBusy(false);
      const bodyJson = await response.json().catch(() => null);
      const msg = bodyJson?.error && typeof bodyJson.error === "string" ? bodyJson.error : null;
      setNotice(msg ?? `No se pudo ${isEdit ? "guardar" : "crear"} el evento.`);
      return;
    }
    router.push(`/admin/eventos?ok=${isEdit ? "updated" : "created"}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{isEdit ? "Editar evento" : "Nuevo evento"}</h1>
        <Link href="/admin/eventos" className="text-sm font-medium text-slate-600 hover:underline">
          ← Volver al listado
        </Link>
      </div>
      {notice ? <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-800">{notice}</p> : null}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <form onSubmit={onSubmit} className="grid gap-3">
          <label className="text-sm text-slate-600">
            <span className="font-medium">Categoría</span>
            <select
              name="categoryUi"
              value={category}
              onChange={(e) => setCategory(e.target.value as EventCategory)}
              className="mt-1 block w-full max-w-md rounded border border-slate-300 px-3 py-2 text-sm"
            >
              {EVENT_CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.labelEs}
                </option>
              ))}
            </select>
          </label>
          <p className="text-xs text-slate-500">
            <strong>Teatro:</strong> hora y compañía. <strong>Feria:</strong> último día (la fecha de arriba es el inicio); se calcula la duración en días.
          </p>
          <input
            name="title"
            required
            defaultValue={eventItem?.title ?? ""}
            placeholder="Título (castellano)"
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            name="titleVal"
            defaultValue={eventItem?.titleVal ?? ""}
            placeholder="Títol (valencià, opcional)"
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
          <AdminMdxField
            name="description"
            defaultValue={eventItem?.description ?? ""}
            required
            minHeight={280}
            label="Descripción (CAST) — editor visual"
            placeholder="Descripción del evento"
          />
          <AdminMdxField
            name="descriptionVal"
            defaultValue={eventItem?.descriptionVal ?? ""}
            minHeight={240}
            label="Descripció (VAL) — editor visual"
            placeholder="Descripció de l'esdeveniment"
          />
          <label className="text-sm text-slate-600">
            <span>Fecha {category === "feria" ? "de inicio" : "del evento"}</span>
            <input
              type="date"
              name="eventDate"
              required
              defaultValue={eventItem?.eventDate ? toDateInputValue(eventItem.eventDate) : ""}
              className="mt-1 w-full max-w-xs rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          {category === "teatro" ? (
            <div className="space-y-2 rounded-lg border border-blue-100 bg-blue-50/40 p-3">
              <p className="text-sm font-semibold text-slate-800">Teatro</p>
              <input
                name="startTime"
                defaultValue={teatroSeed.startTime ?? ""}
                placeholder="Hora de inicio (ej. 20:00)"
                className="w-full max-w-[12rem] rounded border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                name="theaterCompany"
                defaultValue={teatroSeed.theaterCompany ?? ""}
                placeholder="Compañía de teatro (castellano)"
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                name="theaterCompanyVal"
                defaultValue={teatroSeed.theaterCompanyVal ?? ""}
                placeholder="Companyia (valencià, opcional)"
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          ) : null}

          {category === "feria" ? (
            <div className="space-y-2 rounded-lg border border-amber-100 bg-amber-50/40 p-3">
              <p className="text-sm font-semibold text-slate-800">Feria o festival</p>
              <label className="block text-sm text-slate-600">
                <span>Último día (inclusive)</span>
                <input
                  type="date"
                  name="feriaEndDate"
                  required
                  defaultValue={feriaSeed.endDate ?? ""}
                  className="mt-1 w-full max-w-xs rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
            </div>
          ) : null}

          <AdminImageUpload name="imageUrl" value={imageUrl} onUrlChange={setImageUrl} />
          <input
            type="url"
            name="linkUrl"
            defaultValue={eventItem?.linkUrl ?? ""}
            placeholder="URL (opcional)"
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
              {busy ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear evento"}
            </button>
            <Link href="/admin/eventos" className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-700">
              Cancelar
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
