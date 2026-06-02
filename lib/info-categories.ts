export type InfoCategorySlug = "colegios" | "salud" | "tramites" | "movilidad";

export type InfoCategory = {
  slug: InfoCategorySlug;
  evergreenSlug: string;
  title: string;
  titleVal: string;
  description: string;
  descriptionVal: string;
  icon: string;
  color: string;
  colorLight: string;
  colorBorder: string;
  match: RegExp;
};

export const INFO_CATEGORIES: InfoCategory[] = [
  {
    slug: "colegios",
    evergreenSlug: "colegios-sab",
    title: "Educación y colegios",
    titleVal: "Educació i col·legis",
    description: "Colegios e institutos en San Antonio de Benagéber. Información para familias.",
    descriptionVal: "Col·legis i instituts a Sant Antoni de Benaixeve. Informació per a famílies.",
    icon: "🎒",
    color: "text-sky-700",
    colorLight: "bg-sky-50",
    colorBorder: "border-sky-200 hover:border-sky-400",
    match: /(educaci[oó]n|colegio|instituto|escuela|familia|infantil|juventud|beca|actividades.*ni[nñ]os)/i,
  },
  {
    slug: "salud",
    evergreenSlug: "salud-sab",
    title: "Salud y emergencias",
    titleVal: "Salut i emergències",
    description: "Consultorio, nuevo centro de salud, farmacias de guardia y teléfonos de urgencia.",
    descriptionVal: "Consultori, nou centre de salut, farmàcies de guàrdia i telèfons d'urgència.",
    icon: "🏥",
    color: "text-red-700",
    colorLight: "bg-red-50",
    colorBorder: "border-red-200 hover:border-red-400",
    match: /(salud|m[eé]dico|hospital|farmacia|urgencia|emergencia|112|centro de salud|consultorio)/i,
  },
  {
    slug: "tramites",
    evergreenSlug: "tramites-sab",
    title: "Servicios y trámites",
    titleVal: "Serveis i tràmits",
    description: "Empadronamiento, documentación, ayudas y gestiones con el Ayuntamiento de SAB.",
    descriptionVal: "Empadronament, documentació, ajudes i gestions amb l'ajuntament de SAB.",
    icon: "🧾",
    color: "text-blue-700",
    colorLight: "bg-blue-50",
    colorBorder: "border-blue-200 hover:border-blue-400",
    match: /(tramite|trámite|document|certific|empadron|ayuda|servicio|sede|oficina|impuesto|padr[oó]n|basura|residuo|punto.*limpio)/i,
  },
  {
    slug: "movilidad",
    evergreenSlug: "movilidad-sab",
    title: "Movilidad y transporte",
    titleVal: "Mobilitat i transport",
    description: "Metro, autobús Metrobus, aparcamientos y cómo moverte por SAB y el Camp de Túria.",
    descriptionVal: "Metro, autobús Metrobus, aparcaments i com moure't per SAB i el Camp de Túria.",
    icon: "🚌",
    color: "text-blue-700",
    colorLight: "bg-blue-50",
    colorBorder: "border-blue-200 hover:border-blue-400",
    match: /(transporte|metro|bus|autob[uú]s|tr[aá]fico|aparc|movilidad|carretera|coche|bicicleta)/i,
  },
];

export function getCategoryBySlug(slug: string): InfoCategory | undefined {
  return INFO_CATEGORIES.find((c) => c.slug === slug);
}

export function getCategoryForPage(page: { title: string; slug: string }): InfoCategory | undefined {
  const searchableText = `${page.title} ${page.slug}`;
  return INFO_CATEGORIES.find((category) => category.match.test(searchableText));
}
