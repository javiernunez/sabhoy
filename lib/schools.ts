export type SchoolType = "publico" | "concertado" | "privado";

export type School = {
  slug: string;
  name: string;
  nameVal?: string;
  type: SchoolType;
  description: string;
  descriptionVal: string;
  address?: string;
  phone?: string;
  website?: string;
  evergreenSlug: string;
};

export const SCHOOL_TYPES: Record<SchoolType, { label: string; labelVal: string; color: string; colorLight: string }> = {
  publico: { label: "Público", labelVal: "Públic", color: "text-blue-700", colorLight: "bg-blue-50" },
  concertado: { label: "Concertado", labelVal: "Concertat", color: "text-purple-700", colorLight: "bg-purple-50" },
  privado: { label: "Privado", labelVal: "Privat", color: "text-indigo-700", colorLight: "bg-indigo-50" },
};

export const SCHOOLS: School[] = [
  {
    slug: "ceip-san-antonio",
    name: "CEIP San Antonio",
    nameVal: "CEIP Sant Antoni",
    type: "publico",
    description:
      "Colegio público de educación infantil y primaria en el casco urbano de San Antonio de Benagéber. Referencia para familias del núcleo central del municipio.",
    descriptionVal:
      "Col·legi públic d'educació infantil i primària al nucli urbà de Sant Antoni de Benaixeve.",
    address: "San Antonio de Benagéber",
    evergreenSlug: "colegio-ceip-san-antonio",
  },
  {
    slug: "ceip-montesano",
    name: "CEIP Montesano",
    nameVal: "CEIP Montesano",
    type: "publico",
    description:
      "Centro público que da servicio a la urbanización Montesano y zonas residenciales del entorno. Etapas de infantil y primaria.",
    descriptionVal: "Centre públic que dóna servei a la urbanització Montesano. Infantil i primària.",
    address: "Urbanización Montesano — San Antonio de Benagéber",
    evergreenSlug: "colegio-ceip-montesano",
  },
  {
    slug: "ies-san-antonio-benageber",
    name: "IES San Antonio de Benagéber",
    nameVal: "IES Sant Antoni de Benaixeve",
    type: "publico",
    description:
      "Instituto de Educación Secundaria bilingüe en la calle San Vicente Ferrer. ESO, Bachillerato y Formación Profesional Básica para el alumnado del municipio y alrededores.",
    descriptionVal:
      "Institut d'Educació Secundària bilingüe al carrer Sant Vicent Ferrer. ESO, Batxillerat i FPB.",
    address: "C. San Vicente Ferrer, 1-2 — 46184 San Antonio de Benagéber",
    phone: "961 206 325",
    website: "https://portal.edu.gva.es/iessanantoniodebenageber/",
    evergreenSlug: "colegio-ies-san-antonio",
  },
  {
    slug: "ies-fundacion-san-vicente-ferrer",
    name: "IES Fundación San Vicente Ferrer",
    nameVal: "IES Fundació Sant Vicent Ferrer",
    type: "concertado",
    description:
      "Centro concertado de secundaria y bachillerato en la zona de la Vereda. Opción para familias que buscan modelo concertado en el Camp de Túria.",
    descriptionVal: "Centre concertat de secundària i batxillerat a la zona de la Vereda.",
    address: "C. Vereda s/n — San Antonio de Benagéber",
    evergreenSlug: "colegio-ies-fundacion-san-vicente",
  },
];

export function getSchoolBySlug(slug: string): School | undefined {
  return SCHOOLS.find((s) => s.slug === slug);
}

export function getSchoolsByType(type: SchoolType): School[] {
  return SCHOOLS.filter((s) => s.type === type);
}
