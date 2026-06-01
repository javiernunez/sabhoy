import type { ReactNode } from "react";
import { ui } from "@/lib/ui-classes";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Barra superior de color (páginas de sección). */
  accent?: boolean;
};

/** Cabecera de página interior con tipografía SAB. */
export function PageShell({ title, subtitle, children, accent = true }: Props) {
  return (
    <div className="container-page py-8 md:py-10">
      <header className={accent ? "mb-8 border-l-4 border-sab-terracotta pl-5" : "mb-8"}>
        <h1 className={ui.pageTitle}>{title}</h1>
        {subtitle ? <p className={`mt-2 max-w-2xl text-lg ${ui.muted}`}>{subtitle}</p> : null}
      </header>
      {children}
    </div>
  );
}
