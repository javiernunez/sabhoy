/**
 * Clasifica cada ficha de comercio en un "departamento" para el filtro lateral
 * (estilo comercio electrónico: Restauración, Comercio, Servicios, etc.).
 */

const COMMERCE_DEPARTMENT_ORDER = [
  "restauracion",
  "comercio",
  "servicios",
  "ocio",
  "otros",
] as const;

export type CommerceDepartmentId = (typeof COMMERCE_DEPARTMENT_ORDER)[number];

type LegacyCommerceType = "Restauración" | "Tiendas" | "Ocio y ocio nocturno" | "Servicios" | "Otros";

function includesAny(value: string, terms: string[]): boolean {
  return terms.some((term) => value.includes(term));
}

/** Clasificación interna (orden de comprobación importa). */
function inferLegacyType(categoryRaw: string, nameRaw: string): LegacyCommerceType {
  const category = categoryRaw.toLowerCase();
  const name = nameRaw.toLowerCase();
  const text = `${category} ${name}`;

  // 1) Hostelería y comida
  if (
    includesAny(text, [
      "restaurante",
      "arroceria",
      "arrocería",
      "bar",
      "taberna",
      "bistr",
      "bistró",
      "pizzeria",
      "pizzería",
      "pizza",
      "kebab",
      "sushi",
      "japonesa",
      "japones", // Sushi, Tenchi...
      "china",
      "asiatic",
      "asiàtic",
      "mediterran",
      "italiana",
      "americana",
      "marisco",
      "heladeria",
      "heladería",
      "helader", // Categoria Heladería
      "cocktail",
      "lounge",
      "gastrobar",
      "gastrob",
      "meson",
      "mesón",
      "comida rápida",
      "comida rapida",
      "bocater",
      "bocat",
      "asador",
      "buffet",
      "hamburgues",
      "hambur",
      "wok",
      "döner",
      "doner",
      "tasca",
      "taverna",
      "español", // carta, cocina española (categoría)
      "cerveser",
      "cerves",
      "taperia",
      "tapería",
      "bocac",
      "contemporánea", // Teybal lounge
      "latina",
      "mexic",
      "comidas para llevar",
      "comidas per emportar", // val
      "aperitiv",
    ])
  ) {
    return "Restauración";
  }

  // 2) Comercio al por menor, farmacia, inmobiliaria, etc.
  if (
    includesAny(text, [
      "tienda",
      "tenda",
      "market",
      "boutique",
      "mercat",
      "comerc", // cuidado: no "comercio" general antes de restaurant; aquí poco nombre
      "farmacia",
      "farmac",
      "inmobiliaria",
      "inmobil",
      "inmo ",
      "optica",
      "òptica",
      "óptica",
      "ferreter",
      "aliment",
      "supermerc",
      "hiper",
      "estanco",
      "florer",
      "florister",
      "jugueter",
      "joguinet",
      "bazar",
      "electr",
      "deportes", // tienda
      "moda",
      "ropa",
      "calzado",
      "merceria",
      "llibreria",
      "librer",
      "perfu",
      "paeller", // olla, producto
    ])
  ) {
    return "Tiendas";
  }

  // 3) Ocio nocturno y similar
  if (includesAny(text, ["ocio", "discoteca", "disco", "pub", "karaoke"])) {
    return "Ocio y ocio nocturno";
  }

  // 4) Servicios profesionales, salud, talleres…
  if (
    includesAny(text, [
      "servicio", // categoria genérica
      "taller",
      "mecan",
      "mecànic",
      "reparac",
      "fontaner",
      "electricista",
      "asesor",
      "abogac",
      "abogado",
      "advocat",
      "gestor",
      "gestoria",
      "clínica",
      "clinica",
      "dent",
      "odont",
      "veterin",
      "fisio",
      "peluqu",
      "perruqu", // val
      "gimnas",
      "academia",
      "acadèmia",
    ])
  ) {
    return "Servicios";
  }

  return "Otros";
}

const LEGACY_TO_DEPT: Record<LegacyCommerceType, CommerceDepartmentId> = {
  Restauración: "restauracion",
  Tiendas: "comercio",
  "Ocio y ocio nocturno": "ocio",
  Servicios: "servicios",
  Otros: "otros",
};

export function getCommerceDepartmentId(categoryRaw: string, nameRaw: string): CommerceDepartmentId {
  return LEGACY_TO_DEPT[inferLegacyType(categoryRaw, nameRaw)];
}

export { COMMERCE_DEPARTMENT_ORDER };

export function getCommerceDepartmentLabel(id: CommerceDepartmentId, isVal: boolean): string {
  const labels: Record<CommerceDepartmentId, { es: string; val: string }> = {
    restauracion: { es: "Restauración", val: "Restauració" },
    comercio: { es: "Comercio y negocios", val: "Comerç i negocis" },
    servicios: { es: "Servicios", val: "Serveis" },
    ocio: { es: "Ocio", val: "Oci" },
    otros: { es: "Otros", val: "Altres" },
  };
  return isVal ? labels[id].val : labels[id].es;
}

export function isCommerceDepartmentId(value: string): value is CommerceDepartmentId {
  return (COMMERCE_DEPARTMENT_ORDER as readonly string[]).includes(value);
}

/** Misma lógica histórica (p. ej. comercios relacionados en la fitxa). */
export function inferCommerceType(categoryRaw: string, nameRaw: string): LegacyCommerceType {
  return inferLegacyType(categoryRaw, nameRaw);
}
