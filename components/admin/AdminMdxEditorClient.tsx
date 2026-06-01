"use client";

import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CreateLink,
  DiffSourceToggleWrapper,
  InsertImage,
  linkDialogPlugin,
  linkPlugin,
  ListsToggle,
  listsPlugin,
  MDXEditor,
  markdownShortcutPlugin,
  type MDXEditorProps,
  diffSourcePlugin,
  headingsPlugin,
  imagePlugin,
  quotePlugin,
  Separator,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
} from "@mdxeditor/editor";
import type { Translation } from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

const mdxEditorTranslation: Translation = (key, defaultValue, interpolations) => {
  const map: Record<string, string> = {
    "toolbar.richText": "Texto enriquecido",
    "toolbar.source": "Código fuente (Markdown)",
    "toolbar.diffMode": "Modo diff",
  };
  let value = map[key] ?? defaultValue;
  if (interpolations) {
    for (const [k, v] of Object.entries(interpolations)) {
      value = value.replaceAll(`{{${k}}}`, String(v));
    }
  }
  return value;
};

function normalizeUploadUrlToMarkdown(url: string): string {
  const u = url.trim();
  if (!u.startsWith("http://") && !u.startsWith("https://")) {
    return u;
  }
  try {
    const parsed = new URL(u);
    if (parsed.pathname.startsWith("/media/")) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
  } catch {
    /* ignore */
  }
  return u;
}

async function uploadAdminImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: form, credentials: "include" });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || "Error al subir la imagen");
  }
  const data = (await res.json()) as { url: string; publicUrl?: string };
  return normalizeUploadUrlToMarkdown(data.publicUrl || data.url);
}

type AdminMdxEditorClientProps = Omit<MDXEditorProps, "plugins"> & {
  /**
   * `source`: CodeMirror en Markdown (recomendado para pegar texto con `#`, `##`, `**`…).
   * `rich-text`: WYSIWYG Lexical; pegar Markdown crudo suele mostrar los `#` literalmente.
   */
  diffSourceViewMode?: "rich-text" | "source";
};

export default function AdminMdxEditorClient({ diffSourceViewMode = "rich-text", ...props }: AdminMdxEditorClientProps) {
  return (
    <MDXEditor
      {...props}
      translation={mdxEditorTranslation}
      plugins={[
        diffSourcePlugin({ viewMode: diffSourceViewMode }),
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        imagePlugin({ imageUploadHandler: uploadAdminImage }),
        toolbarPlugin({
          toolbarContents: () => (
            <DiffSourceToggleWrapper options={["rich-text", "source"]}>
              <UndoRedo />
              <Separator />
              <BoldItalicUnderlineToggles />
              <Separator />
              <BlockTypeSelect />
              <Separator />
              <ListsToggle />
              <Separator />
              <InsertImage />
              <Separator />
              <CreateLink />
            </DiffSourceToggleWrapper>
          ),
        }),
      ]}
    />
  );
}
