export type AssociationSectionConfig = {
  slug: "casales" | "clubes-deportivos" | "ampas" | "vecinales" | "ongs";
  labelEs: string;
  labelVal: string;
  icon: string;
  categoryHints: string[];
};

export const ASSOCIATION_SECTIONS: AssociationSectionConfig[] = [
  {
    slug: "casales",
    labelEs: "Casales",
    labelVal: "Casals",
    icon: "🎉",
    categoryHints: ["casal", "falla", "fallero"],
  },
  {
    slug: "clubes-deportivos",
    labelEs: "Clubes deportivos",
    labelVal: "Clubs esportius",
    icon: "🏅",
    categoryHints: ["club", "deport", "esport"],
  },
  {
    slug: "ampas",
    labelEs: "AMPAs y familias",
    labelVal: "AMPA i families",
    icon: "👨‍👩‍👧‍👦",
    categoryHints: ["ampa", "familia", "escolar"],
  },
  {
    slug: "vecinales",
    labelEs: "Asociaciones vecinales",
    labelVal: "Associacions veinals",
    icon: "🏘️",
    categoryHints: ["vecinal", "vecino", "veinal", "vei"],
  },
  {
    slug: "ongs",
    labelEs: "ONGs",
    labelVal: "ONGs",
    icon: "🤝",
    categoryHints: ["ong", "solidar", "social", "fundacion", "fundació"],
  },
];

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "")
    .trim();
}

export function getAssociationSectionConfig(slug: AssociationSectionConfig["slug"]) {
  return ASSOCIATION_SECTIONS.find((section) => section.slug === slug);
}

export function matchesAssociationSection(categoryName: string, section: AssociationSectionConfig): boolean {
  const base = normalize(categoryName);
  return section.categoryHints.some((hint) => base.includes(normalize(hint)));
}
