"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV = [
  { href: "/admin/marketing", label: "Marketing" },
  { href: "/admin/noticias", label: "Noticias" },
  { href: "/admin/eventos", label: "Eventos" },
  { href: "/admin/videos", label: "Videos" },
  { href: "/admin/denuncias", label: "Denuncias" },
  { href: "/admin/paginas", label: "Paginas" },
  { href: "/admin/nostre-poble", label: "Nostre poble" },
  { href: "/admin/comercios", label: "Comercios" },
  { href: "/admin/asociaciones", label: "Asociaciones" },
] as const;

export function AdminDashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  function logout() {
    void signOut({ callbackUrl: "/" });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/admin/noticias" className="font-bold text-slate-900">
              Admin
            </Link>
            <nav className="flex flex-wrap gap-1">
              {NAV.map((item) => {
                const active = pathname === item.href || (pathname?.startsWith(`${item.href}/`) ?? false);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                      active
                        ? "bg-blue-100 text-blue-900"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="text-sm text-slate-500 hover:text-slate-800">
              Ver sitio
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded border border-slate-300 px-3 py-1.5 text-sm font-medium"
            >
              Cerrar sesion
            </button>
          </div>
        </div>
      </header>
      <div className="container-page py-8">{children}</div>
    </div>
  );
}
