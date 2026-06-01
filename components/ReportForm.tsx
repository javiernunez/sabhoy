"use client";

import { FormEvent, useState } from "react";
import { AdminMdxField } from "@/components/admin/AdminMdxField";
import { REPORT_CATEGORIES } from "@/lib/constants";
import type { Locale } from "@/lib/i18n";

type ReportFormState = {
  title: string;
  description: string;
  categories: (typeof REPORT_CATEGORIES)[number][];
  imageUrl: string;
  anonymous: boolean;
};

const initialState: ReportFormState = {
  title: "",
  description: "",
  categories: [REPORT_CATEGORIES[0]],
  imageUrl: "",
  anonymous: true,
};

type ReportFormProps = {
  locale?: Locale;
};

export function ReportForm({ locale = "es" }: Readonly<ReportFormProps>) {
  const [form, setForm] = useState(initialState);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [descriptionKey, setDescriptionKey] = useState(0);
  const isVal = locale === "val";
  let submitLabel = isVal ? "Enviar denúncia" : "Enviar denuncia";
  if (loading) submitLabel = isVal ? "Enviant..." : "Enviando...";

  function toggleCategory(category: (typeof REPORT_CATEGORIES)[number], checked: boolean) {
    setForm((old) => {
      if (checked) {
        if (old.categories.includes(category)) return old;
        return { ...old, categories: [...old.categories, category] };
      }
      return { ...old, categories: old.categories.filter((item) => item !== category) };
    });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.description.trim()) {
      setMessage(isVal ? "La descripció és obligatòria." : "La descripción es obligatoria.");
      return;
    }
    if (!form.categories.length) {
      setMessage(isVal ? "Selecciona almenys una categoria." : "Selecciona al menos una categoria.");
      return;
    }
    setLoading(true);
    setMessage(null);

    const response = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      setMessage(isVal ? "No s'ha pogut enviar la denúncia." : "No se pudo enviar la denuncia.");
      setLoading(false);
      return;
    }

    setForm(initialState);
    setDescriptionKey((k) => k + 1);
    setMessage(isVal ? "Denúncia enviada. Queda en revisió per l'equip." : "Denuncia enviada. Queda en revision por el equipo.");
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <label className="mb-1 block text-sm font-medium">{isVal ? "Títol" : "Titulo"}</label>
        <input
          required
          value={form.title}
          onChange={(event) => setForm((old) => ({ ...old, title: event.target.value }))}
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <AdminMdxField
          value={form.description}
          onValueChange={(description) => setForm((old) => ({ ...old, description }))}
          editorKey={descriptionKey}
          minHeight={240}
          label={isVal ? "Descripció" : "Descripcion"}
        />
        <p className="mt-1 text-xs text-slate-500">
          {isVal ? "Pots formatear el text, afegir enllaços i pujar imatges inserint-les al cos." : "Puedes formatear el texto, enlaces e insertar imágenes subiéndolas al escribir."}
        </p>
      </div>

      <fieldset>
        <legend className="mb-1 block text-sm font-medium">{isVal ? "Categories (tags)" : "Categorias (tags)"}</legend>
        <div className="flex flex-wrap gap-2">
          {REPORT_CATEGORIES.map((category) => {
            const checked = form.categories.includes(category);
            return (
              <label key={category} className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => toggleCategory(category, event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <span>{category}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label className="mb-1 block text-sm font-medium">{isVal ? "Imatge (URL opcional)" : "Imagen (URL opcional)"}</label>
        <input
          value={form.imageUrl}
          onChange={(event) => setForm((old) => ({ ...old, imageUrl: event.target.value }))}
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <label className="flex items-start gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={form.anonymous}
          onChange={(event) => setForm((old) => ({ ...old, anonymous: event.target.checked }))}
          className="mt-0.5 h-4 w-4 rounded border-slate-300"
        />
        <span>
          {isVal
            ? "Enviar com a denúncia anònima (no s'associa al teu compte)."
            : "Enviar como denuncia anonima (no se asocia a tu cuenta)."}
        </span>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {submitLabel}
      </button>

      {message ? <p className="text-sm text-slate-700">{message}</p> : null}
    </form>
  );
}
