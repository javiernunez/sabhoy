"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";

export type SerializedReview = Readonly<{
  id: number;
  score: number;
  comment: string | null;
  author: string | null;
  createdAt: string;
}>;

type Props = Readonly<{
  entryId: number;
  isVal: boolean;
  callbackPath: string;
  initialReviews: SerializedReview[];
  ratingAverage: number;
  ratingCount: number;
  /** Si el usuario ya tiene sesión, ocultamos el aviso opcional de login. */
  isAuthenticated?: boolean;
}>;

function StarRow({ score }: Readonly<{ score: number }>) {
  return (
    <span className="text-base leading-none text-amber-500" aria-hidden>
      {"★".repeat(score)}
      <span className="text-slate-300">{"★".repeat(5 - score)}</span>
    </span>
  );
}

export function DirectoryEntryReviewsSection({
  entryId,
  isVal,
  callbackPath,
  initialReviews,
  ratingAverage,
  ratingCount,
  isAuthenticated = false,
}: Props) {
  const router = useRouter();
  const formId = useId();
  const [scoreDraft, setScoreDraft] = useState(5);
  const [authorDraft, setAuthorDraft] = useState("");
  const [commentDraft, setCommentDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successFlash, setSuccessFlash] = useState(false);

  const hasReviews = ratingCount > 0;
  const firstCta = isVal ? "Sigues qui valori primer!" : "¡Sé el primero en valorar!";
  const summaryLine = isVal
    ? `${ratingCount} ${ratingCount === 1 ? "valoració" : "valoracions"} · mitjana ${ratingAverage.toFixed(1)}/5`
    : `${ratingCount} ${ratingCount === 1 ? "opinión" : "opiniones"} · media ${ratingAverage.toFixed(1)}/5`;
  const subtitle = hasReviews ? summaryLine : firstCta;

  const loginHref =
    `/cuenta/iniciar-sesion?callbackUrl=${encodeURIComponent(callbackPath)}` as const;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSuccessFlash(false);
    try {
      const res = await fetch(`/api/local-directory/${entryId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: scoreDraft,
          author: authorDraft.trim() || null,
          comment: commentDraft.trim() || null,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error ?? (isVal ? "No s'ha pogut enviar la valoració." : "No se pudo enviar la valoración."));
      }
      setAuthorDraft("");
      setCommentDraft("");
      setScoreDraft(5);
      setSuccessFlash(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-6">
      <SectionHeader title={isVal ? "Opinions d’usuaris" : "Opiniones de usuarios"} subtitle={subtitle} />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {!hasReviews ? (
          <p className="mb-6 text-sm text-slate-600">{isVal ? "Encara no hi ha ressenyes publicades." : "Aún no hay reseñas publicadas."}</p>
        ) : (
          <ul className="mb-8 space-y-5">
            {initialReviews.map((r) => (
              <li key={r.id} className="border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                <div className="flex flex-wrap items-center gap-2 gap-y-1">
                  <StarRow score={r.score} />
                  <span className="sr-only">
                    {r.score}/{5}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(r.createdAt).toLocaleDateString(isVal ? "ca-ES" : "es-ES", {
                      dateStyle: "medium",
                    })}
                  </span>
                  {r.author ? (
                    <span className="text-sm font-medium text-slate-700">· {r.author}</span>
                  ) : null}
                </div>
                {r.comment ? (
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{r.comment}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}

        <form id={formId} onSubmit={onSubmit} className="border-t border-slate-100 pt-6">
          <p className="text-sm font-semibold text-slate-900">{isVal ? "Deixa la teua valoració" : "Deja tu valoración"}</p>
          <p className="mt-1 text-sm text-slate-600">{isVal ? "No cal iniciar sessió." : "No es necesario iniciar sesión."}</p>

          <div className="mt-4">
            <fieldset className="min-w-0 border-0 p-0">
              <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">{isVal ? "Puntuació" : "Puntuación"}</legend>
              <div className="mt-2 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={scoreDraft === n}
                  onClick={() => setScoreDraft(n)}
                  className={`rounded-md px-2 py-1 text-xl transition hover:bg-amber-50 ${
                    n <= scoreDraft ? "text-amber-500" : "text-slate-200"
                  }`}
                >
                  ★
                  <span className="sr-only">{n}</span>
                </button>
              ))}
              <span className="ml-2 text-sm text-slate-600">
                {`${scoreDraft}/5`}
              </span>
            </div>
            </fieldset>
          </div>

          <label className="mt-5 block">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{isVal ? "Nom (opcional)" : "Nombre (opcional)"}</span>
            <input
              type="text"
              maxLength={80}
              value={authorDraft}
              onChange={(e) => setAuthorDraft(e.target.value)}
              className="mt-1 block w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-blue-500/30 focus:border-blue-600 focus:ring-2"
              autoComplete="nickname"
              placeholder={isVal ? "Com vols que et citen" : "Cómo quieres aparecer"}
            />
          </label>

          <label className="mt-4 block">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{isVal ? "Comentari (opcional)" : "Comentario (opcional)"}</span>
            <textarea
              maxLength={500}
              rows={4}
              value={commentDraft}
              onChange={(e) => setCommentDraft(e.target.value)}
              className="mt-1 block w-full max-w-2xl rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-blue-500/30 focus:border-blue-600 focus:ring-2"
              placeholder={isVal ? "Explica breument la teua experiència." : "Cuenta brevemente tu experiencia."}
            />
          </label>

          {error ? <p className="mt-4 rounded-lg bg-red-600/10 px-3 py-2 text-sm text-red-800">{error}</p> : null}
          {successFlash ? (
            <p className="mt-4 rounded-lg bg-blue-600/10 px-3 py-2 text-sm text-blue-900">
              {isVal ? "Gràcies! La valoració s’ha publicat." : "¡Gracias! Tu valoración se ha publicado."}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="mt-5 inline-flex items-center justify-center rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:opacity-70"
          >
            {busy
              ? isVal
                ? "Enviant…"
                : "Enviando…"
              : isVal
                ? "Publicar valoració"
                : "Publicar valoración"}
          </button>
        </form>

        {isAuthenticated ? null : (
          <p className="mt-5 text-sm text-slate-600">
            {isVal
              ? "Si tens compte, pots iniciar sessió per recuperar aquesta pantalla més ràpid (opcional): "
              : "Si tienes cuenta, puedes iniciar sesión para volver a esta página con un clic (opcional): "}
            <Link href={loginHref} className="font-semibold text-blue-800 underline-offset-2 hover:underline">
              {isVal ? "Iniciar sessió" : "Iniciar sesión"}
            </Link>
            .
          </p>
        )}
      </div>
    </section>
  );
}
