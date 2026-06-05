import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { getLocaleFromCookie } from "@/lib/i18n-server";
import { getTranslator } from "@/lib/i18n";
import { confirmNewsletterByToken } from "@/lib/newsletter";
import { canonicalPath } from "@/lib/seo";
import { NewsletterConfirmAnalytics } from "./NewsletterConfirmAnalytics";

const pageUrl = canonicalPath("/newsletter/confirmar");

export const metadata: Metadata = {
  title: "Confirmar newsletter",
  description: `Confirma tu suscripcion a la newsletter de ${SITE_NAME}.`,
  alternates: { canonical: pageUrl },
  robots: { index: false, follow: true },
  openGraph: { url: pageUrl },
};

type PageProps = {
  searchParams: { token?: string };
};

export default async function ConfirmarNewsletterPage({ searchParams }: PageProps) {
  const locale = getLocaleFromCookie();
  const t = getTranslator(locale);
  const token = searchParams.token?.trim() || "";

  const result = token ? await confirmNewsletterByToken(token) : { status: "invalid" as const };

  let title: string;
  let body: string;
  let trackSubscribe = false;

  if (result.status === "confirmed") {
    title = t("newsletter.confirm.titleOk");
    body = t("newsletter.confirm.bodyOk");
    trackSubscribe = true;
  } else if (result.status === "already_confirmed") {
    title = t("newsletter.confirm.titleAlready");
    body = t("newsletter.confirm.bodyAlready");
  } else {
    title = t("newsletter.confirm.titleInvalid");
    body = t("newsletter.confirm.bodyInvalid");
  }

  return (
    <div className="container-page max-w-lg py-10">
      {trackSubscribe ? <NewsletterConfirmAnalytics /> : null}
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      <p className="mt-3 text-slate-700">{body}</p>
      <p className="mt-6">
        <Link href="/" className="text-sm font-medium text-emerald-700 hover:text-emerald-600">
          {t("newsletter.confirm.backHome")}
        </Link>
      </p>
    </div>
  );
}
