"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

export type ArticleCommentItem = {
  id: number;
  author: string | null;
  content: string;
  createdAt: string;
};

type Props = {
  slug: string;
  locale: "es" | "val";
  initialComments: ArticleCommentItem[];
};

function copy(isVal: boolean) {
  return {
    heading: isVal ? "Comentaris" : "Comentarios",
    intro: isVal
      ? "Opina amb respecte. Cal compte per publicar."
      : "Opina con respeto. Necesitas cuenta para publicar.",
    placeholder: isVal ? "Escriu el teu comentari" : "Escribe tu comentario",
    send: isVal ? "Publicar comentari" : "Publicar comentario",
    sending: isVal ? "Publicant..." : "Publicando...",
    none: isVal ? "Encara no hi ha comentaris. Sigues el primer." : "Todavía no hay comentarios. Sé el primero.",
    fail: isVal ? "No s'ha pogut enviar el comentari." : "No se pudo enviar el comentario.",
    authHint: isVal ? "Per comentar, entra al teu compte." : "Para comentar, inicia sesión en tu cuenta.",
    login: isVal ? "Iniciar sessió" : "Iniciar sesión",
    register: isVal ? "Registrar-se" : "Registrarse",
    anonymous: isVal ? "Usuari" : "Usuario",
  };
}

function formatDate(isoDate: string, loc: "es" | "val") {
  return new Intl.DateTimeFormat(loc === "val" ? "ca-ES" : "es-ES", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(isoDate)
  );
}

export function ArticleCommentsSection({ slug, locale, initialComments }: Readonly<Props>) {
  const isVal = locale === "val";
  const t = useMemo(() => copy(isVal), [isVal]);
  const [comments, setComments] = useState<ArticleCommentItem[]>(initialComments);
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState(false);

  const callbackPath = `/noticias/${encodeURIComponent(slug)}`;
  const loginHref = `/cuenta/iniciar-sesion?callbackUrl=${encodeURIComponent(callbackPath)}`;
  const registerHref = `/cuenta/registro?callbackUrl=${encodeURIComponent(callbackPath)}`;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    setAuthRequired(false);

    const response = await fetch(`/api/articles/${encodeURIComponent(slug)}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ content }),
    });

    if (response.status === 401) {
      setAuthRequired(true);
      setBusy(false);
      return;
    }

    if (!response.ok) {
      setMessage(t.fail);
      setBusy(false);
      return;
    }

    const created = (await response.json()) as ArticleCommentItem;
    setComments((prev) => [{ ...created, createdAt: String(created.createdAt) }, ...prev]);
    setContent("");
    setBusy(false);
  }

  return (
    <section className="mt-12 border-t border-slate-200 pt-8" aria-labelledby="article-comments-heading">
      <h2 id="article-comments-heading" className="font-serif text-xl font-bold text-slate-900">
        {t.heading}{" "}
        <span className="text-base font-normal text-slate-500">({comments.length})</span>
      </h2>
      <p className="mt-1 text-sm text-slate-600">{t.intro}</p>

      <form onSubmit={(e) => void onSubmit(e)} className="mt-4 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t.placeholder}
          required
          rows={4}
          maxLength={2000}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900 disabled:opacity-60"
        >
          {busy ? t.sending : t.send}
        </button>
      </form>

      {message ? <p className="mt-2 text-sm text-rose-700">{message}</p> : null}
      {authRequired ? (
        <p className="mt-2 text-sm text-slate-700">
          {t.authHint}{" "}
          <Link href={loginHref} className="font-semibold text-sab-terracotta hover:underline">
            {t.login}
          </Link>
          {" · "}
          <Link href={registerHref} className="font-semibold text-sab-terracotta hover:underline">
            {t.register}
          </Link>
        </p>
      ) : null}

      <ul className="mt-6 space-y-3">
        {comments.length === 0 ? (
          <li className="text-sm text-slate-600">{t.none}</li>
        ) : (
          comments.map((c) => (
            <li key={c.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-500">
                <span className="font-medium text-slate-700">{c.author || t.anonymous}</span>
                {" · "}
                {formatDate(c.createdAt, locale)}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{c.content}</p>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
