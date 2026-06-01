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
    <header className="sticky top-0 z-40 border-b border-sab-sand/80 bg-sab-cream/95 shadow-sm backdrop-blur-md">
      <div className="border-b-4 border-sab-terracotta bg-white">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-3 md:py-3.5">
          <Link href="/" aria-label={SITE_NAME} className="flex items-center gap-3">
            <Image
              src="/branding/logo-sabhoy.png"
              alt={SITE_NAME}
              width={427}
              height={120}
              priority
              unoptimized
              className="h-9 w-auto max-w-[min(100%,22rem)] md:h-10"
            />
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher locale={locale} />
            <UserNav locale={locale} />
          </div>
        </div>
      </div>

      <nav className="container-page overflow-x-auto !py-0" aria-label={t("nav.main")}>
        <ul className="flex min-w-max items-center gap-1 py-2">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`sab-nav-link ${active ? "sab-nav-link-active" : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  <NavItemIcon id={item.icon} className="h-3.5 w-3.5 md:h-4 md:w-4" />
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
