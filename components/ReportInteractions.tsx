"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type CommentItem = {
  id: number;
  author: string | null;
  content: string;
  createdAt: string;
};

type Props = {
  reportId: number;
  initialLikeCount: number;
  initialCommentCount: number;
  locale: "es" | "val";
};

function getCopy(isVal: boolean) {
  return {
    voteFailed: isVal ? "No s'ha pogut registrar el vot." : "No se pudo registrar el voto.",
    voteDuplicate: isVal ? "Ja has votat aquesta denúncia." : "Ya has votado esta denuncia.",
    commentsLoadFailed: isVal ? "No s'han pogut carregar els comentaris." : "No se pudieron cargar los comentarios.",
    commentSendFailed: isVal ? "No s'ha pogut enviar el comentari." : "No se pudo enviar el comentario.",
    authRequired: isVal ? "Per comentar o votar, inicia sessió o registra't." : "Para comentar o votar, inicia sesión o regístrate.",
    voting: isVal ? "Votant..." : "Votando...",
    like: isVal ? "M'agrada" : "Me gusta",
    comments: isVal ? "Comentaris" : "Comentarios",
    writeComment: isVal ? "Escriu un comentari" : "Escribe un comentario",
    sending: isVal ? "Enviant..." : "Enviando...",
    sendComment: isVal ? "Enviar comentari" : "Enviar comentario",
    anonymous: isVal ? "Anònim" : "Anonimo",
    noComments: isVal ? "Encara no hi ha comentaris." : "Todavia no hay comentarios.",
  };
}

function formatDate(isoDate: string, locale: "es" | "val") {
  return new Intl.DateTimeFormat(locale === "val" ? "ca-ES" : "es-ES", { dateStyle: "medium", timeStyle: "short" }).format(new Date(isoDate));
}

export function ReportInteractions({ reportId, initialLikeCount, initialCommentCount, locale }: Readonly<Props>) {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [commentCount, setCommentCount] = useState(initialCommentCount);
  const [comments, setComments] = useState<CommentItem[] | null>(null);
  const [isSendingLike, setIsSendingLike] = useState(false);
  const [isSendingComment, setIsSendingComment] = useState(false);
  const [content, setContent] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState(false);
  const isVal = locale === "val";
  const copy = getCopy(isVal);

  async function sendLike() {
    if (isSendingLike) return;
    setIsSendingLike(true);
    const response = await fetch(`/api/reports/${reportId}/like`, { method: "POST" });
    if (response.status === 401) {
      setAuthRequired(true);
      setMessage(copy.authRequired);
      setIsSendingLike(false);
      return;
    }
    if (response.status === 409) {
      const data = (await response.json()) as { likeCount?: number };
      setLikeCount(typeof data.likeCount === "number" ? data.likeCount : likeCount);
      setMessage(copy.voteDuplicate);
      setIsSendingLike(false);
      return;
    }
    if (!response.ok) {
      setMessage(copy.voteFailed);
      setIsSendingLike(false);
      return;
    }
    const data = (await response.json()) as { likeCount: number };
    setLikeCount(data.likeCount);
    setMessage(null);
    setIsSendingLike(false);
  }

  async function loadComments() {
    const response = await fetch(`/api/reports/${reportId}/comments`);
    if (!response.ok) {
      setMessage(copy.commentsLoadFailed);
      return;
    }
    const data = (await response.json()) as CommentItem[];
    setComments(data);
    setMessage(null);
  }

  async function onSubmitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content.trim()) return;
    setIsSendingComment(true);
    const response = await fetch(`/api/reports/${reportId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!response.ok) {
      if (response.status === 401) {
        setAuthRequired(true);
        setMessage(copy.authRequired);
        setIsSendingComment(false);
        return;
      }
      setMessage(copy.commentSendFailed);
      setIsSendingComment(false);
      return;
    }
    const created = (await response.json()) as CommentItem;
    setComments((old) => [created, ...(old ?? [])]);
    setCommentCount((old) => old + 1);
    setContent("");
    setMessage(null);
    setAuthRequired(false);
    setIsSendingComment(false);
  }

  return (
    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void sendLike()}
          disabled={isSendingLike}
          className="rounded border border-blue-300 bg-white px-3 py-1 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-60"
        >
          {isSendingLike ? copy.voting : copy.like} ({likeCount})
        </button>
        <button
          type="button"
          onClick={() => void loadComments()}
          className="rounded border border-slate-300 bg-white px-3 py-1 text-sm text-slate-700 hover:bg-slate-100"
        >
          {copy.comments} ({commentCount})
        </button>
      </div>

      {comments ? (
        <div className="mt-3 space-y-3">
          <form onSubmit={onSubmitComment} className="space-y-2 rounded border border-slate-200 bg-white p-3">
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder={copy.writeComment}
              required
              rows={3}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={isSendingComment}
              className="rounded bg-slate-800 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isSendingComment ? copy.sending : copy.sendComment}
            </button>
          </form>

          <div className="space-y-2">
            {comments.length ? (
              comments.map((comment) => (
                <div key={comment.id} className="rounded border border-slate-200 bg-white p-3">
                  <p className="text-xs text-slate-500">
                    <span className="font-medium text-slate-700">{comment.author || copy.anonymous}</span>
                    {" · "}
                    {formatDate(comment.createdAt, locale)}
                  </p>
                  <p className="mt-1 text-sm text-slate-800 whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600">{copy.noComments}</p>
            )}
          </div>
        </div>
      ) : null}

      {message ? <p className="mt-2 text-sm text-rose-700">{message}</p> : null}
      {authRequired ? (
        <p className="mt-2 text-sm text-slate-700">
          <Link href="/cuenta/iniciar-sesion" className="font-semibold text-blue-700 hover:underline">
            {isVal ? "Inicia sessió" : "Inicia sesión"}
          </Link>
          {" / "}
          <Link href="/cuenta/registro" className="font-semibold text-blue-700 hover:underline">
            {isVal ? "Registra't" : "Regístrate"}
          </Link>
        </p>
      ) : null}
    </div>
  );
}
