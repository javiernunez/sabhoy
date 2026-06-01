import { CtaLink } from "@/components/CtaLink";
import { ui } from "@/lib/ui-classes";

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
    <div className="mb-5 flex flex-col gap-2 border-l-4 border-sab-terracotta pl-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className={`${ui.sectionTitle} flex items-center gap-2`}>
          {icon ? <span className="text-2xl" aria-hidden>{icon}</span> : null}
          <span>{title}</span>
        </h2>
        {subtitle ? <p className={`mt-1 text-sm ${ui.muted}`}>{subtitle}</p> : null}
      </div>
      {href ? (
        <CtaLink
          href={href}
          trackParams={{
            cta_name: "section_header_view_all",
            cta_context: trackContext ?? title,
            destination: href,
          }}
          className={`shrink-0 text-sm font-bold ${ui.link}`}
        >
          {actionLabel} →
        </CtaLink>
      ) : null}
    </div>
  );
}
