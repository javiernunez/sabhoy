import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";
import { UserNav } from "@/components/UserNav";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { NavItemIcon } from "@/components/NavItemIcon";
import { NAV_ICON_COLORS, NAV_ITEMS, SITE_NAME } from "@/lib/constants";
import { getNavLabelByHref, getTranslator } from "@/lib/i18n";
import { getLocaleFromCookie } from "@/lib/i18n-server";

export async function Header() {
  const locale = getLocaleFromCookie();
  const t = getTranslator(locale);
  const pathname = headers().get("x-pathname") || "/";

  return (
    <header className="sticky top-0 z-40 border-b border-sab-sand/90 bg-white shadow-sm">
      <div className="container-page flex flex-wrap items-center justify-between gap-3 !py-3 md:!py-3.5">
        <Link
          href="/"
          aria-label={SITE_NAME}
          className="block shrink-0 rounded-xl border border-sab-sand/80 bg-white px-3 py-2 shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition hover:border-sab-terracotta/25"
        >
          <Image
            src="/branding/logo-sabhoy.png"
            alt={SITE_NAME}
            width={427}
            height={120}
            priority
            unoptimized
            className="h-11 w-auto max-w-[min(100%,24rem)] md:h-12"
          />
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher locale={locale} />
          <UserNav locale={locale} />
        </div>
      </div>

      <nav
        className="container-page !py-0 border-t border-sab-sand/70 bg-sab-mist/35"
        aria-label={t("nav.main")}
      >
        <ul className="flex flex-wrap items-center gap-1.5 py-2 md:gap-2 md:py-2.5">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const iconColor = active ? "text-white" : NAV_ICON_COLORS[item.icon];
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`sab-nav-link ${active ? "sab-nav-link-active" : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${active ? "bg-white/15" : "bg-white shadow-sm ring-1 ring-sab-sand/60"}`}
                  >
                    <NavItemIcon id={item.icon} className={`h-4 w-4 ${iconColor}`} />
                  </span>
                  {getNavLabelByHref(item.href, t)}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
