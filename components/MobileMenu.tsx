"use client";

import { useState } from "react";
import Link from "next/link";
import { UserNav } from "@/components/UserNav";
import { NavItemIcon } from "@/components/NavItemIcon";
import { NAV_ITEMS } from "@/lib/constants";

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700"
        aria-expanded={open}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
      >
        {open ? (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>
      {open ? (
        <div className="absolute left-0 right-0 top-full z-50 border-b border-slate-200 bg-white px-4 py-3 shadow-lg">
          <ul className="flex flex-col gap-1 text-sm font-medium text-slate-800">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group flex items-center gap-2.5 rounded-lg px-3 py-2 text-slate-800 hover:bg-slate-100"
                  onClick={() => setOpen(false)}
                >
                  <span className="shrink-0">
                    <NavItemIcon id={item.icon} className="h-4 w-4" />
                  </span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3 border-t border-slate-100 pt-3" onClick={() => setOpen(false)}>
            <UserNav />
          </div>
        </div>
      ) : null}
    </div>
  );
}
