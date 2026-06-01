"use client";

import { FormEvent, useId, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { getTranslator } from "@/lib/i18n";

type NewsletterFormProps = {
  locale: Locale;
  /** `dark`: pie (fondo oscuro). `light`: tarjeta en columnas claras. */
  appearance?: "dark" | "light";
  source?: string;
  defaultEmail?: string | null;
};

type GtagFn = (command: "event", eventName: string, params?: Record<string, unknown>) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
  }
}

export function NewsletterForm({
  locale,
  appearance = "dark",
  source = "unknown",
  defaultEmail = "",
}: Readonly<NewsletterFormProps>) {
  const t = getTranslator(locale);
  const inputId = useId();
  const [email, setEmail] = useState(defaultEmail || "");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
      credentials: "include",
    });
    setLoading(false);
    const j = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string; error?: string };
    if (!res.ok) {
      setMessage(j.error || t("newsletter.error"));
      return;
    }

    if (typeof globalThis.window !== "undefined" && typeof globalThis.window.gtag === "function") {
      globalThis.window.gtag("event", "newsletter_subscribe", {
        source,
        page_path: globalThis.window.location.pathname,
      });
    }

    setMessage(j.message || t("newsletter.success"));
  }

  const inputClass =
    appearance === "light"
      ? "w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400"
      : "w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400";
  const messageClass = appearance === "light" ? "w-full text-xs text-slate-600 sm:ml-0" : "w-full text-xs text-slate-300 sm:ml-0";

  return (
    <form onSubmit={onSubmit} className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end">
      <div className="min-w-0 flex-1">
        <label className="sr-only" htmlFor={inputId}>
          {t("newsletter.emailLabel")}
        </label>
        <input
          id={inputId}
          type="email"
          required
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="shrink-0 rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"
      >
        {loading ? "…" : t("newsletter.subscribe")}
      </button>
      {message ? <p className={messageClass}>{message}</p> : null}
    </form>
  );
}
