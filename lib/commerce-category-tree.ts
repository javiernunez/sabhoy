/**
 * Árbol de categorías COMMERCE (raíz). Importación desde comerciossab.com y heurística por nombre.
 */
export type CommerceCategorySeed = {
  name: string;
  nameVal: string;
};

export const COMMERCE_ROOT_CATEGORIES: CommerceCategorySeed[] = [
  { name: "Hostelería", nameVal: "Hostaleria" },
  { name: "Salud y Bienestar", nameVal: "Salut i Benestar" },
  { name: "Alimentación", nameVal: "Alimentació" },
  { name: "Belleza", nameVal: "Bellesa" },
  { name: "Educación", nameVal: "Educació" },
  { name: "Automóviles", nameVal: "Automòbils" },
  { name: "Papelería y quioscos", nameVal: "Papereria i quioscs" },
  { name: "Decoración e interiorismo", nameVal: "Decoració i interiorisme" },
  { name: "Moda y complementos", nameVal: "Moda i complements" },
  { name: "Otros servicios", nameVal: "Altres serveis" },
  { name: "Construcción y servicios", nameVal: "Construcció i serveis" },
  { name: "Inmobiliaria", nameVal: "Immobiliària" },
  { name: "Telefonía", nameVal: "Telefonia" },
  { name: "Seguros", nameVal: "Assegurances" },
  { name: "Deportes", nameVal: "Esports" },
  { name: "Imprenta y grafismo", nameVal: "Impremta i grafisme" },
  { name: "Floristerías", nameVal: "Floristeries" },
  { name: "Farmacias", nameVal: "Farmàcies" },
  { name: "Autoescuelas", nameVal: "Autoescoles" },
  { name: "Artesanía", nameVal: "Artesania" },
  { name: "Servicios agrícolas", nameVal: "Serveis agrícoles" },
  { name: "Multitienda", nameVal: "Multibotiga" },
  { name: "Electrodomésticos", nameVal: "Electrodomèstics" },
  { name: "Gestorías", nameVal: "Gestories" },
  { name: "Internet", nameVal: "Internet" },
  { name: "Tatuajes", nameVal: "Tatuatges" },
  { name: "Comunicación", nameVal: "Comunicació" },
  { name: "Entidades bancarias", nameVal: "Entitats bancàries" },
  { name: "Droguería y perfumería", nameVal: "Drogueria i perfumeria" },
  { name: "Ferreterías", nameVal: "Ferreteries" },
  { name: "Informática", nameVal: "Informàtica" },
  { name: "Mascotas", nameVal: "Mascotes" },
];

/** Categorías en gestion.comerciossab.com/api/categorias → categoría raíz local. */
export const SAB_CATEGORY_NAME_MAP: Record<string, string> = {
  Hosteleria: "Hostelería",
  "Bares y Cafeterías": "Hostelería",
  Restaurante: "Hostelería",
  "Taberna / Cervecerías": "Hostelería",
  Peluquería: "Belleza",
  "Centros de estética y belleza": "Belleza",
  "Spas y masajes": "Belleza",
  "Agencia de Marketing ": "Comunicación",
  "Agencia de Marketing": "Comunicación",
  "Bienestar integral y emprendimiento": "Salud y Bienestar",
  "Librerías y papelerías": "Papelería y quioscos",
  "Imprentas / copisterías": "Imprenta y grafismo",
  Impresión: "Imprenta y grafismo",
  "Artes Gráficas": "Imprenta y grafismo",
  "Comunicación Visual": "Comunicación",
  Inmobiliarias: "Inmobiliaria",
  "Clínica Dental": "Salud y Bienestar",
  "Agencia de Seguros": "Seguros",
  "Farmacias y parafarmacias": "Farmacias",
  Ópticas: "Salud y Bienestar",
  Ferreterías: "Ferreterías",
  "Material de Construccion": "Construcción y servicios",
  Gimnasios: "Deportes",
  "Clínicas veterinarias": "Mascotas",
  Floristerias: "Floristerías",
  "Academia de Danza": "Deportes",
  "Centros Educativos": "Educación",
  "Panaderías y pastelerías": "Alimentación",
  "Entidad Financiera": "Entidades bancarias",
  "Gestorías / Asesorías": "Gestorías",
  Psicología: "Salud y Bienestar",
  Motel: "Otros servicios",
  Alojamiento: "Otros servicios",
  Comercio: "Otros servicios",
};

/** Slug de taxonomía WordPress en acbetera.com → nombre de categoría raíz. */
export const ACBETERA_CATEGORY_SLUG_MAP: Record<string, string> = {
  hosteleria: "Hostelería",
  "salud-y-bienestar": "Salud y Bienestar",
  alimentacion: "Alimentación",
  belleza: "Belleza",
  educacion: "Educación",
  automoviles: "Automóviles",
  "papeleria-quioscos": "Papelería y quioscos",
  "decoracion-e-interiorismo": "Decoración e interiorismo",
  "moda-y-complementos": "Moda y complementos",
  "otros-servicios": "Otros servicios",
  "construccion-servicios": "Construcción y servicios",
  inmobiliaria: "Inmobiliaria",
  telefonia: "Telefonía",
  seguros: "Seguros",
  deportes: "Deportes",
  "imprenta-grafismo": "Imprenta y grafismo",
  floristerias: "Floristerías",
  farmacias: "Farmacias",
  autoescuelas: "Autoescuelas",
  artesania: "Artesanía",
  "servicios-agricolas": "Servicios agrícolas",
  multitienda: "Multitienda",
  electrodomesticos: "Electrodomésticos",
  gestorias: "Gestorías",
  internet: "Internet",
  tatuajes: "Tatuajes",
  comunicacion: "Comunicación",
  "entidades-bancarias": "Entidades bancarias",
  "drogueria-perfumeria": "Droguería y perfumería",
  ferreterias: "Ferreterías",
  informatica: "Informática",
  mascotas: "Mascotas",
};

export function categoryPathFromSabCategories(
  categorias: Record<string, string> | null | undefined,
  name: string,
  description: string,
): string {
  if (categorias) {
    for (const label of Object.values(categorias)) {
      const mapped = SAB_CATEGORY_NAME_MAP[label.trim()];
      if (mapped && mapped !== "Otros servicios") return mapped;
    }
    for (const label of Object.values(categorias)) {
      const mapped = SAB_CATEGORY_NAME_MAP[label.trim()];
      if (mapped) return mapped;
    }
  }
  return inferCommerceCategoryPath(name, description);
}

export function inferCommerceCategoryPath(name: string, description: string): string {
  const t = `${name} ${description}`.toLowerCase();

  if (/restaurante|bar |cafeter|taper|forn|pastiss|hosteler|gastro|mesón|meson|pizzer|asador|cervecer|tapas|bistr|cantina|horno|panader/.test(t)) {
    return "Hostelería";
  }
  if (/farmaci|clínica dental|clinica dental|fisioterap|osteopat|nutrici|salud|dentista|óptica|optica/.test(t)) {
    return "Salud y Bienestar";
  }
  if (/coviran|supermercado|alimentaci|charcuter|carnicer|fruter/.test(t)) {
    return "Alimentación";
  }
  if (/peluquer|barber|estética|estetica|belleza|uñas|unas|tatuaj/.test(t)) {
    return "Belleza";
  }
  if (/autoescuela|academia|educaci|guarder|idiomas/.test(t)) {
    return "Educación";
  }
  if (/taller|motor|automóvil|automovil|concesionario|neumát|neumat|mecánic|mecanic|bikes|biciclet/.test(t)) {
    return "Automóviles";
  }
  if (/papeler|quiosco|lotería|loteria/.test(t)) {
    return "Papelería y quioscos";
  }
  if (/decoraci|interiorismo|mueble/.test(t)) {
    return "Decoración e interiorismo";
  }
  if (/moda|ropa|calzado|complemento|joyer/.test(t)) {
    return "Moda y complementos";
  }
  if (/arquitect|construcc|reforma|fontaner|electric/.test(t)) {
    return "Construcción y servicios";
  }
  if (/inmobiliar/.test(t)) {
    return "Inmobiliaria";
  }
  if (/telefon|móvil|movil/.test(t)) {
    return "Telefonía";
  }
  if (/segur|corredur/.test(t)) {
    return "Seguros";
  }
  if (/deporte|gimnas|fitness|padel|fútbol|futbol/.test(t)) {
    return "Deportes";
  }
  if (/imprent|grafism|rotul/.test(t)) {
    return "Imprenta y grafismo";
  }
  if (/florister/.test(t)) {
    return "Floristerías";
  }
  if (/gestor|asesor|asesoría|asesoria|abogad/.test(t)) {
    return "Gestorías";
  }
  if (/electrodom|informát|informatic|ordenador|software|pixel|web |internet/.test(t)) {
    return /electrodom/.test(t) ? "Electrodomésticos" : "Informática";
  }
  if (/mascot|veterin|pienso/.test(t)) {
    return "Mascotas";
  }
  if (/ferreter/.test(t)) {
    return "Ferreterías";
  }
  if (/droguer|perfumer/.test(t)) {
    return "Droguería y perfumería";
  }
  if (/banco|entidad bancaria/.test(t)) {
    return "Entidades bancarias";
  }
  if (/artesan/.test(t)) {
    return "Artesanía";
  }
  if (/agrícol|agricol|vivero/.test(t)) {
    return "Servicios agrícolas";
  }
  if (/multitienda|bazar/.test(t)) {
    return "Multitienda";
  }
  if (/comunicaci|marketing|medios/.test(t)) {
    return "Comunicación";
  }

  return "Otros servicios";
}
