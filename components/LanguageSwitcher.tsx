import Image from "next/image";
import { setLocaleAction } from "@/lib/set-locale";
import type { Locale } from "@/lib/i18n";

type LanguageSwitcherProps = {
  locale: Locale;
  /** Ruta actual para volver tras cambiar idioma (p. ej. desde cabecera en páginas internas). */
  returnTo?: string;
};

export function LanguageSwitcher({ locale, returnTo = "/" }: LanguageSwitcherProps) {
  return (
    <div
      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1"
      aria-label="Selector de idioma"
    >
      <form action={setLocaleAction}>
        <input type="hidden" name="locale" value="es" />
        <input type="hidden" name="returnTo" value={returnTo} />
        <button
          type="submit"
          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition ${
            locale === "es" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
          aria-label="Cambiar a castellano"
          aria-current={locale === "es" ? "true" : undefined}
        >
          <Image
            src="/images/flags/spain-flag.png"
            alt=""
            width={20}
            height={14}
            className="h-[14px] w-[20px] rounded-sm border border-white/50 object-cover"
          />
          CAST
        </button>
      </form>
      <form action={setLocaleAction}>
        <input type="hidden" name="locale" value="val" />
        <input type="hidden" name="returnTo" value={returnTo} />
        <button
          type="submit"
          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition ${
            locale === "val" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
          aria-label="Canviar a valencià"
          aria-current={locale === "val" ? "true" : undefined}
        >
          <Image
            src="/images/flags/valencia-flag.png"
            alt=""
            width={20}
            height={14}
            className="h-[14px] w-[20px] rounded-sm border border-white/50 object-cover"
          />
          VAL
        </button>
      </form>
    </div>
  );
}
