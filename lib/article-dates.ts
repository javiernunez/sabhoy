/** Parse `<input type="datetime-local">` or ISO string from admin/API. */
export function parsePublishedAtInput(raw: unknown): Date | undefined {
  if (raw == null) return undefined;
  const s = String(raw).trim();
  if (!s) return undefined;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return undefined;
  return d;
}

/** Value for `<input type="datetime-local">` in local timezone. */
export function toDatetimeLocalValue(date: Date): string {
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function getArticlePublishedAt(article: { publishedAt: Date; createdAt?: Date }): Date {
  return article.publishedAt ?? article.createdAt ?? new Date();
}
