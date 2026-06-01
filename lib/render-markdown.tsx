import Image from "next/image";
import { Fragment, type ReactNode } from "react";
import { sanitizeArticleBodyHtml } from "@/lib/article-body-html";
import { CSS_ARTICLE_BODY_IMAGE_WIDTH } from "@/lib/image-variants";
import { uiMediaUrl } from "@/lib/media-url";

/** Bloques saneados como HTML editorial (mezcla con párrafos MD en párrafos dobles). */
const ARTICLE_HTML_BLOCK_CLASS =
  "article-html mb-6 whitespace-normal text-inherit [&_iframe]:aspect-video [&_iframe]:my-6 [&_iframe]:w-full [&_iframe]:max-w-full [&_img]:my-6 [&_img]:w-full [&_img]:max-w-full [&_img]:object-cover [&_a]:font-semibold [&_a]:text-sab-terracotta [&_a]:underline [&_a]:decoration-sab-terracotta/50 [&_a]:underline-offset-[3px] [&_a]:transition-colors hover:[&_a]:text-sab-forest hover:[&_a]:decoration-sab-forest/60 [&_a_strong]:text-inherit [&_a_strong]:font-semibold [&_p]:mb-4 [&_p:last-child]:mb-0 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_h2]:mt-8 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-sab-ink [&_h3]:mt-7 [&_h3]:font-serif [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-sab-ink [&_h4]:mt-6 [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-sab-ink [&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-sab-terracotta [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-sab-ink/75 [&_table]:my-6 [&_table]:w-full [&_th]:border [&_th]:border-sab-sand [&_th]:bg-sab-mist [&_th]:p-2 [&_th]:text-left [&_td]:border [&_td]:border-sab-sand [&_td]:p-2 [&_hr]:my-8 [&_hr]:border-sab-sand";

function escapeHtmlAttributeValue(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeHtmlTextNode(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Bloque que empieza por etiqueta HTML (p. ej. `<p>`, `<div>`, `<iframe>`). */
function isHtmlLeadingBlock(block: string): boolean {
  return /^<[a-zA-Z]/.test(block.trim());
}

/** Contiene alguna etiqueta HTML (p. ej. mezcla “texto y <em>énfasis</em>” en un mismo párrafo). */
function blockContainsHtmlElement(block: string): boolean {
  return /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)\b/.test(block);
}

/**
 * Convierte un subconjunto de Markdown a HTML antes de sanitize, para párrafos que ya incluyen HTML.
 * No convierte *cursiva* (conflictos con asteriscos); usar `<em>` en esos bloques.
 */
/** MD dentro del texto de un enlace `[texto](url)` → HTML seguro (negrita/cursiva/imagen), sin enlaces anidados. */
function inlineMarkdownLinkInnerToHtml(textRaw: string): string {
  const parts: string[] = [];
  const pattern = /!\[([^\]]*)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null = pattern.exec(textRaw);
  while (match) {
    if (match.index > lastIndex) {
      parts.push(escapeHtmlTextNode(textRaw.slice(lastIndex, match.index)));
    }
    if (match[1] !== undefined && match[2] !== undefined) {
      const src = uiMediaUrl(match[2].trim(), { displayWidth: CSS_ARTICLE_BODY_IMAGE_WIDTH }) || match[2].trim();
      parts.push(
        `<img src="${escapeHtmlAttributeValue(src)}" alt="${escapeHtmlAttributeValue(match[1])}" class="my-6 w-full object-cover" loading="lazy" />`,
      );
    } else if (match[3] !== undefined) {
      parts.push(`<strong>${escapeHtmlTextNode(match[3])}</strong>`);
    } else if (match[4] !== undefined) {
      parts.push(`<em>${escapeHtmlTextNode(match[4])}</em>`);
    }
    lastIndex = pattern.lastIndex;
    match = pattern.exec(textRaw);
  }
  if (lastIndex < textRaw.length) {
    parts.push(escapeHtmlTextNode(textRaw.slice(lastIndex)));
  }
  return parts.join("");
}

function expandInlineMarkdownToHtmlForHybrid(block: string): string {
  let s = block;
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, altRaw: string, srcRaw: string) => {
    const src = uiMediaUrl(srcRaw.trim(), { displayWidth: CSS_ARTICLE_BODY_IMAGE_WIDTH }) || srcRaw.trim();
    const alt = escapeHtmlAttributeValue(altRaw);
    const srcEsc = escapeHtmlAttributeValue(src);
    return `<img src="${srcEsc}" alt="${alt}" class="my-6 w-full object-cover" loading="lazy" />`;
  });
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text: string, href: string) => {
    const hrefEsc = escapeHtmlAttributeValue(href.trim());
    const inner = inlineMarkdownLinkInnerToHtml(text);
    return `<a href="${hrefEsc}" target="_blank" rel="noreferrer noopener">${inner}</a>`;
  });
  s = s.replace(/\*\*([^*]+)\*\*/g, (_, inner: string) => `<strong>${escapeHtmlTextNode(inner)}</strong>`);
  return s;
}

function renderArticleImage(srcRaw: string, alt: string, key: string): ReactNode {
  const src = uiMediaUrl(srcRaw, { displayWidth: CSS_ARTICLE_BODY_IMAGE_WIDTH }) || srcRaw;
  const isRemote = /^https?:\/\//i.test(src);
  if (isRemote) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img key={key} src={src} alt={alt} className="my-6 w-full object-cover" loading="lazy" />;
  }
  return (
    <Image
      key={key}
      src={src}
      alt={alt}
      width={1200}
      height={675}
      className="my-6 w-full object-cover"
      sizes="(max-width: 42rem) 100vw, 42rem"
    />
  );
}

function parseHtmlImgTag(block: string): { src: string; alt: string } | null {
  const trimmed = block.trim();
  if (!/^<img\b[^>]*\/?>$/i.test(trimmed)) return null;

  const srcMatch = /\ssrc\s*=\s*["']([^"']+)["']/i.exec(trimmed);
  if (!srcMatch?.[1]) return null;

  const altMatch = /\salt\s*=\s*["']([^"']*)["']/i.exec(trimmed);
  const titleMatch = /\stitle\s*=\s*["']([^"']*)["']/i.exec(trimmed);
  const alt = (altMatch?.[1] || titleMatch?.[1] || "Imagen").trim();

  return { src: srcMatch[1], alt };
}

function renderInlineMarkdownWithoutLinks(text: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /!\[([^\]]*)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null = pattern.exec(text);
  while (match) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    if (match[1] !== undefined && match[2] !== undefined) {
      nodes.push(renderArticleImage(match[2], match[1] || "Imagen", `${keyBase}-img-${match.index}`));
    } else if (match[3] !== undefined) {
      nodes.push(
        <strong key={`${keyBase}-strong-${match.index}`} className="font-semibold text-slate-900">
          {match[3]}
        </strong>,
      );
    } else if (match[4] !== undefined) {
      nodes.push(
        <em key={`${keyBase}-em-${match.index}`} className="italic">
          {match[4]}
        </em>,
      );
    }
    lastIndex = pattern.lastIndex;
    match = pattern.exec(text);
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

function renderInlineMarkdown(text: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /!\[([^\]]*)\]\(([^)]+)\)|\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null = pattern.exec(text);
  while (match) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    if (match[1] !== undefined && match[2] !== undefined) {
      nodes.push(renderArticleImage(match[2], match[1] || "Imagen", `${keyBase}-img-${match.index}`));
    } else if (match[3] !== undefined && match[4] !== undefined) {
      nodes.push(
        <a
          key={`${keyBase}-link-${match.index}`}
          href={match[4]}
          className="break-words font-medium text-blue-700 underline decoration-blue-400/80 underline-offset-[3px] transition-colors hover:text-blue-900 hover:decoration-blue-600 [&_strong]:text-inherit [&_strong]:font-semibold"
          target="_blank"
          rel="noreferrer noopener"
        >
          {renderInlineMarkdownWithoutLinks(match[3], `${keyBase}-inl-${match.index}`)}
        </a>,
      );
    } else if (match[5] !== undefined) {
      nodes.push(
        <strong key={`${keyBase}-strong-${match.index}`} className="font-semibold text-slate-900">
          {match[5]}
        </strong>,
      );
    } else if (match[6] !== undefined) {
      nodes.push(
        <em key={`${keyBase}-em-${match.index}`} className="italic">
          {match[6]}
        </em>,
      );
    }
    lastIndex = pattern.lastIndex;
    match = pattern.exec(text);
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

function renderHeadingNode(key: string, level: number, text: string): ReactNode {
  if (level === 1) return <h2 key={key} className="mt-8 text-2xl font-semibold text-slate-900">{text}</h2>;
  if (level === 2) return <h3 key={key} className="mt-7 text-xl font-semibold text-slate-900">{text}</h3>;
  return <h4 key={key} className="mt-6 text-lg font-semibold text-slate-900">{text}</h4>;
}

/**
 * Párrafos, citas, encabezados #–###, imágenes MD/HTML y bloques HTML (saneados) a partir de Markdown sencillo.
 * Usado en noticias y, con la misma fuente, en fichas de comercio.
 *
 * Los encabezados en una sola línea delante de un párrafo (solo un salto, típico del WYSIWYG) se
 * reconocen leyendo la primera línea del bloque, no el bloque entero.
 *
 * HTML: los bloques separados por línea en blanco que empiezan por `<` se renderizan como HTML
 * (tras `sanitize-html`). En un mismo párrafo, si hay etiquetas HTML se aplica primero un subconjunto
 * de MD (`**`, enlaces e imágenes `![]()`); para cursiva usar `<em>` en esos fragmentos.
 */
export function renderMarkdown(content: string, keyPrefix = ""): ReactNode[] {
  const blocks = content
    .split(/\n\s*\n/g)
    .map((block) => block.trim())
    .filter(Boolean);

  const out: ReactNode[] = [];

  for (let index = 0; index < blocks.length; index++) {
    const block = blocks[index] ?? "";
    const bKey = keyPrefix ? `${keyPrefix}block-${index}` : `block-${index}`;

    if (/^>\s+/m.test(block)) {
      const quoteText = block
        .split("\n")
        .map((line) => line.replace(/^>\s?/, ""))
        .join("\n");
      out.push(
        <blockquote key={`q-${bKey}`} className="my-6 border-l-[3px] border-slate-300 pl-5 italic text-slate-700">
          <p className="whitespace-pre-line">{renderInlineMarkdown(quoteText, `q-${bKey}`)}</p>
        </blockquote>,
      );
      continue;
    }

    const lines = block.split(/\r?\n/);
    const firstLine = lines[0] ?? "";
    const headingOnFirst = /^(#{1,3})\s+(.+)$/.exec(firstLine);
    if (headingOnFirst) {
      const level = headingOnFirst[1].length;
      const text = headingOnFirst[2].trim();
      if (lines.length > 1) {
        const rest = lines
          .slice(1)
          .join("\n")
          .trim();
        const headingEl = renderHeadingNode(`h-${bKey}`, level, text);
        if (!rest) {
          out.push(headingEl);
          continue;
        }
        out.push(
          <Fragment key={`frag-h-${bKey}`}>
            {headingEl}
            {renderMarkdown(rest, `${bKey}-`)}
          </Fragment>,
        );
        continue;
      }
      out.push(renderHeadingNode(`h-${bKey}`, level, text));
      continue;
    }

    const imageOnly = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(block);
    if (imageOnly) {
      out.push(renderArticleImage(imageOnly[2], imageOnly[1] || "Imagen", `img-${bKey}`));
      continue;
    }
    const htmlImageOnly = parseHtmlImgTag(block);
    if (htmlImageOnly) {
      out.push(renderArticleImage(htmlImageOnly.src, htmlImageOnly.alt, `img-html-${bKey}`));
      continue;
    }

    if (isHtmlLeadingBlock(block)) {
      const clean = sanitizeArticleBodyHtml(block);
      if (clean) {
        out.push(
          <div
            key={`html-${bKey}`}
            className={ARTICLE_HTML_BLOCK_CLASS}
            // eslint-disable-next-line react/no-danger -- HTML editorial tras sanitize-html en servidor
            dangerouslySetInnerHTML={{ __html: clean }}
          />,
        );
      } else {
        out.push(
          <p key={`p-html-fallback-${bKey}`} className="mb-6 whitespace-pre-line">
            {renderInlineMarkdown(block, `p-${bKey}`)}
          </p>,
        );
      }
      continue;
    }

    if (blockContainsHtmlElement(block)) {
      const expanded = expandInlineMarkdownToHtmlForHybrid(block);
      const clean = sanitizeArticleBodyHtml(expanded);
      if (clean) {
        out.push(
          <div
            key={`html-mix-${bKey}`}
            className={ARTICLE_HTML_BLOCK_CLASS}
            // eslint-disable-next-line react/no-danger -- HTML editorial tras sanitize-html en servidor
            dangerouslySetInnerHTML={{ __html: clean }}
          />,
        );
      } else {
        out.push(
          <p key={`p-mix-fallback-${bKey}`} className="mb-6 whitespace-pre-line">
            {renderInlineMarkdown(block, `p-${bKey}`)}
          </p>,
        );
      }
      continue;
    }

    out.push(
      <p key={`p-${bKey}`} className="mb-6 whitespace-pre-line">
        {renderInlineMarkdown(block, `p-${bKey}`)}
      </p>,
    );
  }

  return out;
}
