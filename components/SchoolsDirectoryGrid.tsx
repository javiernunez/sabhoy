import Link from "next/link";
import type { SchoolType } from "@/lib/schools";
import { SCHOOLS, SCHOOL_TYPES } from "@/lib/schools";

const TYPE_ORDER: SchoolType[] = ["publico", "concertado", "privado"];

type Props = Readonly<{
  isVal: boolean;
  cardHoverBorderClass?: string;
  cardTitleHoverClass?: string;
  showHeading?: boolean;
}>;

export function SchoolsDirectoryGrid({
  isVal,
  cardHoverBorderClass = "hover:border-blue-400",
  cardTitleHoverClass = "group-hover:text-sab-terracotta",
  showHeading = true,
}: Props) {
  const grouped = TYPE_ORDER.map((type) => ({
    type,
    meta: SCHOOL_TYPES[type],
    schools: SCHOOLS.filter((s) => s.type === type),
  })).filter((group) => group.schools.length > 0);

  return (
    <section className="space-y-10">
      {showHeading ? (
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {isVal ? "Directorio de col·legis" : "Directorio de colegios"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isVal
              ? "Selecciona un centre per veure la fitxa completa."
              : "Selecciona un centro para ver la ficha completa."}
          </p>
        </div>
      ) : null}
      {grouped.map((group) => (
        <div key={group.type}>
          <div className="mb-4 flex items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${group.meta.colorLight} ${group.meta.color}`}>
              {isVal ? group.meta.labelVal : group.meta.label}
            </span>
            <span className="text-sm text-slate-400">
              {group.schools.length} {group.schools.length === 1 ? "centro" : "centros"}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {group.schools.map((school) => (
              <Link
                key={school.slug}
                href={`/colegios/${school.slug}`}
                className={`group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${cardHoverBorderClass}`}
              >
                <h3 className={`text-lg font-bold text-slate-900 ${cardTitleHoverClass}`}>
                  {isVal && school.nameVal ? school.nameVal : school.name}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm leading-snug text-slate-600">
                  {isVal ? school.descriptionVal : school.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  {school.address ? (
                    <span className="flex items-center gap-1">
                      <span aria-hidden>📍</span> {school.address}
                    </span>
                  ) : null}
                  {school.phone ? (
                    <span className="flex items-center gap-1">
                      <span aria-hidden>📞</span> {school.phone}
                    </span>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
