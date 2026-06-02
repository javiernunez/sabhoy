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
  POLITICA_LOCAL: "bg-blue-50 text-blue-950 border-blue-200",
  SUCESOS: "bg-slate-100 text-slate-900 border-slate-200",
  CULTURA: "bg-sky-50 text-sky-950 border-sky-200",
  DEPORTE: "bg-indigo-50 text-indigo-950 border-indigo-200",
  ELECCIONES_2027: "bg-blue-100 text-blue-900 border-blue-300",
};

export function isArticleCategory(value: string | undefined): value is ArticleCategory {
  return value !== undefined && (ARTICLE_CATEGORIES as string[]).includes(value);
}
