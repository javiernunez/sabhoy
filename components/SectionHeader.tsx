import { CtaLink } from "@/components/CtaLink";

type Props = {
  title: string;
  subtitle?: string;
  href?: string;
  actionLabel?: string;
  icon?: string;
  trackContext?: string;
};

export function SectionHeader({ title, subtitle, href, actionLabel = "Ver todo", icon, trackContext }: Readonly<Props>) {
  return (
    <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900 md:text-xl">
          {icon ? <span aria-hidden>{icon}</span> : null}
          <span>{title}</span>
        </h2>
        {subtitle ? <p className="mt-0.5 text-sm text-slate-600">{subtitle}</p> : null}
      </div>
      {href ? (
        <CtaLink
          href={href}
          trackParams={{
            cta_name: "section_header_view_all",
            cta_context: trackContext ?? title,
            destination: href,
          }}
          className="shrink-0 text-sm font-semibold text-blue-700 hover:text-blue-800 hover:underline"
        >
          {actionLabel} →
        </CtaLink>
      ) : null}
    </div>
  );
}
