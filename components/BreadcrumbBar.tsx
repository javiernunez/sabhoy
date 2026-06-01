import Link from "next/link";
import { headers } from "next/headers";
import { getTranslator, type Locale } from "@/lib/i18n";

type Props = { locale: Locale };

function formatSegmentTitle(segment: string): string {
  return decodeURIComponent(segment)
    .split("-")
    .filter(Boolean)
    .map((w) => {
      if (w.toLowerCase() === "leliana") return "San Antonio de Benagéber";
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(" ");
}

function getSegmentLabel(segment: string, parent: string | undefined, t: (key: string) => string): string | null {
  const bySegment: Record<string, string> = {
    noticias: t("nav.news"),
    videos: t("nav.videos"),
    comercios: t("nav.commerces"),
    asociaciones: t("nav.associations"),
    deportes: t("nav.sports"),
    denuncias: t("nav.reports"),
    eventos: t("nav.events"),
    "informacion-util": t("nav.usefulInfo"),
    "quienes-somos": t("footer.about"),
    "el-nostre-poble": t("nav.nostrePoble"),
    cuenta: t("breadcrumb.cuenta"),
    "iniciar-sesion": t("auth.login"),
    registro: t("auth.register"),
  };
  if (bySegment[segment]) return bySegment[segment]!;
  if (parent === "denuncias" && segment === "nueva") return t("breadcrumb.nuevaDenuncia");
  return null;
}

/**
 * Migas visuales en páginas distintas de inicio. Oculto en /admin.
 * Server Component: pathname vía cabecera `x-pathname` (middleware).
 */
export function BreadcrumbBar({ locale }: Props) {
  const pathname = headers().get("x-pathname") || "/";
  const t = getTranslator(locale);

  if (pathname === "/" || pathname.startsWith("/admin")) {
    return null;
  }

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return null;
  }

  const items: { name: string; path: string }[] = [{ name: t("nav.home"), path: "/" }];

  let acc = "";
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]!;
    acc = `${acc}/${seg}`;
    const parent = i > 0 ? segments[i - 1] : undefined;
    const label = getSegmentLabel(seg, parent, t) || formatSegmentTitle(seg);
    items.push({ name: label, path: acc });
  }

  return (
    <div className="border-b border-slate-200/90 bg-slate-50/60">
      <div className="container-page max-w-6xl py-2.5">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-600">
            {items.map((item, i) => {
              const last = i === items.length - 1;
              return (
                <li key={item.path} className="inline-flex min-w-0 max-w-full items-center gap-x-2">
                  {i > 0 ? (
                    <span aria-hidden className="shrink-0 text-slate-300">
                      /
                    </span>
                  ) : null}
                  {last ? (
                    <span className="min-w-0 truncate font-medium text-slate-900">{item.name}</span>
                  ) : (
                    <Link
                      href={item.path}
                      className="min-w-0 truncate text-blue-800 underline decoration-blue-800/30 underline-offset-2 hover:decoration-blue-800"
                    >
                      {item.name}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}
