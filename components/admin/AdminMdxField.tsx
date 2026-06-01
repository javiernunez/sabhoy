"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { MDXEditorProps } from "@mdxeditor/editor";
import type { ReactNode } from "react";

const AdminMdxEditorClient = dynamic(() => import("./AdminMdxEditorClient"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[240px] rounded border border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500">Cargando editor…</div>
  ),
});

type Base = {
  minHeight?: number;
  label?: string;
  className?: string;
  /** Ver `AdminMdxEditorClient` — `source` para pegar Markdown largo (titulares `#`, etc.). */
  diffSourceViewMode?: "rich-text" | "source";
} & Pick<MDXEditorProps, "placeholder">;

/** `name` + `defaultValue` y envío por FormData. Al crear un registro nuevo, sube `key` en el padre. */
export type UncontrolledMdxFieldProps = Base & {
  name: string;
  defaultValue?: string;
  required?: boolean;
  value?: never;
  onValueChange?: never;
};

/** Estado React (formularios con `fetch` JSON). */
export type ControlledMdxFieldProps = Base & {
  name?: never;
  value: string;
  onValueChange: (markdown: string) => void;
  required?: never;
  /** Sube tras `setState` al vaciar el formulario. */
  editorKey?: number;
};

function AdminMdxFieldControlled({
  value,
  onValueChange,
  editorKey = 0,
  minHeight = 300,
  label,
  className,
  placeholder,
  diffSourceViewMode,
}: ControlledMdxFieldProps) {
  return (
    <div className={className}>
      {label ? <span className="mb-1 block text-sm text-slate-600">{label}</span> : null}
      <div
        className="mdxeditor-admin-wrap overflow-hidden rounded border border-slate-300 bg-white text-slate-800 shadow-sm"
        style={{ minHeight }}
      >
        <AdminMdxEditorClient
          key={`mdx-ctl-${editorKey}`}
          className="mdxeditor-admin min-h-0"
          contentEditableClassName="min-h-[180px] p-3 text-sm focus:outline-none"
          markdown={value}
          onChange={onValueChange}
          placeholder={placeholder as ReactNode}
          diffSourceViewMode={diffSourceViewMode}
        />
      </div>
    </div>
  );
}

function AdminMdxFieldUncontrolled({
  name,
  defaultValue = "",
  required,
  minHeight = 300,
  label,
  className,
  placeholder,
  diffSourceViewMode,
}: UncontrolledMdxFieldProps) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className={className}>
      {label ? <span className="mb-1 block text-sm text-slate-600">{label}</span> : null}
      <input type="hidden" name={name} value={value} required={required} />
      <div
        className="mdxeditor-admin-wrap overflow-hidden rounded border border-slate-300 bg-white text-slate-800 shadow-sm"
        style={{ minHeight }}
      >
        <AdminMdxEditorClient
          className="mdxeditor-admin min-h-0"
          contentEditableClassName="min-h-[220px] p-3 text-sm focus:outline-none"
          markdown={value}
          onChange={setValue}
          placeholder={placeholder as ReactNode}
          diffSourceViewMode={diffSourceViewMode}
        />
      </div>
    </div>
  );
}

export function AdminMdxField(props: UncontrolledMdxFieldProps | ControlledMdxFieldProps) {
  if ("onValueChange" in props && props.onValueChange) {
    return <AdminMdxFieldControlled {...props} />;
  }
  return <AdminMdxFieldUncontrolled {...props} />;
}
