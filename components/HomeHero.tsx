import Link from "next/link";
import { CtaLink } from "@/components/CtaLink";
import { QUICK_ACCESS, SITE_NAME } from "@/lib/constants";

type Props = {
  isVal: boolean;
};

export function HomeHero({ isVal }: Props) {
  return (
    <section
      className="relative overflow-hidden rounded-3xl border border-sab-forest/20 bg-gradient-to-br from-sab-forest via-[#234d3a] to-sab-forest-light px-6 py-10 text-sab-cream shadow-sab-lg md:px-10 md:py-12"
      aria-labelledby="home-hero-title"
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-sab-terracotta/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 left-1/4 h-48 w-48 rounded-full bg-sab-gold/15 blur-3xl"
        aria-hidden
      />

      <p className="sab-section-kicker !text-sab-gold/90">{isVal ? "Camp de Túria · València" : "Camp de Túria · Valencia"}</p>
      <h1 id="home-hero-title" className="mt-2 max-w-2xl font-serif text-3xl font-bold leading-tight md:text-4xl lg:text-[2.75rem]">
        {isVal ? "El teu portal a " : "Tu portal en "}
        <span className="text-sab-gold">San Antonio de Benagéber</span>
      </h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-sab-cream/85 md:text-lg">
        {isVal
          ? "Notícies, agenda, comerços i informació pràctica del teu municipi al Camp de Túria."
          : "Noticias, agenda, comercios e información práctica de tu municipio en el Camp de Túria."}
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <CtaLink
          href="/denuncias/nueva"
          trackParams={{ cta_name: "home_hero_report", cta_context: "home_hero", destination: "/denuncias/nueva" }}
          className="rounded-xl bg-sab-terracotta px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-sab-terracotta-dark"
        >
          {isVal ? "Enviar incidència" : "Enviar incidencia"}
        </CtaLink>
        <CtaLink
          href="/noticias"
          trackParams={{ cta_name: "home_hero_news", cta_context: "home_hero", destination: "/noticias" }}
          className="rounded-xl border border-sab-cream/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
        >
          {isVal ? "Últimes notícies" : "Últimas noticias"}
        </CtaLink>
      </div>

      <ul className="mt-8 flex flex-wrap gap-2 border-t border-white/15 pt-6">
        {QUICK_ACCESS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="inline-block rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-sab-cream transition hover:bg-sab-terracotta/90 hover:text-white"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-xs text-sab-cream/50">
        {SITE_NAME} · {isVal ? "Informació local de SAB" : "Información local de SAB"}
      </p>
    </section>
  );
}
