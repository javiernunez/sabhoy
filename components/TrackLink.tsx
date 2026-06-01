"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

type GtagFn = (command: "event", eventName: string, params?: Record<string, unknown>) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
  }
}

type TrackLinkProps = ComponentProps<typeof Link> & {
  eventName?: string;
  eventParams?: Record<string, unknown>;
};

export function TrackLink({ eventName = "cta_click", eventParams, onClick, ...props }: TrackLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        if (typeof globalThis.window !== "undefined" && typeof globalThis.window.gtag === "function") {
          globalThis.window.gtag("event", eventName, {
            page_path: globalThis.window.location.pathname,
            ...eventParams,
          });
        }
        onClick?.(event);
      }}
    />
  );
}
