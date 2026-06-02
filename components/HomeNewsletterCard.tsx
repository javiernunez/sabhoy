import dynamic from "next/dynamic";
import { getTranslator } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { ui } from "@/lib/ui-classes";

const NewsletterForm = dynamic(
  () => import("@/components/NewsletterForm").then((m) => m.NewsletterForm),
  {
    loading: () => <div className="mt-2 h-10 animate-pulse rounded-lg bg-sab-mist" aria-hidden />,
    ssr: false,
  },
);

type Props = {
  locale: Locale;
  defaultEmail?: string | null;
};

export function HomeNewsletterCard({ locale, defaultEmail }: Props) {
  const t = getTranslator(locale);
  return (
    <div className={`${ui.card} border-sab-rose-light bg-gradient-to-br from-white via-sab-mist/50 to-sab-rose-light/50 p-4`}>
      <p className="sab-section-kicker">{t("footer.newsletter")}</p>
      <p className={`mt-1 text-sm ${ui.muted}`}>{t("footer.newsletterDescription")}</p>
      <NewsletterForm locale={locale} appearance="light" source="sidebar_card" defaultEmail={defaultEmail} />
    </div>
  );
}
