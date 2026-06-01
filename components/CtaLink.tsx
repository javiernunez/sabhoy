import Link from "next/link";
import type { ComponentProps } from "react";

type CtaLinkProps = ComponentProps<typeof Link> & {
  trackName?: string;
  trackParams?: Record<string, unknown>;
};

/** Enlace servidor con atributos para AnalyticsListener (sin hidratar por enlace). */
export function CtaLink({ trackName = "cta_click", trackParams, children, ...props }: CtaLinkProps) {
  return (
    <Link
      {...props}
      data-track-name={trackName}
      {...(trackParams ? { "data-track-params": JSON.stringify(trackParams) } : {})}
    >
      {children}
    </Link>
  );
}
