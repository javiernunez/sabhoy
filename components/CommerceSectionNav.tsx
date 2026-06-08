import Link from "next/link";
import { COMMERCE_SECTIONS, type CommerceSectionSlug } from "@/lib/comercios-sections";

type Props = {
  isVal: boolean;
  activeSlug?: CommerceSectionSlug;
};

export function CommerceSectionNav({ isVal, activeSlug }: Readonly<Props>) {
  return (
    <nav className="flex flex-wrap items-center gap-2" aria-label={isVal ? "Submenú de comerços" : "Submenú de comercios"}>
      {COMMERCE_SECTIONS.map((section) => {
        const active = section.slug === activeSlug;
        return (
          <Link
            key={section.slug}
            href={`/comercios/${section.slug}`}
            aria-current={active ? "page" : undefined}
            className={`group flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              active
                ? "border-sab-terracotta bg-sab-mist text-sab-terracotta-dark shadow-sm"
                : "border-slate-300 bg-slate-50 text-slate-700 hover:border-blue-400 hover:bg-white hover:text-sab-terracotta-dark hover:shadow-sm"
            }`}
          >
            <span className="shrink-0" aria-hidden>
              {section.icon}
            </span>
            {isVal ? section.labelVal : section.labelEs}
          </Link>
        );
      })}
    </nav>
  );
}
