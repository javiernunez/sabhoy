import type { Locale } from "@/lib/i18n";

export function localizedText(locale: Locale, es: string | null | undefined, val: string | null | undefined): string {
  const esSafe = (es ?? "").trim();
  const valSafe = (val ?? "").trim();
  if (locale === "val") return valSafe || esSafe;
  return esSafe || valSafe;
}
