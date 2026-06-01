import Link from "next/link";

export type CommerceFilterItem = { value: string; name: string; count: number };

type BuildPatch = {
  q?: string;
  categoria?: string | null;
  page?: number;
};

type Props = {
  isVal: boolean;
  items: CommerceFilterItem[];
  buildHref: (patch: BuildPatch) => string;
  activeCategoria: string;
};

function linkClass(active: boolean) {
  return [
    "flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm transition",
    active
      ? "bg-blue-100 font-medium text-sab-forest ring-1 ring-blue-300/80"
      : "text-slate-700 hover:bg-white hover:text-sab-forest",
  ].join(" ");
}

export function CommerceFilterList({ isVal, items, buildHref, activeCategoria }: Readonly<Props>) {
  const allLabel = isVal ? "Totes les categories" : "Todas las categorías";

  return (
    <nav aria-label={isVal ? "Filtre per categoria" : "Filtro por categoría"} className="space-y-1">
      <Link
        href={buildHref({ categoria: null, page: 1 })}
        className={linkClass(!activeCategoria)}
      >
        {allLabel}
      </Link>

      {items.map(({ value, name, count }) => {
        const active = activeCategoria === value;
        return (
          <Link
            key={value}
            href={buildHref({ categoria: value, page: 1 })}
            className={linkClass(active)}
          >
            <span className="min-w-0 truncate">{name}</span>
            <span className="shrink-0 tabular-nums text-slate-400">({count})</span>
          </Link>
        );
      })}
    </nav>
  );
}
