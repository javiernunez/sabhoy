import sanitizeHtml from "sanitize-html";

const SANITIZE: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "a",
    "ul",
    "ol",
    "li",
    "h2",
    "h3",
    "h4",
    "blockquote",
    "span",
    "div",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel", "title"],
    span: ["class"],
    div: ["class"],
    p: ["class"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  transformTags: {
    a: (tagName, attribs) => {
      const out: Record<string, string> = { ...attribs };
      const href = out.href ?? "";
      if (/^javascript:/i.test(href)) {
        delete out.href;
      }
      if (attribs.target === "_blank") {
        out.rel = "noreferrer noopener";
      }
      return { tagName, attribs: out };
    },
  },
};

export function sanitizeEventDescriptionHtml(html: string): string {
  const trimmed = html.trim();
  if (!trimmed) return "";
  return sanitizeHtml(trimmed, SANITIZE);
}

/** Plain text para meta/description (sin etiquetas HTML). */
export function stripHtmlTagsToPlain(html: string, maxLen?: number): string {
  let text = html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
  if (maxLen != null && text.length > maxLen) {
    return text.slice(0, Math.max(0, maxLen - 1)).trimEnd() + "…";
  }
  return text;
}
