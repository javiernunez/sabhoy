import type { NextRequest } from "next/server";

function stripPublicHostPort(host: string) {
  return host.replace(/:\d+$/, "");
}

/** Ajusta hostname/proto públicos cuando Next recibe la petición vía reverse proxy (Caddy/Nginx). */
export function applyForwardedOrigin(request: NextRequest, url: URL) {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const hostHeader = request.headers.get("host")?.split(",")[0]?.trim();
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (siteUrl) {
    try {
      const parsed = new URL(siteUrl);
      url.protocol = parsed.protocol;
      url.hostname = parsed.hostname;
      url.port = parsed.port;
      return;
    } catch {
      /* fallback abajo */
    }
  }

  const publicHost = stripPublicHostPort(forwardedHost ?? hostHeader ?? "");
  if (publicHost) {
    url.hostname = publicHost;
    url.port = "";
    url.protocol = `${forwardedProto ?? "https"}:`;
    return;
  }

  if (
    url.port &&
    url.hostname !== "localhost" &&
    url.hostname !== "127.0.0.1"
  ) {
    url.port = "";
  }
}

export function redirectToPath(
  request: NextRequest,
  pathname: string,
  searchParams?: Record<string, string>,
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = searchParams ? new URLSearchParams(searchParams).toString() : "";
  applyForwardedOrigin(request, url);
  return url;
}
