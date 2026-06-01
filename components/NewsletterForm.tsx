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
      ? "w-full rounded-lg border border-sab-sand bg-white px-3 py-2 text-sm text-sab-ink shadow-sm placeholder:text-sab-ink/40"
      : "w-full rounded-lg border border-white/20 bg-sab-forest-light/50 px-3 py-2 text-sm text-sab-cream placeholder:text-sab-cream/50";
  const messageClass =
    appearance === "light" ? "w-full text-xs text-sab-ink/65 sm:ml-0" : "w-full text-xs text-sab-cream/75 sm:ml-0";

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
        className="sab-btn-primary shrink-0 disabled:opacity-60"
      >
        {loading ? "…" : t("newsletter.subscribe")}
      </button>
      {message ? <p className={messageClass}>{message}</p> : null}
    </form>
  );
}
