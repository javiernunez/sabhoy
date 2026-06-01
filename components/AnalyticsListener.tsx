"use client";

import { useEffect } from "react";

type GtagFn = (command: "event", eventName: string, params?: Record<string, unknown>) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
  }
}

/**
 * Delegación de clics en enlaces con data-track-* (sustituye TrackLink client en rutas públicas).
 */
export function AnalyticsListener() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = (e.target as Element | null)?.closest<HTMLAnchorElement>("a[data-track-name]");
      if (!target) return;
      const name = target.dataset.trackName;
      if (!name || typeof window.gtag !== "function") return;
      let params: Record<string, unknown> = { page_path: window.location.pathname };
      const raw = target.dataset.trackParams;
      if (raw) {
        try {
          params = { ...params, ...JSON.parse(raw) };
        } catch {
          /* ignore malformed */
        }
      }
      window.gtag("event", name, params);
    }
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
  return null;
}
