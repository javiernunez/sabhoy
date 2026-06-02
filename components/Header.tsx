import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";
import { UserNav } from "@/components/UserNav";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { NavItemIcon } from "@/components/NavItemIcon";
import { NAV_ITEMS, SITE_NAME } from "@/lib/constants";
import { getNavLabelByHref, getTranslator } from "@/lib/i18n";
import { getLocaleFromCookie } from "@/lib/i18n-server";

export async function Header() {
  const locale = getLocaleFromCookie();
  const t = getTranslator(locale);
  const pathname = headers().get("x-pathname") || "/";

  return (
    <header className="sticky top-0 z-40 border-b border-sky-200/80 bg-gradient-to-b from-sky-100 via-sky-50/60 to-white/95 shadow-sm backdrop-blur-md supports-[backdrop-filter]:from-sky-100/85 supports-[backdrop-filter]:to-white/85">
      <div className="container-page flex flex-wrap items-center justify-between gap-3 !py-3 md:!py-4">
        <Link href="/" aria-label={SITE_NAME} className="block shrink-0">
          <Image
            src="/branding/logo-sabhoy.png"
            alt={SITE_NAME}
            width={427}
            height={120}
            priority
            unoptimized
            className="h-12 w-auto max-w-[min(100%,26rem)] md:h-14"
          />
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher locale={locale} />
          <UserNav locale={locale} />
        </div>
      </div>

      <nav
        className="container-page overflow-x-auto !py-0 border-t border-slate-200/70 bg-gradient-to-b from-white to-slate-50/70"
        aria-label={t("nav.main")}
      >
        <ul className="flex min-w-max items-center gap-1.5 py-2 md:py-2.5">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`sab-nav-link ${active ? "sab-nav-link-active" : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  <NavItemIcon id={item.icon} className="h-4 w-4 md:h-[1.125rem] md:w-[1.125rem]" />
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
