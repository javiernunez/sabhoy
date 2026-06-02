function decodeBasicHtmlEntities(s: string): string {
  return s
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)));
}

/**
 * Texto en una sola línea o extracto, sin sintaxis markdown ni HTML visible (cards, JSON-LD, etc.)
 */
export function stripMarkdownToPlain(s: string): string {
  return decodeBasicHtmlEntities(
    s
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/(^|\W)\*([^*]+)\*(?=\W|$)/g, "$1$2")
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/^\s*>\s?/gm, "")
      .replace(/^\s*[-*+]\s+/gm, "")
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<\/(?:p|div|h[1-6]|li|tr|td|th|blockquote)>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\n+/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}
