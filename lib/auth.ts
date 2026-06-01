import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

/**
 * Sustituye el antiguo comprobar-cookie-ADMIN_PASSWORD.
 * Admin = cuenta con rol en BBDD, alineada con `ADMIN_EMAILS` al registro o al iniciar sesion.
 */
export async function isAdminUser() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "ADMIN";
}

export async function getSessionOrNull() {
  return getServerSession(authOptions);
}
