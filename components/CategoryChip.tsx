import type { ArticleCategory } from "@prisma/client";
import { articleCategoryLabel, articleCategoryStyle } from "@/lib/article-categories";

type Props = {
  category: ArticleCategory;
  className?: string;
};

export function CategoryChip({ category, className = "" }: Props) {
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${articleCategoryStyle[category]} ${className}`}
    >
      {articleCategoryLabel[category]}
    </span>
  );
}
