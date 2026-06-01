import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";
import { SITE_NAME } from "@/lib/constants";
import { getLocaleFromCookie } from "@/lib/i18n-server";
import { canonicalPath } from "@/lib/seo";

const pageUrl = canonicalPath("/cuenta/iniciar-sesion");

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: `Accede a tu cuenta en ${SITE_NAME} para participar (denuncias, perfil, etc.).`,
  alternates: { canonical: pageUrl },
  robots: { index: false, follow: true },
  openGraph: { url: pageUrl },
};

function LoginFallback({ text }: { text: string }) {
  return <div className="container-page max-w-md py-8 text-slate-500">{text}</div>;
}

export default function IniciarSesionPage() {
  const locale = getLocaleFromCookie();
  const loadingText = locale === "val" ? "Carregant formulari..." : "Cargando formulario…";

  return (
    <Suspense fallback={<LoginFallback text={loadingText} />}>
      <LoginForm locale={locale} />
    </Suspense>
  );
}
