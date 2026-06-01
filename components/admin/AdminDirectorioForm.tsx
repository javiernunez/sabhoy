"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { AdminImageUpload } from "@/components/admin/AdminImageUpload";
import { AdminMdxField } from "@/components/admin/AdminMdxField";

type DirectoryKind = "COMMERCE" | "SPORT" | "ASSOCIATION" | "POLITICS";

type AdminDirectoryCategory = {
  id: number;
  kind: DirectoryKind;
  name: string;
  nameVal?: string | null;
  parentId: number | null;
};

type AdminDirectoryEntry = {
  id: number;
  kind: DirectoryKind;
  name: string;
  nameVal: string | null;
  description: string;
  descriptionVal: string | null;
  imageUrl: string | null;
  websiteUrl: string | null;
  address: string | null;
  phone: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  icon: string | null;
  href: string | null;
  isActive: boolean;
  sortOrder: number;
  categoryLinks: { category: { id: number } }[];
};

type Props = {
  categories: AdminDirectoryCategory[];
  entry?: AdminDirectoryEntry;
  initialKind?: DirectoryKind;
};

function listingPathForKind(kind: DirectoryKind): string {
  if (kind === "COMMERCE") return "/admin/comercios";
  if (kind === "ASSOCIATION") return "/admin/asociaciones";
  return "/admin/directorio";
}

function kindLabel(kind: DirectoryKind): string {
  if (kind === "COMMERCE") return "Comercio";
  if (kind === "ASSOCIATION") return "Asociación";
  if (kind === "POLITICS") return "Política (partidos)";
  return "Deporte";
}

type CategoryFormState = {
  open: boolean;
  parentId: number | null;
  name: string;
  nameVal: string;
};

const EMPTY_CATEGORY_FORM: CategoryFormState = { open: false, parentId: null, name: "", nameVal: "" };

type CategoryPickerProps = {
  kind: DirectoryKind;
  categories: AdminDirectoryCategory[];
  selectedIds: number[];
  onToggle: (id: number) => void;
  onCategoryCreated: (category: AdminDirectoryCategory) => void;
};

function CategoryPicker({ kind, categories, selectedIds, onToggle, onCategoryCreated }: Readonly<CategoryPickerProps>) {
  const [form, setForm] = useState<CategoryFormState>(EMPTY_CATEGORY_FORM);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const current = categories.filter((c) => c.kind === kind);
    const parents = current.filter((c) => c.parentId == null);
    return parents
      .map((parent) => ({
        parent,
        children: current.filter((c) => c.parentId === parent.id),
      }))
      .sort((a, b) => a.parent.name.localeCompare(b.parent.name));
  }, [categories, kind]);

  const parentOptions = useMemo(
    () => categories.filter((c) => c.kind === kind && c.parentId == null).sort((a, b) => a.name.localeCompare(b.name)),
    [categories, kind],
  );

  function openNewCategory(parentId: number | null) {
    setError(null);
    setForm({ open: true, parentId, name: "", nameVal: "" });
  }

  function closeNewCategory() {
    setForm(EMPTY_CATEGORY_FORM);
    setError(null);
  }

  async function submitNewCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/local-directory/categories", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          name: form.name.trim(),
          nameVal: form.nameVal.trim() || null,
          parentId: form.parentId,
        }),
      });
      if (!response.ok) {
        setError("No se pudo crear la categoría.");
        setBusy(false);
        return;
      }
      const created = (await response.json()) as AdminDirectoryCategory;
      onCategoryCreated(created);
      closeNewCategory();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded border border-slate-200 bg-slate-50 p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-slate-700">Categorías (múltiples)</p>
        <button
          type="button"
          onClick={() => openNewCategory(null)}
          className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
        >
          + Nueva categoría raíz
        </button>
      </div>
      {grouped.length === 0 ? (
        <p className="text-sm text-slate-500">
          Todavía no hay categorías para este tipo. Pulsa “+ Nueva categoría raíz” para crear la primera.
        </p>
      ) : (
        <div className="space-y-3">
          {grouped.map(({ parent, children }) => (
            <fieldset key={parent.id} className="space-y-1 rounded border border-transparent p-1">
              <div className="flex items-center justify-between gap-2">
                <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">{parent.name}</legend>
                <button
                  type="button"
                  onClick={() => openNewCategory(parent.id)}
                  className="rounded border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:bg-slate-100"
                  title={`Crear subcategoría dentro de ${parent.name}`}
                >
                  + Subcategoría
                </button>
              </div>
              {children.length === 0 ? (
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={selectedIds.includes(parent.id)} onChange={() => onToggle(parent.id)} />
                  <span>{parent.name}</span>
                </label>
              ) : (
                children.map((child) => (
                  <label key={child.id} className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" checked={selectedIds.includes(child.id)} onChange={() => onToggle(child.id)} />
                    <span>{child.name}</span>
                  </label>
                ))
              )}
            </fieldset>
          ))}
        </div>
      )}

      {form.open ? (
        <form onSubmit={submitNewCategory} className="mt-3 space-y-2 rounded border border-blue-200 bg-white p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Nueva categoría · {kindLabel(kind)}
          </p>
          <div className="grid gap-2 md:grid-cols-2">
            <label className="text-xs text-slate-600">
              <span>Nombre (CAST)</span>
              <input
                value={form.name}
                onChange={(event) => setForm((old) => ({ ...old, name: event.target.value }))}
                required
                placeholder="Ej. Restaurantes"
                className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
              />
            </label>
            <label className="text-xs text-slate-600">
              <span>Nom (VAL) opcional</span>
              <input
                value={form.nameVal}
                onChange={(event) => setForm((old) => ({ ...old, nameVal: event.target.value }))}
                placeholder="Ej. Restaurants"
                className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
              />
            </label>
          </div>
          <label className="block text-xs text-slate-600">
            <span>Categoría padre (opcional)</span>
            <select
              value={form.parentId === null ? "" : String(form.parentId)}
              onChange={(event) => {
                const raw = event.target.value;
                setForm((old) => ({ ...old, parentId: raw ? Number(raw) : null }));
              }}
              className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
            >
              <option value="">Sin padre (raíz)</option>
              {parentOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>
          {error ? <p className="text-xs text-rose-700">{error}</p> : null}
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={busy}
              className="rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {busy ? "Creando..." : "Crear categoría"}
            </button>
            <button
              type="button"
              onClick={closeNewCategory}
              disabled={busy}
              className="rounded border border-slate-300 px-3 py-1.5 text-xs text-slate-700"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}

export function AdminDirectorioForm({ categories: initialCategories, entry, initialKind }: Readonly<Props>) {
  const isEdit = Boolean(entry);
  const router = useRouter();
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [kind, setKind] = useState<DirectoryKind>(entry?.kind ?? initialKind ?? "COMMERCE");
  const [categories, setCategories] = useState<AdminDirectoryCategory[]>(initialCategories);
  const [categoryIds, setCategoryIds] = useState<number[]>(entry?.categoryLinks.map((link) => link.category.id) ?? []);
  const [imageUrl, setImageUrl] = useState(entry?.imageUrl ?? "");

  function toggleCategory(id: number) {
    setCategoryIds((old) => (old.includes(id) ? old.filter((x) => x !== id) : [...old, id]));
  }

  function handleCategoryCreated(category: AdminDirectoryCategory) {
    setCategories((old) => [...old.filter((c) => c.id !== category.id), category]);
    if (category.kind === kind) {
      setCategoryIds((old) => (old.includes(category.id) ? old : [...old, category.id]));
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice(null);
    if (categoryIds.length === 0) {
      setNotice("Selecciona al menos una categoría.");
      setBusy(false);
      return;
    }
    const form = new FormData(event.currentTarget);
    const payload = {
      kind,
      name: form.get("name"),
      nameVal: (form.get("nameVal") as string) || null,
      categoryIds,
      description: form.get("description"),
      descriptionVal: (form.get("descriptionVal") as string) || null,
      websiteUrl: (form.get("websiteUrl") as string) || null,
      address: (form.get("address") as string) || null,
      phone: (form.get("phone") as string) || null,
      facebookUrl: (form.get("facebookUrl") as string) || null,
      instagramUrl: (form.get("instagramUrl") as string) || null,
      tiktokUrl: (form.get("tiktokUrl") as string) || null,
      href: (form.get("href") as string) || null,
      icon: (form.get("icon") as string) || null,
      imageUrl: imageUrl.trim() || null,
      isActive: form.get("isActive") === "on",
      sortOrder: Number(form.get("sortOrder") || 0),
    };
    const url = isEdit ? `/api/local-directory/${entry!.id}` : "/api/local-directory";
    const method = isEdit ? "PATCH" : "POST";
    const response = await fetch(url, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      setBusy(false);
      setNotice(`No se pudo ${isEdit ? "guardar" : "crear"} la entrada.`);
      return;
    }
    const target = `${listingPathForKind(kind)}?ok=${isEdit ? "updated" : "created"}`;
    router.push(target);
  }

  const backHref = listingPathForKind(entry?.kind ?? kind);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">
          {isEdit ? `Editar entrada · ${kindLabel(entry?.kind ?? kind)}` : `Nueva entrada · ${kindLabel(kind)}`}
        </h1>
        <Link href={backHref} className="text-sm font-medium text-slate-600 hover:underline">
          ← Volver al listado
        </Link>
      </div>
      {notice ? <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-800">{notice}</p> : null}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <form onSubmit={onSubmit} className="grid gap-3">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm text-slate-600">
              <span>Tipo</span>
              <select
                name="kind"
                value={kind}
                onChange={(event) => {
                  const next = event.target.value as DirectoryKind;
                  setKind(next);
                  setCategoryIds((old) => old.filter((id) => categories.some((c) => c.id === id && c.kind === next)));
                }}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="COMMERCE">Comercio</option>
                <option value="ASSOCIATION">Asociación</option>
                <option value="POLITICS">Política (partidos)</option>
              </select>
            </label>
            <input name="name" required defaultValue={entry?.name ?? ""} placeholder="Nombre (CAST)" className="rounded border border-slate-300 px-3 py-2 text-sm" />
            <input name="nameVal" defaultValue={entry?.nameVal ?? ""} placeholder="Nom (VAL)" className="rounded border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <CategoryPicker
            kind={kind}
            categories={categories}
            selectedIds={categoryIds}
            onToggle={toggleCategory}
            onCategoryCreated={handleCategoryCreated}
          />
          <input name="sortOrder" type="number" defaultValue={entry?.sortOrder ?? 0} placeholder="Orden" className="rounded border border-slate-300 px-3 py-2 text-sm" />
          <AdminMdxField name="description" defaultValue={entry?.description ?? ""} required minHeight={220} label="Descripcion (CAST) — editor visual" placeholder="Descripcion CAST" />
          <AdminMdxField name="descriptionVal" defaultValue={entry?.descriptionVal ?? ""} minHeight={220} label="Descripcio (VAL) — editor visual" placeholder="Descripcio VAL" />
          <div className="grid gap-3 md:grid-cols-2">
            <input name="websiteUrl" defaultValue={entry?.websiteUrl ?? ""} placeholder="Web oficial (opcional)" className="rounded border border-slate-300 px-3 py-2 text-sm" />
            <input name="href" defaultValue={entry?.href ?? ""} placeholder="Otro enlace (opcional)" className="rounded border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <input name="address" defaultValue={entry?.address ?? ""} placeholder="Dirección (opcional)" className="rounded border border-slate-300 px-3 py-2 text-sm" />
            <input name="phone" defaultValue={entry?.phone ?? ""} placeholder="Teléfono (opcional)" className="rounded border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <input name="facebookUrl" defaultValue={entry?.facebookUrl ?? ""} placeholder="Facebook (opcional)" className="rounded border border-slate-300 px-3 py-2 text-sm" />
            <input name="instagramUrl" defaultValue={entry?.instagramUrl ?? ""} placeholder="Instagram (opcional)" className="rounded border border-slate-300 px-3 py-2 text-sm" />
            <input name="tiktokUrl" defaultValue={entry?.tiktokUrl ?? ""} placeholder="TikTok (opcional)" className="rounded border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <input name="icon" defaultValue={entry?.icon ?? ""} placeholder="Icono emoji (opcional)" className="rounded border border-slate-300 px-3 py-2 text-sm" />
          <AdminImageUpload name="imageUrl" value={imageUrl} onUrlChange={setImageUrl} />
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="isActive" defaultChecked={entry?.isActive ?? true} className="rounded border-slate-300" />
            <span>Activo</span>
          </label>
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
              {busy ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear entrada"}
            </button>
            <Link href={backHref} className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-700">
              Cancelar
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
