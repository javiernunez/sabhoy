"use client";

import { FormEvent, useMemo, useState } from "react";
import { AdminImageUpload } from "@/components/admin/AdminImageUpload";
import { AdminMdxField } from "@/components/admin/AdminMdxField";

type DirectoryKind = "COMMERCE" | "SPORT" | "ASSOCIATION" | "POLITICS";

type AdminDirectoryEntry = {
  id: number;
  kind: DirectoryKind;
  name: string;
  nameVal: string | null;
  slug: string;
  category: string;
  categoryVal: string | null;
  description: string;
  descriptionVal: string | null;
  imageUrl: string | null;
  websiteUrl: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  icon: string | null;
  href: string | null;
  isActive: boolean;
  sortOrder: number;
  categoryLinks: { category: AdminDirectoryCategory }[];
};

type Props = {
  initialEntries: AdminDirectoryEntry[];
  initialCategories: AdminDirectoryCategory[];
};

type AdminDirectoryCategory = {
  id: number;
  kind: DirectoryKind;
  name: string;
  nameVal: string | null;
  parentId: number | null;
  parent: { id: number; name: string; nameVal: string | null } | null;
};

type CategoryPickerProps = {
  kind: DirectoryKind;
  categories: AdminDirectoryCategory[];
  selectedIds: number[];
  onToggle: (id: number) => void;
};

function CategoryPicker({ kind, categories, selectedIds, onToggle }: CategoryPickerProps) {
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

  if (grouped.length === 0) {
    return <p className="text-sm text-slate-500">No hay categorías configuradas para este tipo.</p>;
  }

  return (
    <div className="rounded border border-slate-200 bg-slate-50 p-3">
      <p className="mb-2 text-sm font-medium text-slate-700">Categorías (múltiples)</p>
      <div className="space-y-3">
        {grouped.map(({ parent, children }) => (
          <fieldset key={parent.id} className="space-y-1">
            <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">{parent.name}</legend>
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
    </div>
  );
}

export function AdminDirectorioPanel({ initialEntries, initialCategories }: Props) {
  const [entries, setEntries] = useState(initialEntries);
  const [categories, setCategories] = useState(initialCategories);
  const [notice, setNotice] = useState<string | null>(null);
  const [categoryBusy, setCategoryBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [createKind, setCreateKind] = useState<DirectoryKind>("COMMERCE");
  const [createCategoryIds, setCreateCategoryIds] = useState<number[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingBusy, setEditingBusy] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editKind, setEditKind] = useState<DirectoryKind>("COMMERCE");
  const [editCategoryIds, setEditCategoryIds] = useState<number[]>([]);
  const [newEntryKey, setNewEntryKey] = useState(0);
  const [newCategoryKind, setNewCategoryKind] = useState<DirectoryKind>("COMMERCE");

  const sortedEntries = useMemo(
    () =>
      [...entries].sort((a, b) => {
        if (a.kind !== b.kind) return a.kind.localeCompare(b.kind);
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
        return a.name.localeCompare(b.name);
      }),
    [entries],
  );

  function toggleCreateCategory(id: number) {
    setCreateCategoryIds((old) => (old.includes(id) ? old.filter((x) => x !== id) : [...old, id]));
  }

  function toggleEditCategory(id: number) {
    setEditCategoryIds((old) => (old.includes(id) ? old.filter((x) => x !== id) : [...old, id]));
  }

  async function createCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCategoryBusy(true);
    setNotice(null);
    const form = new FormData(event.currentTarget);
    const payload = {
      kind: newCategoryKind,
      name: String(form.get("name") || "").trim(),
      nameVal: String(form.get("nameVal") || "").trim() || null,
      parentId: form.get("parentId") ? Number(form.get("parentId")) : null,
    };
    const response = await fetch("/api/local-directory/categories", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      setNotice("No se pudo crear la categoría.");
      setCategoryBusy(false);
      return;
    }
    const created = (await response.json()) as AdminDirectoryCategory;
    setCategories((old) => [...old, created].sort((a, b) => a.name.localeCompare(b.name)));
    setNotice("Categoría creada.");
    event.currentTarget.reset();
    setCategoryBusy(false);
  }

  async function createEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice(null);
    const form = new FormData(event.currentTarget);
    const payload = {
      kind: createKind,
      name: form.get("name"),
      nameVal: (form.get("nameVal") as string) || null,
      categoryIds: createCategoryIds,
      description: form.get("description"),
      descriptionVal: (form.get("descriptionVal") as string) || null,
      websiteUrl: (form.get("websiteUrl") as string) || null,
      facebookUrl: (form.get("facebookUrl") as string) || null,
      instagramUrl: (form.get("instagramUrl") as string) || null,
      tiktokUrl: (form.get("tiktokUrl") as string) || null,
      href: (form.get("href") as string) || null,
      icon: (form.get("icon") as string) || null,
      imageUrl: imageUrl.trim() || null,
      isActive: form.get("isActive") === "on",
      sortOrder: Number(form.get("sortOrder") || 0),
    };
    if (createCategoryIds.length === 0) {
      setNotice("Selecciona al menos una categoría.");
      setBusy(false);
      return;
    }

    const response = await fetch("/api/local-directory", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setNotice("No se pudo crear la entrada.");
      setBusy(false);
      return;
    }

    const created = (await response.json()) as AdminDirectoryEntry;
    setEntries((old) => [...old, created]);
    setNotice("Entrada creada correctamente.");
    setImageUrl("");
    setCreateCategoryIds([]);
    setNewEntryKey((k) => k + 1);
    event.currentTarget.reset();
    setBusy(false);
  }

  function startEdit(entry: AdminDirectoryEntry) {
    setNotice(null);
    setEditingId(entry.id);
    setEditImageUrl(entry.imageUrl ?? "");
    setEditKind(entry.kind);
    setEditCategoryIds(entry.categoryLinks.map((link) => link.category.id));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditImageUrl("");
    setEditCategoryIds([]);
  }

  async function updateEntry(event: FormEvent<HTMLFormElement>, id: number) {
    event.preventDefault();
    setEditingBusy(true);
    setNotice(null);
    const form = new FormData(event.currentTarget);
    const payload = {
      kind: editKind,
      name: form.get("name"),
      nameVal: (form.get("nameVal") as string) || null,
      categoryIds: editCategoryIds,
      description: form.get("description"),
      descriptionVal: (form.get("descriptionVal") as string) || null,
      websiteUrl: (form.get("websiteUrl") as string) || null,
      facebookUrl: (form.get("facebookUrl") as string) || null,
      instagramUrl: (form.get("instagramUrl") as string) || null,
      tiktokUrl: (form.get("tiktokUrl") as string) || null,
      href: (form.get("href") as string) || null,
      icon: (form.get("icon") as string) || null,
      imageUrl: editImageUrl.trim() || null,
      isActive: form.get("isActive") === "on",
      sortOrder: Number(form.get("sortOrder") || 0),
    };
    if (editCategoryIds.length === 0) {
      setNotice("Selecciona al menos una categoría.");
      setEditingBusy(false);
      return;
    }

    const response = await fetch(`/api/local-directory/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setNotice("No se pudo actualizar la entrada.");
      setEditingBusy(false);
      return;
    }

    const updated = (await response.json()) as AdminDirectoryEntry;
    setEntries((old) => old.map((entry) => (entry.id === id ? updated : entry)));
    setNotice("Entrada actualizada correctamente.");
    setEditingBusy(false);
    cancelEdit();
  }

  async function deleteEntry(id: number) {
    const confirmed = globalThis.confirm("¿Seguro que quieres eliminar esta entrada?");
    if (!confirmed) return;

    setDeletingId(id);
    setNotice(null);
    const response = await fetch(`/api/local-directory/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      setNotice("No se pudo eliminar la entrada.");
      setDeletingId(null);
      return;
    }

    setEntries((old) => old.filter((entry) => entry.id !== id));
    setNotice("Entrada eliminada.");
    if (editingId === id) cancelEdit();
    setDeletingId(null);
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Directorio local</h1>
      {notice ? <p className="rounded bg-blue-50 px-3 py-2 text-sm text-blue-700">{notice}</p> : null}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Categorías</h2>
        <form onSubmit={createCategory} className="mt-4 grid gap-3">
          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-sm text-slate-600">
              <span>Tipo</span>
              <select
                value={newCategoryKind}
                onChange={(event) => setNewCategoryKind(event.target.value as DirectoryKind)}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="COMMERCE">Comercio</option>
                <option value="ASSOCIATION">Asociación</option>
                <option value="POLITICS">Política (partidos)</option>
              </select>
            </label>
            <input name="name" required placeholder="Nombre categoría (CAST)" className="rounded border border-slate-300 px-3 py-2 text-sm" />
            <input name="nameVal" placeholder="Nom categoria (VAL)" className="rounded border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <label className="text-sm text-slate-600">
            <span>Categoría padre (opcional)</span>
            <select name="parentId" className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm">
              <option value="">Sin padre (raíz)</option>
              {categories
                .filter((c) => c.kind === newCategoryKind && c.parentId == null)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </label>
          <button type="submit" disabled={categoryBusy} className="w-fit rounded bg-slate-800 px-4 py-2 text-sm font-semibold text-white">
            {categoryBusy ? "Creando..." : "Crear categoría"}
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Crear entrada</h2>
        <form onSubmit={createEntry} className="mt-4 grid gap-3">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm text-slate-600">
              <span>Tipo</span>
              <select
                name="kind"
                value={createKind}
                onChange={(event) => {
                  const kind = event.target.value as DirectoryKind;
                  setCreateKind(kind);
                  setCreateCategoryIds((old) => old.filter((id) => categories.some((c) => c.id === id && c.kind === kind)));
                }}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="COMMERCE">Comercio</option>
                <option value="ASSOCIATION">Asociación</option>
                <option value="POLITICS">Política (partidos)</option>
              </select>
            </label>
            <input name="name" required placeholder="Nombre (CAST)" className="rounded border border-slate-300 px-3 py-2 text-sm" />
            <input name="nameVal" placeholder="Nom (VAL)" className="rounded border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <CategoryPicker kind={createKind} categories={categories} selectedIds={createCategoryIds} onToggle={toggleCreateCategory} />
          <div className="grid gap-3 md:grid-cols-1">
            <input name="sortOrder" type="number" defaultValue={0} placeholder="Orden" className="rounded border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <AdminMdxField
            key={`new-dir-desc-cast-${newEntryKey}`}
            name="description"
            defaultValue=""
            required
            minHeight={220}
            label="Descripcion (CAST) — editor visual"
            placeholder="Descripcion CAST"
          />
          <AdminMdxField
            key={`new-dir-desc-val-${newEntryKey}`}
            name="descriptionVal"
            defaultValue=""
            minHeight={220}
            label="Descripcio (VAL) — editor visual"
            placeholder="Descripcio VAL"
          />
          <div className="grid gap-3 md:grid-cols-2">
            <input name="websiteUrl" placeholder="Web oficial (opcional)" className="rounded border border-slate-300 px-3 py-2 text-sm" />
            <input name="href" placeholder="Otro enlace (opcional)" className="rounded border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <input name="facebookUrl" placeholder="Facebook (opcional)" className="rounded border border-slate-300 px-3 py-2 text-sm" />
            <input name="instagramUrl" placeholder="Instagram (opcional)" className="rounded border border-slate-300 px-3 py-2 text-sm" />
            <input name="tiktokUrl" placeholder="TikTok (opcional)" className="rounded border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <input name="icon" placeholder="Icono emoji (opcional)" className="rounded border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <AdminImageUpload name="imageUrl" value={imageUrl} onUrlChange={setImageUrl} />
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="isActive" defaultChecked className="rounded border-slate-300" />
            <span>Activo</span>
          </label>
          <button type="submit" disabled={busy} className="w-fit rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
            {busy ? "Guardando..." : "Guardar entrada"}
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Entradas</h2>
        <div className="mt-4 space-y-3">
          {sortedEntries.map((entry) => (
            <article key={entry.id} className="rounded border border-slate-200 p-3">
              {editingId === entry.id ? (
                <form className="grid gap-3" onSubmit={(event) => void updateEntry(event, entry.id)}>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-sm text-slate-600">
                      <span>Tipo</span>
                      <select
                        name="kind"
                        value={editKind}
                        onChange={(event) => {
                          const kind = event.target.value as DirectoryKind;
                          setEditKind(kind);
                          setEditCategoryIds((old) => old.filter((id) => categories.some((c) => c.id === id && c.kind === kind)));
                        }}
                        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                      >
                        <option value="COMMERCE">Comercio</option>
                        <option value="ASSOCIATION">Asociación</option>
                        <option value="POLITICS">Política (partidos)</option>
                      </select>
                    </label>
                    <input
                      name="name"
                      required
                      defaultValue={entry.name}
                      placeholder="Nombre (CAST)"
                      className="rounded border border-slate-300 px-3 py-2 text-sm"
                    />
                    <input
                      name="nameVal"
                      defaultValue={entry.nameVal ?? ""}
                      placeholder="Nom (VAL)"
                      className="rounded border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <CategoryPicker kind={editKind} categories={categories} selectedIds={editCategoryIds} onToggle={toggleEditCategory} />
                  <div className="grid gap-3 md:grid-cols-1">
                    <input
                      name="sortOrder"
                      type="number"
                      defaultValue={entry.sortOrder}
                      placeholder="Orden"
                      className="rounded border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <AdminMdxField
                    key={`edit-dir-${entry.id}-description`}
                    name="description"
                    defaultValue={entry.description}
                    required
                    minHeight={220}
                    label="Descripcion (CAST) — editor visual"
                    placeholder="Descripcion CAST"
                  />
                  <AdminMdxField
                    key={`edit-dir-${entry.id}-descriptionVal`}
                    name="descriptionVal"
                    defaultValue={entry.descriptionVal ?? ""}
                    minHeight={220}
                    label="Descripcio (VAL) — editor visual"
                    placeholder="Descripcio VAL"
                  />
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      name="websiteUrl"
                      defaultValue={entry.websiteUrl ?? ""}
                      placeholder="Web oficial (opcional)"
                      className="rounded border border-slate-300 px-3 py-2 text-sm"
                    />
                    <input
                      name="href"
                      defaultValue={entry.href ?? ""}
                      placeholder="Otro enlace (opcional)"
                      className="rounded border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <input
                      name="facebookUrl"
                      defaultValue={entry.facebookUrl ?? ""}
                      placeholder="Facebook (opcional)"
                      className="rounded border border-slate-300 px-3 py-2 text-sm"
                    />
                    <input
                      name="instagramUrl"
                      defaultValue={entry.instagramUrl ?? ""}
                      placeholder="Instagram (opcional)"
                      className="rounded border border-slate-300 px-3 py-2 text-sm"
                    />
                    <input
                      name="tiktokUrl"
                      defaultValue={entry.tiktokUrl ?? ""}
                      placeholder="TikTok (opcional)"
                      className="rounded border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      name="icon"
                      defaultValue={entry.icon ?? ""}
                      placeholder="Icono emoji (opcional)"
                      className="rounded border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <AdminImageUpload name="imageUrl" value={editImageUrl} onUrlChange={setEditImageUrl} />
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" name="isActive" defaultChecked={entry.isActive} className="rounded border-slate-300" />
                    <span>Activo</span>
                  </label>
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
                  <h3 className="font-semibold">{entry.name}</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {entry.kind} ·{" "}
                    {entry.categoryLinks.map((x) => (x.category.parent ? `${x.category.parent.name} / ${x.category.name}` : x.category.name)).join(", ")} ·
                    {" "}orden {entry.sortOrder} · {entry.isActive ? "activo" : "inactivo"}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(entry)}
                      className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteEntry(entry.id)}
                      disabled={deletingId === entry.id}
                      className="rounded border border-rose-300 px-3 py-1.5 text-sm text-rose-700 disabled:opacity-60"
                    >
                      {deletingId === entry.id ? "Eliminando..." : "Eliminar"}
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
