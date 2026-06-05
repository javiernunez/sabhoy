"use client";

import { useEffect } from "react";

export function NewsletterConfirmAnalytics() {
  useEffect(() => {
    if (typeof globalThis.window !== "undefined" && typeof globalThis.window.gtag === "function") {
      globalThis.window.gtag("event", "newsletter_subscribe", {
        source: "email_confirm",
        page_path: globalThis.window.location.pathname,
      });
    }
  }, []);

  return null;
}
