export type CommerceSectionSlug =
  | "restaurantes"
  | "tiendas"
  | "salud"
  | "belleza"
  | "gimnasios"
  | "servicios"
  | "automoviles"
  | "tecnologia";

export type CommerceSectionConfig = {
  slug: CommerceSectionSlug;
  labelEs: string;
  labelVal: string;
  icon: string;
  categoryNames: string[];
  descriptionEs: string;
  descriptionVal: string;
};

export const COMMERCE_SECTIONS: CommerceSectionConfig[] = [
  {
    slug: "restaurantes",
    labelEs: "Hostelería",
    labelVal: "Hostaleria",
    icon: "🍽️",
    categoryNames: ["Hostelería"],
    descriptionEs: "Bares, restaurantes y cafeterías de San Antonio de Benagéber.",
    descriptionVal: "Bars, restaurants i cafeteries de San Antonio de Benagéber.",
  },
  {
    slug: "tiendas",
    labelEs: "Tiendas",
    labelVal: "Botigues",
    icon: "🛍️",
    categoryNames: [
      "Alimentación",
      "Moda y complementos",
      "Multitienda",
      "Electrodomésticos",
      "Papelería y quioscos",
      "Decoración e interiorismo",
      "Floristerías",
      "Ferreterías",
      "Droguería y perfumería",
      "Artesanía",
      "Mascotas",
    ],
    descriptionEs: "Comercios de proximidad, moda, hogar y alimentación.",
    descriptionVal: "Comerços de proximitat, moda, llar i alimentació.",
  },
  {
    slug: "salud",
    labelEs: "Salud",
    labelVal: "Salut",
    icon: "🏥",
    categoryNames: ["Salud y Bienestar", "Farmacias"],
    descriptionEs: "Farmacias, clínicas, fisioterapia y bienestar.",
    descriptionVal: "Farmàcies, clíniques, fisioteràpia i benestar.",
  },
  {
    slug: "belleza",
    labelEs: "Belleza",
    labelVal: "Bellesa",
    icon: "💇",
    categoryNames: ["Belleza", "Tatuajes"],
    descriptionEs: "Peluquerías, estética y cuidado personal.",
    descriptionVal: "Perruqueries, estètica i cura personal.",
  },
  {
    slug: "gimnasios",
    labelEs: "Deporte",
    labelVal: "Esport",
    icon: "🏋️",
    categoryNames: ["Deportes"],
    descriptionEs: "Gimnasios, danza y actividad física.",
    descriptionVal: "Gimnasos, dansa i activitat física.",
  },
  {
    slug: "servicios",
    labelEs: "Servicios",
    labelVal: "Serveis",
    icon: "📋",
    categoryNames: [
      "Gestorías",
      "Seguros",
      "Inmobiliaria",
      "Construcción y servicios",
      "Servicios agrícolas",
      "Educación",
      "Autoescuelas",
      "Otros servicios",
      "Entidades bancarias",
    ],
    descriptionEs: "Profesionales, gestorías, academias y otros servicios locales.",
    descriptionVal: "Professionals, gestories, acadèmies i altres serveis locals.",
  },
  {
    slug: "automoviles",
    labelEs: "Automóviles",
    labelVal: "Automòbils",
    icon: "🚗",
    categoryNames: ["Automóviles"],
    descriptionEs: "Talleres, taxis y servicios del motor.",
    descriptionVal: "Tallers, taxis i serveis del motor.",
  },
  {
    slug: "tecnologia",
    labelEs: "Tecnología",
    labelVal: "Tecnologia",
    icon: "💻",
    categoryNames: ["Informática", "Telefonía", "Internet", "Comunicación", "Imprenta y grafismo"],
    descriptionEs: "Informática, telefonía, internet y comunicación.",
    descriptionVal: "Informàtica, telefonia, internet i comunicació.",
  },
];

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "")
    .trim();
}

export function isCommerceSectionSlug(value: string): value is CommerceSectionSlug {
  return COMMERCE_SECTIONS.some((section) => section.slug === value);
}

export function getCommerceSectionConfig(slug: CommerceSectionSlug) {
  return COMMERCE_SECTIONS.find((section) => section.slug === slug);
}

export function sectionCategoryNameSet(section: CommerceSectionConfig): Set<string> {
  return new Set(section.categoryNames.map((name) => normalize(name)));
}

export function categoryMatchesSection(
  categoryName: string,
  section: CommerceSectionConfig,
): boolean {
  return sectionCategoryNameSet(section).has(normalize(categoryName));
}
