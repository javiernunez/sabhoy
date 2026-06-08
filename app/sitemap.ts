import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/constants";
import { INFO_CATEGORIES } from "@/lib/info-categories";
import { SCHOOLS, isSchoolEvergreenSlug } from "@/lib/schools";
import { COMMERCE_SECTIONS } from "@/lib/comercios-sections";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const base = SITE_URL.replace(/\/$/, "");

function isDbUnavailable(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return (
    message.includes("Can't reach database server") ||
    message.includes("PrismaClientInitializationError") ||
    message.includes("ECONNREFUSED")
  );
}

async function safeFindMany<T>(query: () => Promise<T>, fallbackLabel: string, fallbackValue: T): Promise<T> {
  try {
    return await query();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error ?? "");
    // CI/build sin DB: no romper build por sitemap; devolver solo rutas estáticas.
    if (isDbUnavailable(error)) {
      console.warn(`sitemap: skipping ${fallbackLabel} because DB is unavailable`);
      return fallbackValue;
    }
    // Compatibilidad con despliegues donde aún no existe alguna tabla nueva.
    if (message.includes(fallbackLabel)) return fallbackValue;
    throw error;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, evergreenPages, commerces, associations, poblePages, videos] = await Promise.all([
    safeFindMany(
      () => prisma.article.findMany({ where: { status: "published" }, select: { slug: true, updatedAt: true } }),
      "Article",
      []
    ),
    safeFindMany(
      () => prisma.evergreenPage.findMany({ select: { slug: true, updatedAt: true } }),
      "EvergreenPage",
      []
    ),
    safeFindMany(
      () =>
        prisma.localDirectoryEntry.findMany({
          where: { kind: "COMMERCE", isActive: true },
          select: { slug: true, updatedAt: true },
        }),
      "LocalDirectoryEntry",
      []
    ),
    safeFindMany(
      () =>
        prisma.localDirectoryEntry.findMany({
          where: { kind: "ASSOCIATION", isActive: true },
          select: { slug: true, updatedAt: true },
        }),
      "LocalDirectoryEntry",
      []
    ),
    safeFindMany(
      () =>
        prisma.nostrePoblePage.findMany({
          where: { isPublished: true },
          select: { slug: true, updatedAt: true },
        }),
      "NostrePoblePage",
      []
    ),
    safeFindMany(
      () => prisma.video.findMany({ select: { slug: true, updatedAt: true } }),
      "Video",
      [],
    ),
  ]);

  const categoryHubSlugs = new Set(INFO_CATEGORIES.map((c) => c.evergreenSlug));
  const evergreenBySlug = new Map(evergreenPages.map((p) => [p.slug, p.updatedAt]));

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/noticias`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/denuncias`, changeFrequency: "weekly", priority: 0.75 },
    { url: `${base}/eventos`, changeFrequency: "weekly", priority: 0.65 },
    { url: `${base}/informacion-util`, changeFrequency: "weekly", priority: 0.78 },
    { url: `${base}/colegios`, changeFrequency: "weekly", priority: 0.74 },
    { url: `${base}/el-nostre-poble`, changeFrequency: "weekly", priority: 0.76 },
    { url: `${base}/comercios`, changeFrequency: "weekly", priority: 0.72 },
    ...COMMERCE_SECTIONS.map((section) => ({
      url: `${base}/comercios/${section.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.68,
    })),
    { url: `${base}/asociaciones`, changeFrequency: "weekly", priority: 0.72 },
    { url: `${base}/asociaciones/casales`, changeFrequency: "weekly", priority: 0.68 },
    { url: `${base}/asociaciones/clubes-deportivos`, changeFrequency: "weekly", priority: 0.68 },
    { url: `${base}/asociaciones/ampas`, changeFrequency: "weekly", priority: 0.68 },
    { url: `${base}/asociaciones/vecinales`, changeFrequency: "weekly", priority: 0.68 },
    { url: `${base}/asociaciones/ongs`, changeFrequency: "weekly", priority: 0.68 },
    { url: `${base}/politica`, changeFrequency: "daily", priority: 0.78 },
    { url: `${base}/elecciones-municipales-sab-2027`, changeFrequency: "weekly", priority: 0.82 },
    { url: `${base}/videos`, changeFrequency: "weekly", priority: 0.72 },
  ];

  const infoCategoryRoutes: MetadataRoute.Sitemap = INFO_CATEGORIES.map((cat) => ({
    url: `${base}/informacion-util/${cat.slug}`,
    lastModified: evergreenBySlug.get(cat.evergreenSlug),
    changeFrequency: "monthly",
    priority: 0.72,
  }));

  const schoolRoutes: MetadataRoute.Sitemap = SCHOOLS.map((school) => ({
    url: `${base}/colegios/${school.slug}`,
    lastModified: evergreenBySlug.get(school.evergreenSlug),
    changeFrequency: "monthly",
    priority: 0.66,
  }));

  const newsRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${base}/noticias/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: "weekly",
    priority: 0.72,
  }));

  const evergreenRoutes: MetadataRoute.Sitemap = evergreenPages
    .filter(
      (page) =>
        page.slug !== "elecciones-municipales-sab-2027" &&
        !isSchoolEvergreenSlug(page.slug) &&
        !categoryHubSlugs.has(page.slug),
    )
    .map((page) => ({
      url: `${base}/${page.slug}`,
      lastModified: page.updatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  const commerceRoutes: MetadataRoute.Sitemap = commerces.map((commerce) => ({
    url: `${base}/comercios/${commerce.slug}`,
    lastModified: commerce.updatedAt,
    changeFrequency: "weekly",
    priority: 0.68,
  }));

  const associationRoutes: MetadataRoute.Sitemap = associations.map((association) => ({
    url: `${base}/asociaciones/${association.slug}`,
    lastModified: association.updatedAt,
    changeFrequency: "weekly",
    priority: 0.68,
  }));

  const pobleRoutes: MetadataRoute.Sitemap = poblePages.map((p) => ({
    url: `${base}/el-nostre-poble/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const videoRoutes: MetadataRoute.Sitemap = videos.map((video) => ({
    url: `${base}/videos/${video.slug}`,
    lastModified: video.updatedAt,
    changeFrequency: "monthly",
    priority: 0.65,
  }));

  return [
    ...staticRoutes,
    ...infoCategoryRoutes,
    ...schoolRoutes,
    ...newsRoutes,
    ...evergreenRoutes,
    ...commerceRoutes,
    ...associationRoutes,
    ...pobleRoutes,
    ...videoRoutes,
  ];
}
