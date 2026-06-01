/** Clases reutilizables del diseño SAB Hoy (ver también `app/globals.css`). */
export const ui = {
  link: "font-semibold text-sab-terracotta underline decoration-sab-terracotta/40 underline-offset-[3px] transition hover:text-sab-forest hover:decoration-sab-forest/50",
  linkSubtle: "font-medium text-sab-forest-light transition hover:text-sab-terracotta",
  btnPrimary:
    "inline-flex items-center justify-center rounded-lg bg-sab-terracotta px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sab-terracotta-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sab-terracotta",
  btnGhost:
    "inline-flex items-center justify-center rounded-lg border border-sab-sand bg-white px-3 py-1.5 text-sm font-medium text-sab-ink transition hover:border-sab-terracotta/40 hover:bg-sab-mist",
  card: "rounded-2xl border border-sab-sand/90 bg-white p-4 shadow-[0_2px_12px_rgba(26,22,18,0.06)]",
  cardHover:
    "rounded-2xl border border-sab-sand/90 bg-white p-4 shadow-[0_2px_12px_rgba(26,22,18,0.06)] transition hover:border-sab-terracotta/35 hover:shadow-[0_8px_24px_rgba(26,22,18,0.08)]",
  chip: "inline-block rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
  sectionTitle: "font-serif text-xl font-bold tracking-tight text-sab-ink md:text-2xl",
  pageTitle: "font-serif text-3xl font-bold tracking-tight text-sab-ink md:text-4xl",
  muted: "text-sab-ink/65",
} as const;
