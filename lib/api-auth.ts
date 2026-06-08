import { timingSafeEqual } from "node:crypto";

/**
 * Token para integraciones (scripts, n8n, etc.): `NEWS_API_TOKEN` en .env.
 * Cabeceras aceptadas:
 * - `Authorization: Bearer <token>`
 * - `X-API-Key: <token>`
 */
export function isNewsWriteAuthorized(request: Request): boolean {
  const expected = process.env.NEWS_API_TOKEN;
  return isRequestAuthorizedByToken(request, expected);
}

/**
 * Token para integraciones de eventos (n8n, scrapers, etc.): `EVENTS_API_TOKEN` en .env.
 * Cabeceras aceptadas:
 * - `Authorization: Bearer <token>`
 * - `X-API-Key: <token>`
 */
export function isEventsWriteAuthorized(request: Request): boolean {
  if (isRequestAuthorizedByToken(request, process.env.EVENTS_API_TOKEN)) return true;
  return isRequestAuthorizedByToken(request, process.env.NEWS_API_TOKEN);
}

function isRequestAuthorizedByToken(request: Request, expected: string | undefined): boolean {
  if (!expected || expected.length < 16) {
    return false;
  }

  const bearer = request.headers.get("authorization");
  if (bearer?.toLowerCase().startsWith("bearer ")) {
    const token = bearer.slice(7).trim();
    if (safeEqualToken(token, expected)) return true;
  }

  const apiKey = request.headers.get("x-api-key");
  if (apiKey && safeEqualToken(apiKey.trim(), expected)) {
    return true;
  }

  return false;
}

function safeEqualToken(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, "utf8");
    const bufB = Buffer.from(b, "utf8");
    if (bufA.length !== bufB.length) {
      return false;
    }
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}
