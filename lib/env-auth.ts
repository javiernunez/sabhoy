/**
 * Secreto de firma de NextAuth (mismo en middleware, route handler y getServerSession).
 * - `npm run build` en local sin .env: define NEXTAUTH_SECRET o fallará al importar la config.
 * - En GitHub Actions, `CI` está definido; el workflow exporta el secreto, pero se deja
 *   fallback por si hiciera falta.
 */
export function getNextAuthSecret(): string {
  if (process.env.NEXTAUTH_SECRET) {
    return process.env.NEXTAUTH_SECRET;
  }
  if (process.env.CI) {
    return "ci-fallback-32b-nextauth-xxxxxxxx";
  }
  if (process.env.NODE_ENV !== "production") {
    return "dev-only-nextauth-local-xxxxxxxx";
  }
  throw new Error("Define NEXTAUTH_SECRET en .env (obligatoria en build/producción)");
}
