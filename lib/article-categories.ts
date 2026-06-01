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
  GENERAL: "bg-slate-100 text-slate-800 border-slate-200",
  POLITICA_LOCAL: "bg-amber-50 text-amber-900 border-amber-200",
  SUCESOS: "bg-rose-50 text-rose-900 border-rose-200",
  CULTURA: "bg-violet-50 text-violet-900 border-violet-200",
  DEPORTE: "bg-sky-50 text-sky-900 border-sky-200",
  ELECCIONES_2027: "bg-blue-50 text-blue-900 border-blue-300",
};

export function isArticleCategory(value: string | undefined): value is ArticleCategory {
  return value !== undefined && (ARTICLE_CATEGORIES as string[]).includes(value);
}
