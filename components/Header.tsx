import Link from "next/link";
import Image from "next/image";
import { UserNav } from "@/components/UserNav";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { NavItemIcon } from "@/components/NavItemIcon";
import { NAV_ITEMS, SITE_NAME } from "@/lib/constants";
import { getNavLabelByHref, getTranslator } from "@/lib/i18n";
import { getLocaleFromCookie } from "@/lib/i18n-server";

export async function Header() {
  const locale = getLocaleFromCookie();
  const t = getTranslator(locale);

  return (
    <header className="sticky top-0 z-40 border-b border-sky-200/80 bg-gradient-to-b from-sky-100 via-sky-50/60 to-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:from-sky-100/85 supports-[backdrop-filter]:to-white/85">
      <div className="container-page flex flex-wrap items-center justify-between gap-3 py-3 md:py-4">
        <Link href="/" aria-label={SITE_NAME} className="block">
          <Image
            src="/branding/logo-sabhoy.png"
            alt={SITE_NAME}
            width={721}
            height={198}
            priority
            className="h-9 w-auto max-w-[min(100%,20rem)] md:h-10 md:max-w-[min(100%,24rem)]"
          />
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher locale={locale} />
          <UserNav locale={locale} />
        </div>
      </div>
      <div className="border-t border-slate-200/70 bg-gradient-to-b from-white to-slate-50/70">
        <nav className="container-page !px-0 !py-0 overflow-x-auto">
          <ul className="flex min-w-max items-center gap-1.5 py-1.5 text-sm font-medium text-slate-700">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group flex items-center gap-1.5 rounded-full px-3.5 py-2 text-slate-700 transition hover:bg-white hover:text-slate-900 hover:shadow-sm"
                >
                  <span className="shrink-0">
                    <NavItemIcon id={item.icon} className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  </span>
                  {getNavLabelByHref(item.href, t)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
