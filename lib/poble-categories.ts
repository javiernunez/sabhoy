import type { PoblePageCategory } from "@prisma/client";

/** Orden fijo de bloques en el índice. */
export const POBLE_CATEGORY_ORDER: PoblePageCategory[] = [
  "MONUMENTS",
  "TRADITIONS",
  "HISTORY",
  "MAYORS",
  "OTHER",
];

export function pobleCategoryLabel(cat: PoblePageCategory, isVal: boolean): string {
  const m: Record<PoblePageCategory, { es: string; val: string }> = {
    MONUMENTS: { es: "Monumentos y patrimonio", val: "Monuments i patrimoni" },
    TRADITIONS: { es: "Tradiciones y fiestas", val: "Tradicions i festes" },
    HISTORY: { es: "Historia", val: "Història" },
    MAYORS: { es: "Alcaldes y gobierno local", val: "Batlles i govern local" },
    OTHER: { es: "Curiosidades", val: "Curiositats" },
  };
  return isVal ? m[cat].val : m[cat].es;
}

export function pobleCategorySeoText(cat: PoblePageCategory, isVal: boolean): string {
  const m: Record<PoblePageCategory, { es: string; val: string }> = {
    MONUMENTS: {
      es: "Lugares emblemáticos, torres, iglesias y patrimonio visible en el municipio.",
      val: "Llocs emblemàtics, torres, esglésies i patrimoni visible al municipi.",
    },
    TRADITIONS: {
      es: "Fiestas patronales, costumbres y celebraciones de San Antonio de Benagéber.",
      val: "Festes patronals, costums i celebracions de San Antonio de Benagéber.",
    },
    HISTORY: {
      es: "Orígenes, evolución urbanística y momentos clave de la historia local.",
      val: "Orígens, evolució urbanística i moments clau de la història local.",
    },
    MAYORS: {
      es: "Mandatos y personajes en la política local (referencia informativa).",
      val: "Mandats i personatges en la política local (referència informativa).",
    },
    OTHER: { es: "Otros temas de interés vecinal.", val: "Altres temes d'interés veïnal." },
  };
  return isVal ? m[cat].val : m[cat].es;
}
