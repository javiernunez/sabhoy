import type { Metadata } from "next";
import { RegistroForm } from "./RegistroForm";
import { SITE_NAME } from "@/lib/constants";
import { getLocaleFromCookie } from "@/lib/i18n-server";
import { canonicalPath } from "@/lib/seo";

const pageUrl = canonicalPath("/cuenta/registro");

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: `Registro de usuario en ${SITE_NAME}, noticias e información de San Antonio de Benagéber.`,
  alternates: { canonical: pageUrl },
  robots: { index: false, follow: true },
  openGraph: { url: pageUrl },
};

export default function RegistroPage() {
  const locale = getLocaleFromCookie();
  return (
    <div className="container-page max-w-md">
      <RegistroForm locale={locale} />
    </div>
  );
}
