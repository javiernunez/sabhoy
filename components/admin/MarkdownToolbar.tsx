"use client";

type Props = {
  textareaId: string;
};

function surroundSelection(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string,
  placeholder = "",
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.slice(start, end) || placeholder;
  const insert = `${before}${selected}${after}`;
  textarea.setRangeText(insert, start, end, "end");
  textarea.focus();
}

function insertAtLineStart(textarea: HTMLTextAreaElement, prefix: string, fallback = "") {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selection = textarea.value.slice(start, end) || fallback;
  const withPrefix = selection
    .split("\n")
    .map((line) => `${prefix}${line}`)
    .join("\n");
  textarea.setRangeText(withPrefix, start, end, "end");
  textarea.focus();
}

export function MarkdownToolbar({ textareaId }: Props) {
  function withTextarea(run: (textarea: HTMLTextAreaElement) => void) {
    const textarea = document.getElementById(textareaId);
    if (!textarea || !(textarea instanceof HTMLTextAreaElement)) return;
    run(textarea);
  }

  return (
    <div className="mb-2 flex flex-wrap gap-1">
      <button type="button" onClick={() => withTextarea((t) => surroundSelection(t, "**", "**", "negrita"))} className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700">
        Negrita
      </button>
      <button type="button" onClick={() => withTextarea((t) => surroundSelection(t, "*", "*", "cursiva"))} className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700">
        Cursiva
      </button>
      <button type="button" onClick={() => withTextarea((t) => surroundSelection(t, "[", "](https://)", "enlace"))} className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700">
        Enlace
      </button>
      <button type="button" onClick={() => withTextarea((t) => insertAtLineStart(t, "## ", "Título"))} className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700">
        Título
      </button>
      <button type="button" onClick={() => withTextarea((t) => insertAtLineStart(t, "- ", "Elemento"))} className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700">
        Lista
      </button>
      <button type="button" onClick={() => withTextarea((t) => insertAtLineStart(t, "> ", "Cita"))} className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700">
        Cita
      </button>
    </div>
  );
}
