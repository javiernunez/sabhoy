import dynamic from "next/dynamic";
import type { Locale } from "@/lib/i18n";
import { getTranslator } from "@/lib/i18n";

const NewsletterForm = dynamic(
  () => import("@/components/NewsletterForm").then((m) => m.NewsletterForm),
  { loading: () => <div className="mt-2 h-10 animate-pulse rounded bg-slate-200/40" aria-hidden />, ssr: false },
);

type NewsletterSectionProps = {
  locale: Locale;
  /** `footer`: bloque del pie oscuro. `card`: tarjeta en barra lateral clara. */
  variant?: "footer" | "card";
  defaultEmail?: string | null;
};

export function NewsletterSection({ locale, variant = "footer", defaultEmail }: NewsletterSectionProps) {
  const t = getTranslator(locale);

  if (variant === "card") {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-wide text-slate-500">{t("footer.newsletter")}</p>
        <p className="mt-1 text-sm text-slate-600">{t("footer.newsletterDescription")}</p>
        <NewsletterForm locale={locale} appearance="light" source="sidebar_card" defaultEmail={defaultEmail} />
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t("footer.newsletter")}</p>
      <p className="mt-1 text-sm text-slate-300">{t("footer.newsletterDescription")}</p>
      <NewsletterForm locale={locale} appearance="dark" source="footer" defaultEmail={defaultEmail} />
    </div>
  );
}
