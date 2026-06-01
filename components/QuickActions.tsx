import Link from "next/link";

const actions = [
  {
    href: "/denuncias/nueva",
    label: "Reportar algo",
    sub: "Incidencia en el pueblo",
  },
  {
    href: "/eventos",
    label: "Eventos",
    sub: "Agenda local actualizada",
  },
  {
    href: "/informacion-util",
    label: "Información útil",
    sub: "Teléfonos, trámites, servicios",
  },
] as const;

export function QuickActions() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {actions.map((a, i) => (
        <Link
          key={a.href}
          href={a.href}
          className="group flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg font-bold text-blue-800">
            {i === 0 ? "!" : i === 1 ? "📅" : "i"}
          </span>
          <span>
            <span className="block font-bold text-slate-900 group-hover:text-blue-800">{a.label}</span>
            <span className="mt-0.5 block text-xs text-slate-500">{a.sub}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}
