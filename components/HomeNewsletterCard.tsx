import dynamic from "next/dynamic";
import { getTranslator } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

const NewsletterForm = dynamic(
  () => import("@/components/NewsletterForm").then((m) => m.NewsletterForm),
  {
    loading: () => <div className="mt-2 h-10 animate-pulse rounded bg-slate-100" aria-hidden />,
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
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <p className="text-sm font-bold uppercase tracking-wide text-slate-500">{t("footer.newsletter")}</p>
      <p className="mt-1 text-sm text-slate-600">{t("footer.newsletterDescription")}</p>
      <NewsletterForm locale={locale} appearance="light" source="sidebar_card" defaultEmail={defaultEmail} />
    </div>
  );
}
