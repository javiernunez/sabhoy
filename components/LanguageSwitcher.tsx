import Image from "next/image";
import { setLocaleAction } from "@/lib/set-locale";
import type { Locale } from "@/lib/i18n";

type LanguageSwitcherProps = {
  locale: Locale;
  /** Ruta actual para volver tras cambiar idioma (p. ej. desde cabecera en páginas internas). */
  returnTo?: string;
  variant?: "default" | "header";
};

export function LanguageSwitcher({ locale, returnTo = "/", variant = "default" }: LanguageSwitcherProps) {
  const onDark = variant === "header";
  const shellClass = onDark
    ? "inline-flex items-center gap-0.5 rounded-lg border border-white/20 bg-white/10 p-0.5 backdrop-blur"
    : "inline-flex items-center gap-1 rounded-lg border border-sab-sand bg-white p-0.5";
  const activeClass = onDark ? "bg-sab-terracotta text-white shadow-sm" : "bg-sab-forest text-white shadow-sm";
  const idleClass = onDark ? "text-sab-cream/85 hover:bg-white/10" : "text-sab-ink/70 hover:bg-sab-mist";

  return (
    <div className={shellClass} aria-label="Selector de idioma">
      <form action={setLocaleAction}>
        <input type="hidden" name="locale" value="es" />
        <input type="hidden" name="returnTo" value={returnTo} />
        <button
          type="submit"
          className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold transition ${
            locale === "es" ? activeClass : idleClass
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
          ES
        </button>
      </form>
      <form action={setLocaleAction}>
        <input type="hidden" name="locale" value="val" />
        <input type="hidden" name="returnTo" value={returnTo} />
        <button
          type="submit"
          className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold transition ${
            locale === "val" ? activeClass : idleClass
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
          VA
        </button>
      </form>
    </div>
  );
}
