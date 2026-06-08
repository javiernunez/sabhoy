import { PrismaClient, ArticleCategory } from "@prisma/client";
import { seedCommerceRootCategories } from "../lib/seed-commerce-categories";

const prisma = new PrismaClient();

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type CategorySeed = {
  kind: "COMMERCE" | "SPORT" | "ASSOCIATION" | "POLITICS";
  name: string;
  nameVal?: string | null;
  children?: Array<{ name: string; nameVal?: string | null }>;
};

const BASE_DIRECTORY_CATEGORIES: CategorySeed[] = [
  {
    kind: "SPORT",
    name: "Deporte",
    nameVal: "Esport",
    children: [
      { name: "Futbol", nameVal: "Futbol" },
      { name: "Baloncesto", nameVal: "Basquet" },
      { name: "Tenis", nameVal: "Tenis" },
    ],
  },
  {
    kind: "ASSOCIATION",
    name: "Asociacion vecinal",
    nameVal: "Associacio veinal",
    children: [],
  },
  {
    kind: "ASSOCIATION",
    name: "Cultura",
    nameVal: "Cultura",
    children: [{ name: "Musica", nameVal: "Musica" }],
  },
  {
    kind: "POLITICS",
    name: "Partits",
    nameVal: "Partidos",
    children: [{ name: "Municipal", nameVal: "Municipal" }],
  },
];

async function upsertDirectoryCategory(
  kind: "COMMERCE" | "SPORT" | "ASSOCIATION" | "POLITICS",
  name: string,
  nameVal?: string | null,
  parentId?: number | null,
) {
  const existing = await prisma.localDirectoryCategory.findFirst({
    where: { kind, name, parentId: parentId ?? null },
  });
  if (existing) {
    return prisma.localDirectoryCategory.update({
      where: { id: existing.id },
      data: { nameVal: nameVal ?? existing.nameVal ?? null },
    });
  }
  let baseSlug: string;
  if (parentId) {
    const parent = await prisma.localDirectoryCategory.findUnique({ where: { id: parentId } });
    if (!parent) throw new Error(`Parent category not found: ${parentId}`);
    baseSlug = slugify(`${parent.name}-${name}`);
  } else {
    baseSlug = slugify(name);
  }
  if (!baseSlug) baseSlug = "categoria";

  for (let counter = 0; counter < 10_000; counter++) {
    const slug = counter === 0 ? baseSlug : `${baseSlug}-${counter}`;
    const bySlug = await prisma.localDirectoryCategory.findFirst({ where: { kind, slug } });
    if (!bySlug) {
      return prisma.localDirectoryCategory.create({
        data: { kind, name, nameVal: nameVal ?? null, parentId: parentId ?? null, slug },
      });
    }
    if (bySlug.name === name && (bySlug.parentId ?? null) === (parentId ?? null)) {
      return prisma.localDirectoryCategory.update({
        where: { id: bySlug.id },
        data: { nameVal: nameVal ?? bySlug.nameVal ?? null },
      });
    }
  }
  throw new Error(`No se pudo asignar slug único para categoría ${kind} / ${name}`);
}

async function seedDirectoryCategories() {
  await seedCommerceRootCategories();
  for (const root of BASE_DIRECTORY_CATEGORIES) {
    const parent = await upsertDirectoryCategory(root.kind, root.name, root.nameVal ?? null, null);
    for (const child of root.children ?? []) {
      await upsertDirectoryCategory(root.kind, child.name, child.nameVal ?? null, parent.id);
    }
  }
}

async function seedLocalDirectory() {
  const commerce: Array<{
    kind: "COMMERCE";
    name: string;
    category: string;
    description: string;
    sortOrder: number;
  }> = [
    { kind: "COMMERCE", name: "Centro Comercial El Osito", category: "Supermercado", description: "Zona comercial de referencia en San Antonio de Benagéber con restauración y servicios.", sortOrder: 10 },
    { kind: "COMMERCE", name: "Mercadona San Antonio de Benagéber", category: "Supermercado", description: "Supermercado de proximidad para la compra diaria.", sortOrder: 20 },
    { kind: "COMMERCE", name: "Consum Colinas", category: "Supermercado", description: "Cooperativa de consumo en la urbanización Colinas de San Antonio.", sortOrder: 30 },
    { kind: "COMMERCE", name: "Farmacia Montesano", category: "Clinica", description: "Oficina de farmacia en la zona de Montesano.", sortOrder: 40 },
    { kind: "COMMERCE", name: "Bar Restaurante Nieva", category: "Bar", description: "Hostelería en el casco urbano de SAB.", sortOrder: 50 },
    { kind: "COMMERCE", name: "Pizzería San Vicente", category: "Italiana", description: "Restauración italiana en la urbanización San Vicente.", sortOrder: 60 },
    { kind: "COMMERCE", name: "Cafetería Plaza Ayuntamiento", category: "Bar", description: "Bar de barrio junto al centro cívico.", sortOrder: 70 },
  ];

  const associations: Array<{
    kind: "ASSOCIATION";
    name: string;
    category: string;
    description: string;
    sortOrder: number;
  }> = [
    { kind: "ASSOCIATION", name: "ACDSAB — Asociación Cultural Deportiva", category: "Deporte", description: "Plataforma deportiva municipal: fútbol, baloncesto, karate, danza, tenis y más. info@acdsab.com · www.acdsab.com", sortOrder: 10 },
    { kind: "ASSOCIATION", name: "Asociación de Vecinos de Colinas", category: "Asociacion vecinal", description: "Representación vecinal de la urbanización Colinas de San Antonio.", sortOrder: 20 },
    { kind: "ASSOCIATION", name: "Asociación de Vecinos de Montesano", category: "Asociacion vecinal", description: "Asociación de vecinos de Montesano.", sortOrder: 30 },
    { kind: "ASSOCIATION", name: "Sociedad Musical San Antonio de Benagéber", category: "Musica", description: "Tradición musical del municipio.", sortOrder: 40 },
    { kind: "ASSOCIATION", name: "Sociedad Coral San Antonio de Benagéber", category: "Musica", description: "Coral municipal.", sortOrder: 50 },
    { kind: "ASSOCIATION", name: "San Antonio de Benagéber Club de Fútbol", category: "Futbol", description: "Club de fútbol local.", sortOrder: 60 },
    { kind: "ASSOCIATION", name: "Asociación de Teatro SAB", category: "Cultura", description: "Grupo de teatro amateur del municipio.", sortOrder: 70 },
    { kind: "ASSOCIATION", name: "Peña Valencianista SAB", category: "Cultura", description: "Afición valencianista en el municipio.", sortOrder: 80 },
    { kind: "ASSOCIATION", name: "SABJOVE — Casa de la Juventud", category: "Cultura", description: "Programación juvenil y de conciliación familiar del Ayuntamiento.", sortOrder: 90 },
  ];

  const imageUrl = "/images/comercios/catalogo-local-placeholder.svg";
  for (const item of [...commerce, ...associations]) {
    const slug = slugify(`${item.kind}-${item.name}`);
    await prisma.localDirectoryEntry.upsert({
      where: { slug },
      update: { ...item, imageUrl },
      create: { ...item, slug, imageUrl },
    });
  }
}

async function seedNostrePoble() {
  const pages = [
    {
      category: "HISTORY" as const,
      slug: "historia-segregacion-1957",
      title: "Historia: segregación de L'Eliana (1957)",
      titleVal: "Història: segregació de l'Eliana (1957)",
      summary: "San Antonio de Benagéber nació como municipio independiente en 1957, una de las pocas segregaciones del siglo XX en la Comunitat Valenciana.",
      summaryVal: "Sant Antoni de Benaixeve naix com a municipi independent el 1957.",
      content: `## Un municipio joven con identidad propia

San Antonio de Benagéber se constituyó como **municipio independiente en 1957**, tras segregarse de **L'Eliana**. Fue una de las escasas segregaciones municipales del siglo XX en la Comunitat Valenciana.

Esa independencia marcó el carácter del pueblo: fuerte sentimiento vecinal en torno a la **Fiesta de la Segregación** (8 de abril) y a las instituciones propias.

## Camp de Túria

El término municipal (8,79 km²) limita con Bétera, L'Eliana, Paterna y La Pobla de Vallbona. Pertenece a la **Mancomunidad de Camp de Túria** y al área metropolitana de Valencia.

## Demografía y perfil

- Población: **~10.630 habitantes** (datos recientes INE en torno a 11.000)
- Densidad muy alta: **~1.220 hab/km²**
- Renta media bruta entre las más altas de la CV (**~33.165 €**, 6.º en la comunidad)
- Municipio residencial de **alto standing** con urbanizaciones como Montesano, Colinas, Cumbres, San Vicente y Pla del Pou`,
      contentVal: `## Municipi jove amb identitat pròpia

Sant Antoni de Benaixeve es va constituir com a **municipi independent el 1957**, segregant-se de **l'Eliana**.

## Camp de Túria

8,79 km². Limita amb Bétera, l'Eliana, Paterna i la Pobla de Vallbona.`,
      sortOrder: 10,
    },
    {
      category: "TRADITIONS" as const,
      slug: "fiesta-de-la-segregacion",
      title: "Fiesta de la Segregación (8 de abril)",
      titleVal: "Festa de la Segregació (8 d'abril)",
      summary: "El 8 de abril se celebra el aniversario de la independencia municipal, acto central de la identidad de San Antonio de Benagéber.",
      summaryVal: "El 8 d'abril es commemora l'aniversari de la independència municipal.",
      content: `Cada **8 de abril** el Ayuntamiento y las asociaciones celebran la **Fiesta de la Segregación**, con actos institucionales en la plaza del Ayuntamiento.

Es la fiesta que refuerza la memoria colectiva del municipio más joven del Camp de Túria.`,
      contentVal: `Cada **8 d'abril** es celebra la **Festa de la Segregació** a la plaça de l'Ajuntament.`,
      sortOrder: 20,
    },
    {
      category: "TRADITIONS" as const,
      slug: "fiestas-patronales-san-isidro-san-roque",
      title: "Fiestas patronales: San Isidro y San Roque",
      titleVal: "Festes patronals: Sant Isidre i Sant Roc",
      summary: "Del 7 al 16 de agosto, las fiestas mayores concentran música, deporte, concursos y actividades para todas las edades.",
      summaryVal: "Del 7 al 16 d'agost, les festes majors del municipi.",
      content: `Las **fiestas patronales** en honor a **San Isidro Labrador** y **San Roque** (7-16 de agosto) son las celebraciones más emblemáticas: misa, procesión, castillo de fuegos, orquestas, deporte (Legua, 3x3, rocódromo) y actividades infantiles.`,
      contentVal: `Festes de **Sant Isidre** i **Sant Roc** (7-16 d'agost): música, esport i foc.`,
      sortOrder: 30,
    },
    {
      category: "OTHER" as const,
      slug: "urbanizaciones-sab",
      title: "Urbanizaciones: Montesano, Colinas, Cumbres…",
      titleVal: "Urbanitzacions: Montesano, Colinas, Cumbres…",
      summary: "El municipio se articula en urbanizaciones residenciales de alto standing que definen su paisaje y vida vecinal.",
      summaryVal: "El municipi s'articula en urbanitzacions residencials de prestigi.",
      content: `## Principales urbanizaciones

- **Montesano** — una de las más pobladas; CEIP propio y fuerte tejido asociativo
- **Colinas de San Antonio** — centro comercial y cine de verano en verano
- **Cumbres de San Antonio** — zona residencial en altura
- **San Vicente** — incluye residencia de mayores y enlace con el IES
- **Pla del Pou** — núcleo residencial del término

El crecimiento planificado explica la demanda de **nuevo centro de salud** y mejoras en **transporte público**.`,
      contentVal: `## Urbanitzacions principals

Montesano, Colinas, Cumbres, Sant Vicent i Pla del Pou.`,
      sortOrder: 40,
    },
  ];

  for (const p of pages) {
    await prisma.nostrePoblePage.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }
}

async function seedArticles() {
  const articles: Array<{
    title: string;
    titleVal?: string;
    slug: string;
    category: ArticleCategory;
    summary: string;
    summaryVal?: string;
    content: string;
    contentVal?: string;
    isHero?: boolean;
    portadaRank?: number;
  }> = [
    {
      title: "Sanidad licita el proyecto del nuevo centro de salud de San Antonio de Benagéber",
      titleVal: "Sanitat licita el projecte del nou centre de salut de Sant Antoni de Benaixeve",
      slug: "sanidad-licita-nuevo-centro-salud-sab-2026",
      category: "GENERAL",
      isHero: true,
      portadaRank: 100,
      summary:
        "La Conselleria licita la redacción del consultorio en la calle Nieva por 494.372 €. Inversión global en obra: 5,7 millones.",
      summaryVal: "La Conselleria licita la redacció del consultori al carrer Nieva.",
      content: `La **Conselleria de Sanidad** ha publicado la licitación para la redacción de proyectos y dirección de obra del **nuevo consultorio auxiliar** de San Antonio de Benagéber, con un presupuesto de **494.372,45 euros** y plazo de ejecución de **33 meses** (9 de redacción + 24 de obra estimados).

El centro se ubicará en la **calle Nieva, 4**, sobre parcela de **1.390 m²** cedida por el Ayuntamiento. El plan funcional prevé **siete consultas de medicina**, siete de enfermería y tres de pediatría, entre otras mejoras respecto al consultorio actual.

La inversión global en construcción se estima en **5,7 millones de euros**, con previsión de licitar las obras en **2027**.`,
      contentVal: `La Conselleria de Sanitat ha licitat la redacció del nou consultori al carrer Nieva, 4. Inversió en obra: 5,7 M€.`,
    },
    {
      title: "Triunfa la moción de censura en San Antonio de Benagéber: Enrique Santafosta recupera la alcaldía",
      titleVal: "Triomfa la moció de censura a Sant Antoni de Benaixeve",
      slug: "mocion-censura-sab-santafosta-alcaldia-2025",
      category: "POLITICA_LOCAL",
      portadaRank: 90,
      summary:
        "En un pleno extraordinario de septiembre de 2025, siete concejales respaldaron la moción contra el gobierno de Eva Tejedor (UCIN).",
      summaryVal: "El setembre de 2025, set regidors van donar suport a la moció de censura.",
      content: `El pleno extraordinario de **septiembre de 2025** aprobó la **moción de censura** presentada contra la alcaldesa **Eva María Tejedor** (UCIN). **Enrique Santafosta**, candidato más votado en las elecciones pero sin alcaldía inicial, recuperó la vara de mando con el apoyo de **Aisab**, una edil expulsada de Vox, Enrique Celda y el propio Santafosta.

Los promotores alegaron **inestabilidad** y **parálisis** de proyectos; el gobierno saliente denunció intereses personales. El debate político sigue marcando la vida municipal de SAB de cara a las elecciones de **2027**.`,
      contentVal: `El setembre de 2025 es va aprovar la moció de censura contra Eva Tejedor. Enrique Santafosta va recuperar l'alcaldia.`,
    },
    {
      title: "SAB estrena nuevas líneas de autobús con conexión directa a las universidades de Valencia",
      slug: "nuevas-lineas-autobus-sab-universidades",
      category: "GENERAL",
      portadaRank: 80,
      summary: "Las líneas 145, 146 y 136 mejoran frecuencia y enlazan con UV y UPV; también entran en servicio líneas nocturnas.",
      content: `El Ayuntamiento de San Antonio de Benagéber puso en marcha la reordenación de **líneas Metrobus** con mejor frecuencia (hasta 20 minutos en punta) y nuevas paradas hacia el **Centro Comercial El Osito** y el polígono.

La línea **136** conecta directamente con la **Universitat de València** y la **UPV**, una demanda histórica de familias y estudiantes del municipio. Además operan las nocturnas **145N** y **135N**.

Pendiente la reubicación de la parada bajo el **puente de la CV-35** por problemas de accesibilidad.`,
    },
    {
      title: "SABJOVE presenta la programación de primavera 2026 para infancia y juventud",
      slug: "sabjove-programacion-primavera-2026",
      category: "CULTURA",
      portadaRank: 70,
      summary: "Actividades gratuitas de abril a junio dentro del Plan Corresponsables SAB 2026.",
      content: `La **Casa de la Juventud** presenta talleres y actividades para **10-12** y **12-16 años** hasta junio de 2026, con inscripción en línea y enfoque en igualdad, educación ambiental y ocio saludable.`,
    },
    {
      title: "Cine de verano 2026 en las urbanizaciones de San Antonio de Benagéber",
      slug: "cine-verano-urbanizaciones-sab-2026",
      category: "CULTURA",
      portadaRank: 60,
      summary: "Proyecciones familiares los sábados de julio en San Vicente, Montesano y Colinas.",
      content: `La Concejalía de Cultura descentraliza el **ciclo de cine de verano**: sesiones al aire libre los sábados de julio en **San Vicente** (12), **Montesano** (19) y **Colinas** (26), a las 21:30 h, con películas familiares.`,
    },
  ];

  for (const a of articles) {
    await prisma.article.upsert({
      where: { slug: a.slug },
      update: {
        title: a.title,
        titleVal: a.titleVal ?? null,
        category: a.category,
        summary: a.summary,
        summaryVal: a.summaryVal ?? null,
        content: a.content,
        contentVal: a.contentVal ?? null,
        status: "published",
        isHero: a.isHero ?? false,
        portadaRank: a.portadaRank ?? 0,
      },
      create: {
        title: a.title,
        titleVal: a.titleVal ?? null,
        slug: a.slug,
        category: a.category,
        summary: a.summary,
        summaryVal: a.summaryVal ?? null,
        content: a.content,
        contentVal: a.contentVal ?? null,
        status: "published",
        isHero: a.isHero ?? false,
        portadaRank: a.portadaRank ?? 0,
      },
    });
  }
}

async function seedEvents() {
  const now = new Date();
  const events = [
    {
      slug: "fiesta-segregacion-2026",
      title: "Fiesta de la Segregación — 69 aniversario",
      titleVal: "Festa de la Segregació — 69é aniversari",
      description: "Actos institucionales en el Ayuntamiento por el aniversario de la independencia municipal (1957).",
      descriptionVal: "Actes institucionals a l'ajuntament.",
      eventDate: new Date("2026-04-08T10:00:00"),
      category: "generico" as const,
    },
    {
      slug: "taller-improvisacion-sabjove-enero-2026",
      title: "Taller de improvisación (Casa de la Cultura)",
      titleVal: "Taller d'improvisació",
      description: "Taller sociocultural municipal. Consultar inscripción en la web del ayuntamiento.",
      eventDate: new Date("2026-01-30T17:00:00"),
      category: "teatro" as const,
    },
    {
      slug: "cine-verano-colinas-2026",
      title: "Cine de verano: Colinas de San Antonio",
      titleVal: "Cinema d'estiu: Colinas",
      description: "Proyección familiar «Mía y el león blanco» en la plaza del centro comercial. 21:30 h.",
      eventDate: new Date("2026-07-26T21:30:00"),
      category: "generico" as const,
    },
    {
      slug: "fiestas-patronales-sab-2026",
      title: "Fiestas patronales San Isidro y San Roque",
      titleVal: "Festes patronals Sant Isidre i Sant Roc",
      description: "Fiestas mayores del 7 al 16 de agosto: música, deporte, concursos y actividades para todos los públicos.",
      eventDate: new Date("2026-08-07T18:00:00"),
      category: "feria" as const,
      details: { endDate: "2026-08-16" },
    },
    {
      slug: "sabjove-plan-corresponsables-junio-2026",
      title: "SABJOVE — actividades abril-junio 2026",
      titleVal: "SABJOVE — activitats abril-juny 2026",
      description: "Programación de la Casa de la Juventud. Preinscripción en la web municipal.",
      eventDate: new Date("2026-04-14T09:00:00"),
      category: "generico" as const,
    },
  ];

  for (const e of events) {
    await prisma.event.upsert({
      where: { slug: e.slug },
      update: {
        title: e.title,
        titleVal: e.titleVal ?? null,
        description: e.description,
        descriptionVal: e.descriptionVal ?? null,
        eventDate: e.eventDate,
        category: e.category,
        details: e.details ?? undefined,
        status: "active",
      },
      create: {
        slug: e.slug,
        title: e.title,
        titleVal: e.titleVal ?? null,
        description: e.description,
        descriptionVal: e.descriptionVal ?? null,
        eventDate: e.eventDate,
        category: e.category,
        details: e.details ?? undefined,
        status: "active",
      },
    });
  }

  void now;
}

async function main() {
  await seedDirectoryCategories();
  await seedLocalDirectory();
  await seedNostrePoble();
  await seedArticles();
  await seedEvents();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
