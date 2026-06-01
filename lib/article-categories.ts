import type { ArticleCategory } from "@prisma/client";

export const ARTICLE_CATEGORIES: ArticleCategory[] = [
  "GENERAL",
  "POLITICA_LOCAL",
  "SUCESOS",
  "CULTURA",
  "DEPORTE",
  "ELECCIONES_2027",
];

export const articleCategoryLabel: Record<ArticleCategory, string> = {
  GENERAL: "General",
  POLITICA_LOCAL: "Política local",
  SUCESOS: "Sucesos",
  CULTURA: "Cultura",
  DEPORTE: "Deporte",
  ELECCIONES_2027: "Elecciones 2027",
};

export const articleCategoryStyle: Record<ArticleCategory, string> = {
  GENERAL: "bg-sab-mist text-sab-ink border-sab-sand",
  POLITICA_LOCAL: "bg-amber-50 text-amber-950 border-amber-200",
  SUCESOS: "bg-rose-50 text-rose-950 border-rose-200",
  CULTURA: "bg-violet-50 text-violet-950 border-violet-200",
  DEPORTE: "bg-emerald-50 text-emerald-950 border-emerald-200",
  ELECCIONES_2027: "bg-sab-forest/10 text-sab-forest border-sab-forest/30",
};

export function isArticleCategory(value: string | undefined): value is ArticleCategory {
  return value !== undefined && (ARTICLE_CATEGORIES as string[]).includes(value);
}
