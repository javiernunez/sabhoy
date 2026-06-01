import sanitizeHtml from "sanitize-html";
import { CSS_ARTICLE_BODY_IMAGE_WIDTH } from "@/lib/image-variants";
import { uiMediaUrl } from "@/lib/media-url";

const ALLOWED_IFRAME_HOST_SUFFIXES =
  /\.(?:youtube\.com|youtube-nocookie\.com|youtu\.be|vimeo\.com|dailymotion\.com)$/i;

function iframeHostAllowsEmbeds(src: string): boolean {
  try {
    const u = new URL(src, "https://example.com");
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    const h = u.hostname.toLowerCase();
    if (h === "dai.ly") return true;
    return ALLOWED_IFRAME_HOST_SUFFIXES.test(h);
  } catch {
    return false;
  }
}

/** HTML editorial para cuerpo de noticias / evergreen (servidor → sanitize-html → dangerouslySetInnerHTML). */
const ARTICLE_BODY_SANITIZE: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "sub",
    "sup",
    "small",
    "a",
    "ul",
    "ol",
    "li",
    "h2",
    "h3",
    "h4",
    "h5",
    "blockquote",
    "cite",
    "span",
    "div",
    "section",
    "article",
    "figure",
    "figcaption",
    "img",
    "hr",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "caption",
    "iframe",
    "video",
    "source",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel", "title", "class"],
    span: ["class"],
    div: ["class"],
    section: ["class"],
    article: ["class"],
    figure: ["class"],
    figcaption: ["class"],
    p: ["class"],
    blockquote: ["class", "cite"],
    img: ["src", "alt", "title", "class", "loading", "width", "height"],
    table: ["class"],
    th: ["class", "colspan", "rowspan", "scope"],
    td: ["class", "colspan", "rowspan"],
    iframe: [
      "src",
      "title",
      "class",
      "width",
      "height",
      "loading",
      "allow",
      "allowfullscreen",
      "sandbox",
      "referrerpolicy",
    ],
    video: ["class", "controls", "muted", "loop", "playsinline", "poster", "preload", "width", "height"],
    source: ["src", "type"],
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
    iframe: (tagName, attribs) => {
      const src = attribs.src?.trim() ?? "";
      if (!iframeHostAllowsEmbeds(src)) {
        return {
          tagName: "span",
          attribs: {},
          text: "",
        };
      }
      const out = { ...attribs };
      if (!("loading" in out)) out.loading = "lazy";
      /** embeds externos: mismo origen solo https */
      const sandboxParts = ["allow-scripts", "allow-same-origin", "allow-presentation", "allow-popups"];
      if (!String(out.sandbox || "").trim()) {
        out.sandbox = sandboxParts.join(" ");
      }
      out.referrerpolicy = out.referrerpolicy || "strict-origin-when-cross-origin";
      return { tagName, attribs: out };
    },
    img: (tagName, attribs) => {
      const out: Record<string, string> = { ...attribs };
      const src = out.src?.trim() ?? "";
      if (/^javascript:/i.test(src)) {
        delete out.src;
      } else if (src) {
        const resolved = uiMediaUrl(src, { displayWidth: CSS_ARTICLE_BODY_IMAGE_WIDTH });
        if (resolved) out.src = resolved;
        if (!out.loading) out.loading = "lazy";
      }
      return { tagName, attribs: out };
    },
  },
};

export function sanitizeArticleBodyHtml(html: string): string {
  const trimmed = html.trim();
  if (!trimmed) return "";
  return sanitizeHtml(trimmed, ARTICLE_BODY_SANITIZE);
}
