"use client";

import { FormEvent, useState } from "react";
import { AdminMdxField } from "@/components/admin/AdminMdxField";
import { stripMarkdownToPlain } from "@/lib/strip-markdown";

type Props = {
  entryId: number;
};

export function CommerceReviewForm({ entryId }: Props) {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [commentKey, setCommentKey] = useState(0);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice(null);

    const form = new FormData(event.currentTarget);
    const commentPlain = stripMarkdownToPlain(comment);
    if (commentPlain.length > 500) {
      setNotice("El comentario (sin formato) no puede superar 500 caracteres.");
      setBusy(false);
      return;
    }
    const payload = {
      score: Number(form.get("score")),
      author: String(form.get("author") || "").trim() || null,
      comment: comment.trim() || null,
    };

    const response = await fetch(`/api/local-directory/${entryId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setNotice("No se pudo enviar tu valoración.");
      setBusy(false);
      return;
    }

    event.currentTarget.reset();
    setComment("");
    setCommentKey((k) => k + 1);
    setNotice("Gracias, tu valoración se ha publicado.");
    setBusy(false);
    window.location.reload();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Valora este comercio</h3>
      {notice ? <p className="text-sm text-sab-terracotta">{notice}</p> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm text-slate-700">
          Puntuación
          <select
            name="score"
            required
            defaultValue="5"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="5">5 - Excelente</option>
            <option value="4">4 - Muy bien</option>
            <option value="3">3 - Correcto</option>
            <option value="2">2 - Mejorable</option>
            <option value="1">1 - Malo</option>
          </select>
        </label>
        <label className="text-sm text-slate-700">
          Nombre (opcional)
          <input name="author" maxLength={80} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm" />
        </label>
      </div>
      <div>
        <AdminMdxField
          value={comment}
          onValueChange={setComment}
          editorKey={commentKey}
          minHeight={180}
          label="Comentario (opcional, máx. 500 caracteres de texto al publicar)"
        />
      </div>
      <button disabled={busy} type="submit" className="rounded bg-sab-terracotta px-4 py-2 text-sm font-semibold text-white">
        {busy ? "Enviando..." : "Enviar valoración"}
      </button>
    </form>
  );
}
