import type { Metadata } from "next";
import Link from "next/link";
import { getLocaleFromCookie } from "@/lib/i18n-server";

export const metadata: Metadata = {
  title: "Página no encontrada",
  description: "El contenido solicitado no existe o ha cambiado de dirección.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  const locale = getLocaleFromCookie();
  const isVal = locale === "val";

  return (
    <div className="container-page max-w-2xl text-center">
      <h1 className="text-3xl font-bold">{isVal ? "Contingut no trobat" : "Contenido no encontrado"}</h1>
      <p className="mt-3 text-slate-600">
        {isVal ? "La pàgina que busques no existix o ha canviat d'adreça." : "La página que buscas no existe o ha cambiado de dirección."}
      </p>
      <Link href="/" className="mt-6 inline-block rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
        {isVal ? "Tornar a inici" : "Volver al inicio"}
      </Link>
    </div>
  );
}
