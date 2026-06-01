"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

export type AdminDataTableRow = {
  id: number;
  title: string;
  /** Si la tabla usa `publishColumn`, celda del interruptor publicar/borrador. */
  publishSwitch?: ReactNode;
  actions: ReactNode;
};

type Props = {
  rows: AdminDataTableRow[];
  /** Muestra columna «Publicada» (interruptor) antes de acciones. */
  publishColumn?: boolean;
};

const PER_PAGE_OPTIONS = [10, 25, 50, 100] as const;

export function AdminDataTable({ rows, publishColumn = false }: Readonly<Props>) {
  const [query, setQuery] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => String(r.id).includes(q) || r.title.toLowerCase().includes(q));
  }, [rows, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));

  useEffect(() => {
    setPage(1);
  }, [query, perPage]);

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const currentPage = Math.min(page, totalPages);
  const offset = (currentPage - 1) * perPage;
  const pageRows = filtered.slice(offset, offset + perPage);
  const displayStart = filtered.length === 0 ? 0 : offset + 1;
  const displayEnd = filtered.length === 0 ? 0 : offset + pageRows.length;

  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <label className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <select
            name="per-page"
            className="rounded border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-800"
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
          >
            {PER_PAGE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span>por página</span>
        </label>
        <input
          type="search"
          name="search"
          className="w-full min-w-[12rem] rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 sm:max-w-xs"
          placeholder="Buscar..."
          title="Buscar en la tabla"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="py-2 pr-4 font-medium">ID</th>
              <th className="py-2 pr-4 font-medium">Título</th>
              {publishColumn ? <th className="py-2 pr-4 font-medium">Publicada</th> : null}
              <th className="py-2 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={publishColumn ? 4 : 3} className="py-6 text-center text-slate-500">
                  {query.trim() ? "Ningún resultado coincide con la búsqueda" : "No hay registros"}
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-3 pr-4 text-slate-600">{row.id}</td>
                  <td className="py-3 pr-4 font-medium text-slate-900">{row.title}</td>
                  {publishColumn ? <td className="py-3 pr-4">{row.publishSwitch ?? null}</td> : null}
                  <td className="py-3 text-right">{row.actions}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          {filtered.length > 0
            ? `Mostrando ${displayStart} a ${displayEnd} de ${filtered.length} registros`
            : ""}
        </p>
        {totalPages > 1 ? (
          <nav className="flex flex-wrap items-center gap-1" aria-label="Paginación">
            <button
              type="button"
              className="rounded border border-slate-300 px-2 py-1 text-sm text-slate-700 disabled:opacity-40"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </button>
            <span className="px-2 text-sm text-slate-600">
              Página {currentPage} de {totalPages}
            </span>
            <button
              type="button"
              className="rounded border border-slate-300 px-2 py-1 text-sm text-slate-700 disabled:opacity-40"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Siguiente
            </button>
          </nav>
        ) : null}
      </div>
    </div>
  );
}
