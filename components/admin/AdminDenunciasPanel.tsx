"use client";

import { useMemo, useState } from "react";
import { renderMarkdown } from "@/lib/render-markdown";

type AdminReport = {
  id: number;
  title: string;
  content: string;
  categories: string[];
  status: string;
};

type Props = {
  initialReports: AdminReport[];
};

const REPORT_STATUSES = ["pending", "reviewed", "published"] as const;
type ReportStatus = (typeof REPORT_STATUSES)[number];

export function AdminDenunciasPanel({ initialReports }: Readonly<Props>) {
  const [reports, setReports] = useState(initialReports);
  const [notice, setNotice] = useState<string | null>(null);

  const sortedReports = useMemo(
    () => [...reports].sort((a, b) => a.status.localeCompare(b.status)),
    [reports]
  );

  async function updateReportStatus(id: number, status: ReportStatus) {
    const safeStatus = REPORT_STATUSES.includes(status) ? status : "pending";
    const response = await fetch(`/api/reports/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: safeStatus }),
    });

    if (!response.ok) {
      setNotice("No se pudo actualizar el estado de la denuncia.");
      return;
    }

    setReports((old) => old.map((item) => (item.id === id ? { ...item, status: safeStatus } : item)));
    setNotice("Estado de denuncia actualizado.");
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Denuncias</h1>
      {notice ? <p className="rounded bg-blue-50 px-3 py-2 text-sm text-blue-700">{notice}</p> : null}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Revision de denuncias</h2>
        <div className="mt-4 space-y-3">
          {sortedReports.map((report) => (
            <article key={report.id} className="rounded border border-slate-200 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{report.title}</h3>
                  <p className="text-xs uppercase tracking-wide text-slate-500">{report.categories.join(", ")}</p>
                </div>
                <select
                  value={report.status}
                  onChange={(event) => updateReportStatus(report.id, event.target.value as ReportStatus)}
                  className="rounded border border-slate-300 px-2 py-1 text-sm"
                >
                  {REPORT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="prose-article mt-2 max-w-2xl text-sm text-slate-700">
                {renderMarkdown(report.content || "")}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
