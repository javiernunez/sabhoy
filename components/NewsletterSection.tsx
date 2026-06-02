import dynamic from "next/dynamic";
import type { Locale } from "@/lib/i18n";
import { getTranslator } from "@/lib/i18n";
import { ui } from "@/lib/ui-classes";

const NewsletterForm = dynamic(
  () => import("@/components/NewsletterForm").then((m) => m.NewsletterForm),
  { loading: () => <div className="mt-2 h-10 animate-pulse rounded-lg bg-sab-mist" aria-hidden />, ssr: false },
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
      <div className={`${ui.card} p-4`}>
        <p className="sab-section-kicker">{t("footer.newsletter")}</p>
        <p className={`mt-1 text-sm ${ui.muted}`}>{t("footer.newsletterDescription")}</p>
        <NewsletterForm locale={locale} appearance="light" source="sidebar_card" defaultEmail={defaultEmail} />
      </div>
    );
  }

  return (
    <div>
      <p className="sab-section-kicker !text-sky-300">{t("footer.newsletter")}</p>
      <p className="mt-2 text-sm text-slate-300">{t("footer.newsletterDescription")}</p>
      <NewsletterForm locale={locale} appearance="dark" source="footer" defaultEmail={defaultEmail} />
    </div>
  );
}
