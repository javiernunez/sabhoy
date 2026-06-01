import { cookies } from "next/headers";
import { DEFAULT_LOCALE, isLocale, type Locale, LOCALE_COOKIE } from "@/lib/i18n";

export function getLocaleFromCookie(): Locale {
  const raw = cookies().get(LOCALE_COOKIE)?.value;
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}
